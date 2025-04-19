const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PreguntaSchema = new Schema({
  ejeUnidadId: {
    type: Schema.Types.ObjectId,
    ref: 'EjeUnidad',
    required: true
  },
  dificultad: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  enunciado: {
    texto: {
      type: String,
      required: true
    },
    tieneImagenes: {
      type: Boolean,
      default: false
    },
    imagenesURL: [String],
    imagenesLatex: [String],
    tieneTablas: {
      type: Boolean,
      default: false
    },
    tablasURL: [String],
    tablasLatex: [String]
  },
  alternativas: [{
    identificador: String,
    texto: String,
    tieneImagenes: {
      type: Boolean,
      default: false
    },
    imagenesURL: [String],
    imagenesLatex: [String],
    tieneTablas: {
      type: Boolean,
      default: false
    },
    tablasURL: [String],
    tablasLatex: [String]
  }],
  alternativasCorrectas: [String],
  pistas: [String],
  metadatos: {
    habilidades: [String],
    segundosEstimados: Number,
    keywords: [String],
    nivelCognitivo: String,
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    autor: String,
    fuente: String
  },
  estadisticas: {
    vecesUtilizada: {
      type: Number,
      default: 0
    },
    tasaAcierto: {
      type: Number,
      default: 0
    },
    segundosPromedioRespuesta: {
      type: Number,
      default: 0
    },
    dificultadHistorica: {
      type: Number,
      default: 0
    },
    vecesReportada: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Índices
PreguntaSchema.index({ ejeUnidadId: 1 });
PreguntaSchema.index({ dificultad: 1 });
PreguntaSchema.index({ 'metadatos.habilidades': 1 });
PreguntaSchema.index({ 'metadatos.keywords': 1 });

module.exports = mongoose.model('Pregunta', PreguntaSchema);