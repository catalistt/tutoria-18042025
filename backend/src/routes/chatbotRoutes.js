const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatbotController = require('../controllers/chatbotController');

// Rutas de chatbot
router.post('/mensaje', 
  authMiddleware.verifyToken, 
  chatbotController.procesarMensaje);

router.post('/pregunta/:preguntaId/valoracion', 
  authMiddleware.verifyToken, 
  chatbotController.guardarValoracionRespuesta);

module.exports = router;