// Middleware para capturar errores
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Si es un error de Mongoose tipo ValidationError
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: Object.values(err.errors).map(error => ({
          field: error.path,
          message: error.message
        }))
      });
    }
    
    // Si es un error de MongoDB tipo duplicate key
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(400).json({
        message: 'Error de duplicidad',
        error: `El campo ${Object.keys(err.keyValue)} ya existe en la base de datos`
      });
    }
    
    // Si es un error de JWT
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token inválido o manipulado'
      });
    }
    
    // Si es un error de tipo CastError (ID inválido)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        error: `El valor ${err.value} no es válido para el tipo ${err.kind}`
      });
    }
    
    // Error genérico
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
    });
  };
  
  // Middleware para manejar rutas no encontradas
  exports.notFoundHandler = (req, res) => {
    res.status(404).json({
      message: 'Recurso no encontrado',
      path: req.originalUrl
    });
  };