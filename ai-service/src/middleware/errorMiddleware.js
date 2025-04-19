/**
 * Middleware para capturar errores
 */
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Error de validación de Joi
    if (err.isJoi) {
      return res.status(400).json({
        message: 'Error de validación',
        errors: err.details.map(detail => ({
          message: detail.message,
          path: detail.path
        }))
      });
    }
    
    // Error de la API de OpenAI
    if (err.name === 'OpenAIError') {
      return res.status(500).json({
        message: 'Error en la comunicación con OpenAI',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error en el procesamiento de IA'
      });
    }
    
    // Error genérico
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
    });
  };
  
  /**
   * Middleware para manejar rutas no encontradas
   */
  exports.notFoundHandler = (req, res) => {
    res.status(404).json({
      message: 'Recurso no encontrado',
      path: req.originalUrl
    });
  };