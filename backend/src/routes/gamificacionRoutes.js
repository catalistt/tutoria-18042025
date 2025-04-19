const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const gamificacionController = require('../controllers/gamificacionController');

// Rutas de gamificación
router.get('/usuario/:userId', 
  authMiddleware.verifyToken, 
  gamificacionController.getGamificacionUsuario);

router.put('/usuario/:userId/racha', 
  authMiddleware.verifyToken, 
  gamificacionController.actualizarRacha);

router.put('/usuario/:userId/desafio/:desafioId/completar', 
  authMiddleware.verifyToken, 
  gamificacionController.completarDesafio);

router.put('/usuario/:userId/recompensa/:recompensaId/comprar', 
  authMiddleware.verifyToken, 
  gamificacionController.comprarRecompensa);

module.exports = router;