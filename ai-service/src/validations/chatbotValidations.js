const Joi = require('joi');

/**
 * Validación para entrada de chatbot
 */
exports.validateChatInput = (data) => {
  const schema = Joi.object({
    preguntaId: Joi.string(),
    preguntaTexto: Joi.string().required(),
    materiasRelacionadas: Joi.array().items(Joi.string()).default([]),
    historialUsuario: Joi.object({
      nivelGeneral: Joi.number().min(0).max(10),
      materiasInteresadas: Joi.array().items(Joi.string()),
      objetivos: Joi.string()
    }).default({}),
    conversacion: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('system', 'assistant', 'user').required(),
        content: Joi.string().required()
      })
    ).min(1).required()
  });
  
  return schema.validate(data);
};