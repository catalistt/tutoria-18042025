const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

// Conectar a MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Iniciar servidor
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// backend/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Parsear JSON
app.use(express.json());

// Rutas
app.use('/api', routes);

// Ruta de verificación de estado
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'TutorIA API',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Manejo de errores
app.use(errorMiddleware.notFoundHandler);
app.use(errorMiddleware.errorHandler);

module.exports = app;

// backend/src/config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoria',
  jwtSecret: process.env.JWT_SECRET || 'tu_secreto_jwt_muy_seguro',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5001',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};