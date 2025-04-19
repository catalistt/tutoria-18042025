const openaiService = require('../services/openaiService');
const { validateChatInput } = require('../validations/chatbotValidations');

/**
 * Procesa un mensaje del chatbot y genera una respuesta basada en contexto
 */
exports.procesarMensaje = async (req, res) => {
  try {
    // Validar el input
    const { error, value } = validateChatInput(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: error.details.map(d => d.message)
      });
    }
    
    const { 
      preguntaId, 
      preguntaTexto, 
      materiasRelacionadas, 
      historialUsuario, 
      conversacion 
    } = value;
    
    // Verificar si la conversación es demasiado larga
    if (conversacion.length > 20) {
      // Truncar la conversación para mantener sólo los mensajes más relevantes
      // Mantener el primer mensaje (sistema) + los últimos 19 mensajes
      const truncatedConversation = [
        conversacion[0],
        ...conversacion.slice(-19)
      ];
      value.conversacion = truncatedConversation;
    }
    
    // Generar respuesta con OpenAI
    const respuesta = await openaiService.generateChatResponse(value);
    
    res.json({ respuesta });
  } catch (error) {
    console.error('Error al procesar mensaje de chatbot:', error);
    res.status(500).json({
      message: 'Error en el servidor al procesar mensaje de chatbot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};