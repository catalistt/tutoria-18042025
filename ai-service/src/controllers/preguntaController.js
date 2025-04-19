const openaiService = require('../services/openaiService');
const { validatePreguntaInput } = require('../validations/preguntaValidations');

/**
 * Genera preguntas con IA
 */
exports.generarPreguntas = async (req, res) => {
  try {
    // Validar el input
    const { error, value } = validatePreguntaInput(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: error.details.map(d => d.message)
      });
    }
    
    const {
      ejeUnidad,
      materia,
      cantidad,
      dificultad,
      tipoPreguntas
    } = value;
    
    // Generar preguntas con OpenAI
    const preguntas = await openaiService.generateQuestions(value);
    
    res.json({
      preguntas
    });
  } catch (error) {
    console.error('Error al generar preguntas:', error);
    res.status(500).json({
      message: 'Error en el servidor al generar preguntas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};