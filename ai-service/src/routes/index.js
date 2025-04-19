const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const rutaController = require('../controllers/rutaController');
const preguntaController = require('../controllers/preguntaController');

// Rutas para chatbot
router.post('/chatbot/mensaje', chatbotController.procesarMensaje);

// Rutas para generación de rutas personalizadas
router.post('/ruta/generar', rutaController.generarRutaPersonalizada);

// Rutas para generación de preguntas
router.post('/preguntas/generar', preguntaController.generarPreguntas);

// Ruta para verificar estado del servicio
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'TutorIA AI Service',
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;