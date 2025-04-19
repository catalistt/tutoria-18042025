const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const materiaController = require('../controllers/materiaController');

// Rutas de materias
router.get('/', authMiddleware.verifyToken, materiaController.getAllMaterias);
router.get('/:id', authMiddleware.verifyToken, materiaController.getMateriaById);
router.get('/user/:userId', authMiddleware.verifyToken, materiaController.getMateriasByUser);
router.get('/:materiaId/ejes-unidades', authMiddleware.verifyToken, materiaController.getEjesUnidadesByMateria);
router.get('/usuario/:userId/materia/:materiaId/progreso', authMiddleware.verifyToken, materiaController.getUsuarioProgresoMateria);

module.exports = router;