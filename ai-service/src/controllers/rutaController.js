const openaiService = require('../services/openaiService');
const { validateRutaInput } = require('../validations/rutaValidations');

/**
 * Genera una ruta de aprendizaje personalizada con IA
 */
exports.generarRutaPersonalizada = async (req, res) => {
  try {
    // Validar el input
    const { error, value } = validateRutaInput(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: error.details.map(d => d.message)
      });
    }
    
    const {
      ejesUnidadesDominados,
      ejesUnidadesPorTrabajar,
      ejesUnidadesNoIniciados,
      objetivoPrincipal,
      materiaInfo,
      nivelActual
    } = value;
    
    // Generar ruta personalizada con OpenAI
    const rutaPersonalizada = await openaiService.generateLearningPath(value);
    
    res.json({
      rutaPersonalizada
    });
  } catch (error) {
    console.error('Error al generar ruta personalizada:', error);
    res.status(500).json({
      message: 'Error en el servidor al generar ruta personalizada',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};