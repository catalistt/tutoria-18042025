const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest, authLimiter } = require('../middleware/authMiddleware');

// Validaciones para registro
const registerValidation = [
  check('email', 'Email inválido').isEmail(),
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('fechaNacimiento', 'La fecha de nacimiento es obligatoria').isDate(),
  check('grado', 'El grado es obligatorio').not().isEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
];

// Validaciones para login
const loginValidation = [
  check('email', 'Email inválido').isEmail(),
  check('password', 'La contraseña es obligatoria').not().isEmpty()
];

// Rutas de autenticación
router.post('/register', authLimiter, registerValidation, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidation, validateRequest, authController.login);
router.post('/reset-password', authLimiter, authController.requestPasswordReset);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

module.exports = router;