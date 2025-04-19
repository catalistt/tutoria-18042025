const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SesionSchema = new Schema({
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
  tipo: {
    type: String,
    enum: ['ruta TutorIA', 'libre', 'practica'],
    required: true
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaFin: Date,
  duracionMinutos: Number,
  completada: {
    type: Boolean,
    default: false
  },
  estadisticasGenerales: {
    preguntasTotales: {
      type: Number,
      default: 0
    },
    preguntasCorrectas: {
      type: Number,
      default: 0
    },
    segundosPromedioRespuesta: {
      type: Number,
      default: 0
    },
    nivelDificultadPromedio: String,
    precision: {
      type: Number,
      default: 0
    }
  },
  preguntasSesion: [{
    preguntaId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregunta'
    },
    esCorrecta: Boolean,
    segundosUtilizados: Number,
    usaPista: {
      type: Boolean,
      default: false
    },
    usaChatbot: {
      type: Boolean,
      default: false
    },
    archivaPregunta: {
      type: Boolean,
      default: false
    },
    reportaPregunta: {
      type: Boolean,
      default: false
    },
    interaccionChatbot: [{
      preguntaUsuario: String,
      respuestaChatbot: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      valoracion: Number
    }]
  }],
  feedbackSesion: {
    dificultadPercibida: String,
    utilidadPercibida: {
      type: Number,
      min: 1,
      max: 5
    },
    comentarios: String
  }
}, { timestamps: true });

// Índices
SesionSchema.index({ usuarioId: 1 });
SesionSchema.index({ fechaInicio: 1 });
SesionSchema.index({ usuarioId: 1, materiaId: 1 });
SesionSchema.index({ completada: 1 });

module.exports = mongoose.model('Sesion', SesionSchema);