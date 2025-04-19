const Joi = require('joi');

/**
 * Validación para entrada de generación de preguntas
 */
exports.validatePreguntaInput = (data) => {
  const schema = Joi.object({
    ejeUnidad: Joi.object({
      _id: Joi.string().required(),
      ejeTematico: Joi.string().required(),
      unidad: Joi.string().required(),
      nombre_grado: Joi.string().required(),
      descripcion: Joi.array().items(Joi.string())
    }).required(),
    materia: Joi.object({
      _id: Joi.string().required(),
      nombre: Joi.string().required()
    }).required(),
    cantidad: Joi.number().integer().min(1).max(10).default(5),
    dificultad: Joi.number().integer().min(1).max(10).default(5),
    tipoPreguntas: Joi.string().valid('seleccion_multiple', 'desarrollo').default('seleccion_multiple')
  });
  
  return schema.validate(data);
};