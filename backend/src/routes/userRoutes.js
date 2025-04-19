const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Validaciones para actualización de perfil
const updateProfileValidation = [
  check('nombre', 'El nombre no puede estar vacío').optional().not().isEmpty(),
  check('grado', 'El grado no puede estar vacío').optional().not().isEmpty(),
  check('perfilAcademico.objetivoGeneral', 'El objetivo general no puede estar vacío').optional().not().isEmpty(),
  check('perfilAcademico.tiempoEstudioSemanal', 'El tiempo de estudio debe ser un número').optional().isInt({ min: 1 })
];

// Rutas de usuario (protegidas)
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, updateProfileValidation, authMiddleware.validateRequest, userController.updateProfile);
router.get('/progress', authMiddleware.verifyToken, userController.getProgress);
router.get('/stats', authMiddleware.verifyToken, userController.getStats);

module.exports = router;