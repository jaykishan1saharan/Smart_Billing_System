const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new customer
router.post('/', async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
            [name, phone, address]
        );
        res.status(201).json({ id: result.insertId, message: 'Customer created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update customer
router.put('/:id', async (req, res) => {

    const { id } = req.params;
    const { name, phone, address } = req.body;

    try {

        await db.query(
            'UPDATE customers SET name=?, phone=?, address=? WHERE customer_id=?',
            [name, phone, address, id]
        );

        res.json({
            message: 'Customer updated successfully'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

// DELETE customer
router.delete('/:id', async (req, res) => {

    const { id } = req.params;

    try {

        await db.query(
            'DELETE FROM customers WHERE customer_id=?',
            [id]
        );

        res.json({
            message: 'Customer deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;
