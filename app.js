require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const ErrorResponse = require('./utils/errorResponse');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware globals
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Task Manager API Running' });
});

// Rutes
// (Ordre recomanat a l'enunciat: auth -> protected -> admin)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res, next) => {
  next(new ErrorResponse('Ruta no trobada', 404));
});

// Error handler (al final)
// Gestiona errors de Mongoose i errors personalitzats
// IMPORTANT: no reveles info sensible en producció
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error del servidor';
  let details = err.details || null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID no vàlid';
  }

  // Mongoose duplicate key (email unique)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Dades duplicades';
    const fields = Object.keys(err.keyValue || {});
    if (fields.includes('email')) message = 'Aquest email ja està registrat';
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validació';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  const payload = {
    success: false,
    error: message,
  };

  if (details) payload.errors = details;
  if (process.env.NODE_ENV === 'development' && err.stack) payload.stack = err.stack;

  return res.status(statusCode).json(payload);
});

// DB + start
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', e.message);
    process.exit(1);
  });

module.exports = app;
