const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RutaPersonalizadaSchema = new Schema({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  materiaId: {
    type: Schema.Types.ObjectId,
    ref: 'Materia',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  objetivoPrincipal: String,
  nivelInicialAciertos: {
    type: Number,
    min: 0,
    max: 1
  },
  nivelObjetivoAciertos: {
    type: Number,
    min: 0,
    max: 1
  },
  modulos: [{
    orden: Number,
    titulo: String,
    ejeUnidadIncluidos: [{
      type: Schema.Types.ObjectId,
      ref: 'EjeUnidad'
    }],
    descripcion: String,
    minutosEstimados: Number,
    preguntas: [String],
    recursos: [String],
    logrado: {
      type: Boolean,
      default: false
    }
  }],
  recomendacionesActuales: {
    ejesEnfoque: [String],
    conceptosReforzar: [String],
    ritmoSugerido: String,
    descansoRecomendado: String
  }
}, { timestamps: true });

// Índices
RutaPersonalizadaSchema.index({ usuarioId: 1, materiaId: 1 });
RutaPersonalizadaSchema.index({ usuarioId: 1 });
RutaPersonalizadaSchema.index({ fechaActualizacion: 1 });

module.exports = mongoose.model('RutaPersonalizada', RutaPersonalizadaSchema);