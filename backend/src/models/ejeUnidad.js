const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EjeUnidadSchema = new Schema({
  materia: {
    type: Schema.Types.ObjectId,
    ref: 'Materia',
    required: true
  },
  ejeTematico: {
    type: String,
    required: true
  },
  unidad: {
    type: String,
    required: true
  },
  nombre_grado: {
    type: String,
    required: true
  },
  descripcion: [String],
  material_pdf: [String],
  material_video: [String]
}, { timestamps: true });

// Índices
EjeUnidadSchema.index({ materia: 1 });
EjeUnidadSchema.index({ ejeTematico: 1 });
EjeUnidadSchema.index({ nombre_grado: 1 });
EjeUnidadSchema.index({ materia: 1, ejeTematico: 1, unidad: 1 }, { unique: true });

module.exports = mongoose.model('EjeUnidad', EjeUnidadSchema);