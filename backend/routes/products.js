const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new product
router.post('/', async (req, res) => {
    const { product_name, category, price, quantity, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (product_name, category, price, quantity, status) VALUES (?, ?, ?, ?, ?)',
            [product_name, category, price, quantity, status || 'active']
        );
        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update a product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { product_name, category, price, quantity, status } = req.body;
    try {
        await db.query(
            'UPDATE products SET product_name=?, category=?, price=?, quantity=?, status=? WHERE product_id=?',
            [product_name, category, price, quantity, status, id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE product_id=?', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RESTOCK PRODUCT
router.put('/restock/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const DEFAULT_STOCK = 30;

    await db.query(
      'UPDATE products SET quantity = ? WHERE product_id = ?',
      [DEFAULT_STOCK, productId]
    );
    res.json({
      message: 'Product restocked successfully'
    });

  } catch (error) {
    console.error("Restock Error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
