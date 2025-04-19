const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MateriaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  descripcion: String,
  keywords: [String],
  imagen: String,
  color: String,
  estadisticas: {
    totalUsuarios: {
      type: Number,
      default: 0
    },
    totalMinutos: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Índices
MateriaSchema.index({ nombre: 1 });
MateriaSchema.index({ keywords: 1 });

module.exports = mongoose.model('Materia', MateriaSchema);