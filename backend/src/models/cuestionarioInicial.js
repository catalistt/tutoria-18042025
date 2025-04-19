const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CuestionarioInicialSchema = new Schema({
  pregunta: {
    type: String,
    required: true
  },
  subTexto: String,
  alternativas: [String],
  orden_aparicion: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Índices
CuestionarioInicialSchema.index({ orden_aparicion: 1 });

module.exports = mongoose.model('CuestionarioInicial', CuestionarioInicialSchema);