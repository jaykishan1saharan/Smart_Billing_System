require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running successfully!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/api/dashboard', dashboardRoutes);