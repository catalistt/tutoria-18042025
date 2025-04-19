const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioEjeUnidadSchema = new Schema({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  ejeUnidadId: {
    type: Schema.Types.ObjectId,
    ref: 'EjeUnidad',
    required: true
  },
  nivelGeneral: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  tendencia: {
    type: String,
    enum: ['mejorando', 'estable', 'deteriorando'],
    default: 'estable'
  },
  diagnosticoInicial: {
    fechaEvaluacion: Date,
    nivelGeneral: Number,
    frustraciones: String,
    motivacion: String,
    experiencias: String,
    metas: String
  },
  conceptosDominados: [String],
  conceptosPorReforzar: [String],
  progresoPorHabilidad: [{
    nombre: String,
    nivel: Number,
    ultimaEvaluacion: Date
  }],
  recomendaciones: {
    ritmoOptimo: String,
    minutosDuracionSesion: Number,
    enfasis: [String]
  }
}, { timestamps: true });

// Índices
UsuarioEjeUnidadSchema.index({ usuarioId: 1, ejeUnidadId: 1 }, { unique: true });
UsuarioEjeUnidadSchema.index({ usuarioId: 1 });
UsuarioEjeUnidadSchema.index({ ejeUnidadId: 1 });
UsuarioEjeUnidadSchema.index({ nivelGeneral: 1 });

module.exports = mongoose.model('UsuarioEjeUnidad', UsuarioEjeUnidadSchema);