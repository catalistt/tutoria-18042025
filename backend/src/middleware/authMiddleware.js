const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware para verificar token JWT
exports.verifyToken = (req, res, next) => {
  // Obtener el token del header, query o cookie
  const token = req.headers.authorization?.split(' ')[1] || 
                req.query.token || 
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      message: 'No se proporcionó token de autenticación' 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Agregar userId a la request
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado, inicie sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Token inválido o manipulado' 
    });
  }
};

// Middleware para roles específicos
exports.hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      const Usuario = require('../models/usuario');
      
      // Obtener usuario desde la DB
      const user = await Usuario.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }
      
      // Verificar si el usuario tiene el rol requerido
      if (!roles.includes(user.rol)) {
        return res.status(403).json({ 
          message: 'No tiene permiso para acceder a este recurso' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({ 
        message: 'Error en el servidor al verificar permisos' 
      });
    }
  };
};

// Middleware para plan premium
exports.isPremium = async (req, res, next) => {
  try {
    const Usuario = require('../models/usuario');
    
    // Obtener usuario desde la DB
    const user = await Usuario.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }
    
    // Verificar si el usuario tiene plan premium
    if (user.plan?.tipo !== 'premium') {
      return res.status(403).json({ 
        message: 'Esta funcionalidad requiere un plan premium' 
      });
    }
    
    // Verificar si el plan está activo (no expirado)
    const today = new Date();
    if (new Date(user.plan.fechaRenovacion) < today) {
      return res.status(403).json({ 
        message: 'Su plan premium ha expirado' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de plan premium:', error);
    return res.status(500).json({ 
      message: 'Error en el servidor al verificar plan premium' 
    });
  }
};

// Middleware para limitar peticiones
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas peticiones desde esta IP, intente nuevamente después de 15 minutos'
  }
});

// Limiter específico para rutas de autenticación
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Límite de 10 intentos de login/registro
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de autenticación, intente nuevamente después de 1 hora'
  }
});

// Middleware para validación de datos
const { validationResult } = require('express-validator');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Error de validación',
      errors: errors.array() 
    });
  }
  
  next();
};