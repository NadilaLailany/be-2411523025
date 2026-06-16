-- Database Initialization Script
CREATE DATABASE IF NOT EXISTS db_2411523025;
USE db_2411523025;

-- Create the skincare table
CREATE TABLE IF NOT EXISTS skincare (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
INSERT INTO skincare (name, brand, type, price, stock) VALUES
('Hydrating Serum', 'Somethinc', 'Serum', 120000, 50),
('C-Clarifying Toner', 'Avoskin', 'Toner', 145000, 30),
('Ceramide Moisturizer', 'Skintific', 'Moisturizer', 169000, 100),
('Sunscreen SPF 50', 'Azarine', 'Sunscreen', 65000, 75);
