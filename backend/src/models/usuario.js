const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  nombre: {
    type: String,
    required: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  grado: {
    type: String,
    required: true
  },
  plan: {
    tipo: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    fechaInicio: Date,
    fechaRenovacion: Date,
    pagos: [{
      fecha: Date,
      monto: Number,
      metodoPago: String,
      estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'completado', 'fallido'],
        default: 'pendiente'
      }
    }]
  },
  perfilAcademico: {
    curso: String,
    objetivoGeneral: String,
    tiempoEstudioSemanal: Number,
    materiaInicial: [String]
  },
  engagement: {
    ultimoLogin: {
      type: Date,
      default: Date.now
    },
    diasConsecutivos: {
      type: Number,
      default: 0
    },
    maxConsecutivos: {
      type: Number,
      default: 0
    },
    minutosTotalPlataforma: {
      type: Number,
      default: 0
    },
    minutosPromedioPorSesion: {
      type: Number,
      default: 0
    },
    nivel: {
      type: Number,
      default: 1
    }
  },
  metadatos: {
    fechaRegistro: {
      type: Date,
      default: Date.now
    },
    ultimaActualizacionPerfil: Date,
    dispositivoRegistro: String,
    dispositivosUsados: [String],
    regionDomicilio: String,
    comunaDomicilio: String,
    establecimientoEducacional: {
      nombre: String,
      tipo: String,
      region: String
    },
    siCompartirDatosAnonimos: {
      type: Boolean,
      default: true
    },
    siCompartirProgreso: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

// Índices
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ 'engagement.ultimoLogin': 1 });
UsuarioSchema.index({ 'metadatos.regionDomicilio': 1, 'metadatos.comunaDomicilio': 1 });

module.exports = mongoose.model('Usuario', UsuarioSchema);