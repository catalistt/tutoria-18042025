const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const materiaRoutes = require('./materiaRoutes');
const preguntaRoutes = require('./preguntaRoutes');
const rutaPersonalizadaRoutes = require('./rutaPersonalizadaRoutes');
const sesionRoutes = require('./sesionRoutes');
const gamificacionRoutes = require('./gamificacionRoutes');
const chatbotRoutes = require('./chatbotRoutes');

// Definir rutas base
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/materias', materiaRoutes);
router.use('/preguntas', preguntaRoutes);
router.use('/rutas', rutaPersonalizadaRoutes);
router.use('/sesiones', sesionRoutes);
router.use('/gamificacion', gamificacionRoutes);
router.use('/chatbot', chatbotRoutes);

// Ruta de verificación de estado
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'TutorIA API',
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;