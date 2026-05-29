const express = require('express');
const router = express.Router();
const db = require('../db');

// POST a new sale (Transaction)
router.post('/', async (req, res) => {
    const { customer_id, total_amount, tax, discount, items } = req.body;
    
    // Start a transaction
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into sales table
        const [saleResult] = await connection.query(
            'INSERT INTO sales (customer_id, total_amount, tax, discount) VALUES (?, ?, ?, ?)',
            [customer_id || null, total_amount, tax, discount]
        );
        const saleId = saleResult.insertId;

        // 2. Insert into sales_items and update product quantities
        for (let item of items) {
            await connection.query(
                'INSERT INTO sales_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [saleId, item.product_id, item.quantity, item.price]
            );

            // Update inventory
            await connection.query(
                'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.status(201).json({ sale_id: saleId, message: 'Sale completed successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
