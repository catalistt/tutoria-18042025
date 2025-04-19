const Joi = require('joi');

/**
 * Validación para entrada de ruta personalizada
 */
exports.validateRutaInput = (data) => {
  const ejeUnidadSchema = Joi.object({
    id: Joi.string().required(),
    eje: Joi.string().required(),
    unidad: Joi.string().required(),
    nivel: Joi.number().min(0).max(1).required()
  });
  
  const schema = Joi.object({
    ejesUnidadesDominados: Joi.array().items(ejeUnidadSchema).default([]),
    ejesUnidadesPorTrabajar: Joi.array().items(ejeUnidadSchema).default([]),
    ejesUnidadesNoIniciados: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        eje: Joi.string().required(),
        unidad: Joi.string().required(),
        nivel: Joi.number().default(0)
      })
    ).default([]),
    objetivoPrincipal: Joi.string().default('Mejorar comprensión general'),
    materiaInfo: Joi.object({
      id: Joi.string(),
      nombre: Joi.string().required(),
      descripcion: Joi.string()
    }).required(),
    nivelActual: Joi.number().min(0).max(1).default(0)
  });
  
  return schema.validate(data);
};