const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const preguntaController = require('../controllers/preguntaController');

// Rutas de preguntas
router.get('/eje-unidad/:ejeUnidadId', authMiddleware.verifyToken, preguntaController.getPreguntasByEjeUnidad);
router.get('/materia/:materiaId/random', authMiddleware.verifyToken, preguntaController.getRandomPreguntasByMateria);
router.post('/:preguntaId/stats', authMiddleware.verifyToken, preguntaController.updatePreguntaStats);

// Ruta premium para generación de preguntas
router.post('/generar', 
  authMiddleware.verifyToken, 
  authMiddleware.isPremium, 
  preguntaController.generarPreguntas);

module.exports = router;