const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool, checkConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Student and Resource metadata
const studentInfo = {
  name: process.env.STUDENT_NAME || "Nadila Lailany Numai",
  nim: process.env.STUDENT_NIM || "2411523025"
};

const resourceConfig = {
  name: "skincare",
  label: "Data Skincare",
  description: "Aplikasi untuk mengelola data produk skincare"
};

const schemaFields = [
  { name: "name", label: "Nama Produk", type: "text", required: true, showInTable: true },
  { name: "brand", label: "Merek/Brand", type: "text", required: true, showInTable: true },
  { name: "type", label: "Tipe Produk", type: "text", required: true, showInTable: true },
  { name: "price", label: "Harga (Rp)", type: "number", required: true, showInTable: true },
  { name: "stock", label: "Stok", type: "number", required: false, showInTable: true }
];

const endpointsConfig = {
  list: "/skincare",
  detail: "/skincare/{id}",
  create: "/skincare",
  update: "/skincare/{id}",
  delete: "/skincare/{id}"
};

// Root route (for basic connection testing)
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to Tugas Besar Cloud Computing 2026 REST API",
    student: studentInfo,
    resource: resourceConfig
  });
});

// GET /health
app.get('/health', async (req, res) => {
  const dbConnected = await checkConnection();
  if (dbConnected) {
    res.status(200).json({
      status: "success",
      message: "Backend is running",
      database: "connected",
      student: studentInfo
    });
  } else {
    res.status(200).json({
      status: "error",
      message: "Backend is running, but database is not connected",
      database: "disconnected",
      student: studentInfo
    });
  }
});

// GET /schema
app.get('/schema', (req, res) => {
  res.status(200).json({
    student: studentInfo,
    resource: resourceConfig,
    fields: schemaFields,
    endpoints: endpointsConfig
  });
});

// GET /skincare (with search and list compatibility)
app.get('/skincare', async (req, res) => {
  try {
    const searchQuery = req.query.search;
    let query = 'SELECT * FROM skincare ORDER BY id DESC';
    let params = [];

    if (searchQuery) {
      query = `
        SELECT * FROM skincare 
        WHERE name LIKE ? OR brand LIKE ? OR type LIKE ? 
        ORDER BY id DESC
      `;
      const likeQuery = `%${searchQuery}%`;
      params = [likeQuery, likeQuery, likeQuery];
    }

    const [rows] = await pool.query(query, params);
    
    // Provide both 'data' for the Tugas Besar specifications and 'items' for frontend compatibility
    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully",
      data: rows,
      items: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching skincare data:', error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve data from database",
      error: error.message
    });
  }
});

// GET /skincare/:id
app.get('/skincare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM skincare WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found"
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching product detail:', error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve product detail",
      error: error.message
    });
  }
});

// POST /skincare
app.post('/skincare', async (req, res) => {
  try {
    const { name, brand, type, price, stock } = req.body;
    
    if (!name || !brand || !type || price === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields (name, brand, type, price)"
      });
    }

    const [result] = await pool.query(
      'INSERT INTO skincare (name, brand, type, price, stock) VALUES (?, ?, ?, ?, ?)',
      [name, brand, type, parseInt(price), parseInt(stock || 0)]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query('SELECT * FROM skincare WHERE id = ?', [insertedId]);

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to create data",
      error: error.message
    });
  }
});

// PUT /skincare/:id
app.put('/skincare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, type, price, stock } = req.body;

    if (!name || !brand || !type || price === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields (name, brand, type, price)"
      });
    }

    const [result] = await pool.query(
      'UPDATE skincare SET name = ?, brand = ?, type = ?, price = ?, stock = ? WHERE id = ?',
      [name, brand, type, parseInt(price), parseInt(stock || 0), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found to update"
      });
    }

    const [rows] = await pool.query('SELECT * FROM skincare WHERE id = ?', [id]);

    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to update data",
      error: error.message
    });
  }
});

// DELETE /skincare/:id
app.delete('/skincare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM skincare WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found to delete"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to delete data",
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend REST API server is running at http://localhost:${PORT}`);
});
