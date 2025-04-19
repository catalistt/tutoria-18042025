const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sesionController = require('../controllers/sesionController');

// Rutas de sesiones
router.post('/', 
  authMiddleware.verifyToken, 
  sesionController.crearSesion);

router.put('/:sesionId', 
  authMiddleware.verifyToken, 
  sesionController.finalizarSesion);

router.get('/usuario/:userId', 
  authMiddleware.verifyToken, 
  sesionController.getSesionesUsuario);

router.get('/:sesionId/stats', 
  authMiddleware.verifyToken, 
  sesionController.getEstadisticasSesion);

module.exports = router;