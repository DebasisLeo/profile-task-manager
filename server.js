const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { authenticate } = require('./middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(bodyParser.json());

// Global logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} hit`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticate, taskRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
