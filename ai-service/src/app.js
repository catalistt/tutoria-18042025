const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas peticiones desde esta IP, intente nuevamente después de 15 minutos'
  }
});

app.use(apiLimiter);

// Rutas
app.use('/api', routes);

// Manejo de errores
app.use(errorMiddleware.notFoundHandler);
app.use(errorMiddleware.errorHandler);

module.exports = app;