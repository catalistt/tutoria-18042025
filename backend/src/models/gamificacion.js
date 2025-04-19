const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GamificacionSchema = new Schema({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  },
  nivel: {
    type: Number,
    default: 1
  },
  puntosTotales: {
    type: Number,
    default: 0
  },
  puntosParaSiguienteNivel: {
    type: Number,
    default: 1000
  },
  diasDeRachaActual: {
    type: Number,
    default: 0
  },
  diasDeRachaMax: {
    type: Number,
    default: 0
  },
  desafios: [{
    id: String,
    nombre: String,
    descripcion: String,
    fechaInicio: Date,
    fechaFin: Date,
    progreso: Number,
    completado: {
      type: Boolean,
      default: false
    },
    tipoRecompensa: String,
    cantidadRecompensa: Number
  }],
  recompensasDisponibles: [{
    id: String,
    nombre: String,
    tipo: String,
    costo: Number,
    desbloqueado: {
      type: Boolean,
      default: false
    }
  }],
  insignias: [{
    id: String,
    nombre: String,
    descripcion: String,
    fechaObtencion: Date,
    categoria: String,
    icono: String,
    rareza: String
  }],
  estadisticasEstudio: {
    tiempoTotalPlataforma: {
      type: Number,
      default: 0
    },
    sesionesTotales: {
      type: Number,
      default: 0
    },
    preguntasRespondidasTotal: {
      type: Number,
      default: 0
    },
    tasaAciertoGlobal: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Índices
GamificacionSchema.index({ usuarioId: 1 }, { unique: true });
GamificacionSchema.index({ nivel: 1 });
GamificacionSchema.index({ 'desafios.fechaFin': 1 });

module.exports = mongoose.model('Gamificacion', GamificacionSchema);