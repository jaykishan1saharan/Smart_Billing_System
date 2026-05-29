const express = require('express');
const router = express.Router();
const db = require('../db');

// Get today's total sales
router.get('/today-sales', async (req, res) => {
    try {

        const [rows] = await db.query(`
      SELECT 
        IFNULL(SUM(total_amount), 0) AS totalSales
      FROM sales
      WHERE DATE(date) = CURDATE()
    `);

        res.json({
            totalSales: rows[0].totalSales
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).json({
            error: error.message
        });

    }
});

// Get total orders today
router.get('/today-orders', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS totalOrders
      FROM sales
      WHERE DATE(date) = CURDATE()
    `);
        res.json({
            totalOrders: rows[0].totalOrders
        });

    } catch (error) {
        console.error("Orders Error:", error);
        res.status(500).json({
            error: error.message
        });

    }

});

// Get total products count
router.get('/total-products', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT COUNT(*) AS totalProducts
      FROM products
    `);
        res.json({
            totalProducts: rows[0].totalProducts
        });

    } catch (error) {
        console.error("Products Count Error:", error);
        res.status(500).json({
            error: error.message
        });
    }

});

// Get recent transactions
router.get('/recent-transactions', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        s.sale_id,
        s.total_amount,
        s.date,
        c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c 
        ON s.customer_id = c.customer_id
      ORDER BY s.date DESC
      LIMIT 5
    `);
        res.json(rows);

    } catch (error) {
        console.error("Recent Transactions Error:", error);
        res.status(500).json({
            error: error.message
        });
    }

});

// Get low stock count
router.get('/low-stock', async (req, res) => {

  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS lowStockCount
      FROM products
      WHERE quantity <= 5
    `);
    res.json(rows[0]);

  } catch (error) {
    console.error("Low Stock Error:", error);
    res.status(500).json({
      error: error.message
    });
  }

});

// Get low stock product list
router.get('/low-stock-products', async (req, res) => {

  try {
    const [rows] = await db.query(`
      SELECT 
        product_id,
        product_name,
        category,
        quantity
      FROM products
      WHERE quantity <= 5
      ORDER BY quantity ASC
      LIMIT 5
    `);
    res.json(rows);

  } catch (error) {
    console.error("Low Stock List Error:", error);
    res.status(500).json({
      error: error.message
    });
  }

});

// Get monthly revenue
router.get('/monthly-revenue', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%b') AS name,
        SUM(total_amount) AS total
      FROM sales
      GROUP BY 
        YEAR(date),
        MONTH(date),
        DATE_FORMAT(date, '%b')
      ORDER BY 
        YEAR(date),
        MONTH(date)
    `);
        res.json(rows);

    } catch (error) {
        console.error("Monthly Revenue Error:", error);
        res.status(500).json([]);
    }

});

// Get top selling products
router.get('/top-products', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        p.product_name AS name,
        SUM(si.quantity) AS sales
      FROM sales_items si
      JOIN products p 
        ON si.product_id = p.product_id
      GROUP BY 
        si.product_id,
        p.product_name
      ORDER BY 
        sales DESC
      LIMIT 5
    `);
        res.json(rows);

    } catch (error) {
        console.error("Top Products Error:", error);
        res.status(500).json([]);
    }

});

// Get sales report
router.get('/sales-report', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        s.sale_id,
        c.name AS customer_name,
        s.total_amount,
        s.tax,
        s.discount,
        s.date
      FROM sales s
      LEFT JOIN customers c 
        ON s.customer_id = c.customer_id
      ORDER BY s.date DESC
    `);
        res.json(rows);

    } catch (error) {
        console.error("Sales Report Error:", error);
        res.status(500).json([]);
    }

});

// Get daily sales (last 7 days)
router.get('/daily-sales', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%a') AS name,
        SUM(total_amount) AS sales
      FROM sales
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(date, '%a')
      ORDER BY MIN(date)
    `);
        res.json(rows);

    } catch (error) {
        console.error("Daily Sales Error:", error);
        res.status(500).json({
            error: error.message
        });
    }

});

// Get sales by category
router.get('/sales-by-category', async (req, res) => {

    try {
        const [rows] = await db.query(`
      SELECT 
        p.category AS name,
        SUM(si.quantity * si.price) AS value
      FROM sales_items si
      JOIN products p 
        ON si.product_id = p.product_id
      GROUP BY p.category
      ORDER BY value DESC
    `);
        res.json(rows);

    } catch (error) {
        console.error("Category Sales Error:", error);

        res.status(500).json({
            error: error.message
        });
    }

});

module.exports = router;