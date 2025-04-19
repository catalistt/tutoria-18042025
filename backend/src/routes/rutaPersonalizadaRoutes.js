const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rutaPersonalizadaController = require('../controllers/rutaPersonalizadaController');

// Rutas de rutas personalizadas
router.get('/usuario/:userId/materia/:materiaId', 
  authMiddleware.verifyToken, 
  rutaPersonalizadaController.getRutaPersonalizada);

router.post('/usuario/:userId/materia/:materiaId', 
  authMiddleware.verifyToken, 
  rutaPersonalizadaController.crearOActualizarRuta);

router.get('/usuario/:userId/materia/:materiaId/modulo/:moduloOrden/preguntas', 
  authMiddleware.verifyToken, 
  rutaPersonalizadaController.getPreguntasModulo);

router.put('/usuario/:userId/materia/:materiaId/modulo/:moduloOrden', 
  authMiddleware.verifyToken, 
  rutaPersonalizadaController.actualizarEstadoModulo);

module.exports = router;