const Sesion = require('../models/sesion');
const Usuario = require('../models/usuario');
const Gamificacion = require('../models/gamificacion');
const Pregunta = require('../models/pregunta');
const UsuarioEjeUnidad = require('../models/usuarioEjeUnidad');

// Create a new session
exports.crearSesion = async (req, res) => {
  try {
    const { usuarioId, materiaId, tipo } = req.body;
    
    // Create session
    const sesion = new Sesion({
      usuarioId,
      materiaId,
      tipo,
      fechaInicio: Date.now()
    });
    
    await sesion.save();
    
    res.status(201).json({
      message: 'Sesión creada exitosamente',
      sesion
    });
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({
      message: 'Error en el servidor al crear sesión'
    });
  }
};

// End a session and update stats
exports.finalizarSesion = async (req, res) => {
  try {
    const { sesionId } = req.params;
    const { completada, estadisticasGenerales, preguntasSesion, feedbackSesion } = req.body;
    
    // Find session
    const sesion = await Sesion.findById(sesionId);
    if (!sesion) {
      return res.status(404).json({
        message: 'Sesión no encontrada'
      });
    }
    
    // Calculate duration
    const fechaFin = Date.now();
    const duracionMinutos = Math.round((fechaFin - sesion.fechaInicio) / 60000);
    
    // Update session
    sesion.fechaFin = fechaFin;
    sesion.duracionMinutos = duracionMinutos;
    sesion.completada = completada;
    
    if (estadisticasGenerales) {
      sesion.estadisticasGenerales = estadisticasGenerales;
    }
    
    if (preguntasSesion) {
      sesion.preguntasSesion = preguntasSesion;
      
      // Update question stats for each question in the session
      for (const pregunta of preguntasSesion) {
        await Pregunta.findByIdAndUpdate(
          pregunta.preguntaId,
          {
            $inc: { 'estadisticas.vecesUtilizada': 1 }
          }
        );
      }
    }
    
    if (feedbackSesion) {
      sesion.feedbackSesion = feedbackSesion;
    }
    
    await sesion.save();
    
    // Update user engagement metrics
    await Usuario.findByIdAndUpdate(
      sesion.usuarioId,
      {
        $inc: {
          'engagement.minutosTotalPlataforma': duracionMinutos
        },
        $set: {
          'engagement.ultimoLogin': Date.now()
        }
      }
    );
    
    // Update gamification
    const gamificacion = await Gamificacion.findOne({ usuarioId: sesion.usuarioId });
    if (gamificacion) {
      // Calculate points earned
      let puntosGanados = 10; // Base points for completing a session
      
      if (sesion.estadisticasGenerales && sesion.estadisticasGenerales.preguntasCorrectas) {
        // Add points for correct answers
        puntosGanados += sesion.estadisticasGenerales.preguntasCorrectas * 5;
        
        // Add bonus for high accuracy
        if (sesion.estadisticasGenerales.precision && sesion.estadisticasGenerales.precision >= 0.8) {
          puntosGanados += 20;
        }
      }
      
      // Update gamification record
      gamificacion.estadisticasEstudio.tiempoTotalPlataforma += duracionMinutos;
      gamificacion.estadisticasEstudio.sesionesTotales += 1;
      
      if (preguntasSesion) {
        gamificacion.estadisticasEstudio.preguntasRespondidasTotal += preguntasSesion.length;
        
        // Update accuracy
        const preguntasCorrectas = preguntasSesion.filter(p => p.esCorrecta).length;
        const tasaActual = gamificacion.estadisticasEstudio.tasaAciertoGlobal;
        const totalAnterior = gamificacion.estadisticasEstudio.preguntasRespondidasTotal - preguntasSesion.length;
        
        gamificacion.estadisticasEstudio.tasaAciertoGlobal = 
          (tasaActual * totalAnterior + preguntasCorrectas) / 
          gamificacion.estadisticasEstudio.preguntasRespondidasTotal;
      }
      
      // Add points
      gamificacion.puntosTotales += puntosGanados;
      
      // Check for level up
      if (gamificacion.puntosTotales >= gamificacion.puntosParaSiguienteNivel) {
        gamificacion.nivel += 1;
        gamificacion.puntosParaSiguienteNivel = Math.floor(gamificacion.puntosParaSiguienteNivel * 1.5);
        
        // Also update user engagement level
        await Usuario.findByIdAndUpdate(
          sesion.usuarioId,
          {
            $set: {
              'engagement.nivel': gamificacion.nivel
            }
          }
        );
      }
      
      await gamificacion.save();
    }
    
    // Update user progress for ejes-unidades involved
    if (preguntasSesion && preguntasSesion.length > 0) {
      // Get all questions
      const preguntasIds = preguntasSesion.map(p => p.preguntaId);
      const preguntas = await Pregunta.find({ _id: { $in: preguntasIds } });
      
      // Group questions by ejeUnidadId
      const preguntasPorEjeUnidad = {};
      for (const pregunta of preguntas) {
        const ejeUnidadId = pregunta.ejeUnidadId.toString();
        if (!preguntasPorEjeUnidad[ejeUnidadId]) {
          preguntasPorEjeUnidad[ejeUnidadId] = [];
        }
        preguntasPorEjeUnidad[ejeUnidadId].push(pregunta);
      }
      
      // Update progress for each eje-unidad
      for (const [ejeUnidadId, preguntasEjeUnidad] of Object.entries(preguntasPorEjeUnidad)) {
        // Find matching session questions
        const preguntasSesionEjeUnidad = preguntasSesion.filter(ps => 
          preguntasEjeUnidad.some(p => p._id.toString() === ps.preguntaId.toString())
        );
        
        // Calculate accuracy for this eje-unidad
        const totalPreguntas = preguntasSesionEjeUnidad.length;
        const preguntasCorrectas = preguntasSesionEjeUnidad.filter(p => p.esCorrecta).length;
        const precision = totalPreguntas > 0 ? preguntasCorrectas / totalPreguntas : 0;
        
        // Find or create UsuarioEjeUnidad record
        let usuarioEjeUnidad = await UsuarioEjeUnidad.findOne({
          usuarioId: sesion.usuarioId,
          ejeUnidadId
        });
        
        if (usuarioEjeUnidad) {
          // Update existing record
          const nivelAnterior = usuarioEjeUnidad.nivelGeneral;
          
          // Calculate new level (weighted average: 70% previous, 30% new)
          const nuevoNivel = (nivelAnterior * 0.7) + (precision * 0.3);
          
          // Determine trend
          let tendencia = 'estable';
          if (nuevoNivel > nivelAnterior + 0.05) {
            tendencia = 'mejorando';
          } else if (nuevoNivel < nivelAnterior - 0.05) {
            tendencia = 'deteriorando';
          }
          
          await UsuarioEjeUnidad.findByIdAndUpdate(
            usuarioEjeUnidad._id,
            {
              $set: {
                nivelGeneral: nuevoNivel,
                fechaActualizacion: Date.now(),
                tendencia
              }
            }
          );
        } else {
          // Create new record
          usuarioEjeUnidad = new UsuarioEjeUnidad({
            usuarioId: sesion.usuarioId,
            ejeUnidadId,
            nivelGeneral: precision,
            fechaActualizacion: Date.now(),
            tendencia: 'estable',
            diagnosticoInicial: {
              fechaEvaluacion: Date.now(),
              nivelGeneral: precision
            }
          });
          
          await usuarioEjeUnidad.save();
        }
      }
    }
    
    res.status(200).json({
      message: 'Sesión finalizada exitosamente',
      sesion
    });
  } catch (error) {
    console.error('Error al finalizar sesión:', error);
    res.status(500).json({
      message: 'Error en el servidor al finalizar sesión'
    });
  }
};

// Get session history for a user
exports.getSesionesUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, materiaId } = req.query;
    
    // Build query
    const query = { usuarioId: userId };
    if (materiaId) {
      query.materiaId = materiaId;
    }
    
    // Get sessions
    const sesiones = await Sesion.find(query)
      .sort({ fechaInicio: -1 })
      .limit(parseInt(limit))
      .populate('materiaId');
    
    res.status(200).json({ sesiones });
  } catch (error) {
    console.error('Error al obtener historial de sesiones:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener historial de sesiones'
    });
  }
};

// Get detailed session stats
exports.getEstadisticasSesion = async (req, res) => {
  try {
    const { sesionId } = req.params;
    
    // Get session with populated references
    const sesion = await Sesion.findById(sesionId)
      .populate('materiaId')
      .populate('preguntasSesion.preguntaId');
    
    if (!sesion) {
      return res.status(404).json({
        message: 'Sesión no encontrada'
      });
    }
    
    // Get ejes-unidades for the questions
    const preguntasIds = sesion.preguntasSesion.map(p => p.preguntaId._id);
    const preguntas = await Pregunta.find({ _id: { $in: preguntasIds } });
    
    const ejesUnidadesIds = [...new Set(preguntas.map(p => p.ejeUnidadId))];
    const ejesUnidades = await EjeUnidad.find({ _id: { $in: ejesUnidadesIds } });
    
    // Prepare detailed stats
    const estadisticasDetalladas = {
      sesionInfo: {
        id: sesion._id,
        materia: sesion.materiaId ? sesion.materiaId.nombre : 'No especificada',
        tipo: sesion.tipo,
        duracion: sesion.duracionMinutos,
        fecha: sesion.fechaInicio,
        completada: sesion.completada
      },
      estadisticasGenerales: sesion.estadisticasGenerales,
      distribucionPorEjeTematico: {},
      preguntasMasDificiles: [],
      preguntasMasFaciles: []
    };
    
    // Group questions by eje tematico
    for (const pregunta of preguntas) {
      const ejeUnidad = ejesUnidades.find(eu => eu._id.toString() === pregunta.ejeUnidadId.toString());
      if (ejeUnidad) {
        const ejeTematico = ejeUnidad.ejeTematico;
        
        if (!estadisticasDetalladas.distribucionPorEjeTematico[ejeTematico]) {
          estadisticasDetalladas.distribucionPorEjeTematico[ejeTematico] = {
            total: 0,
            correctas: 0,
            precision: 0
          };
        }
        
        const preguntaSesion = sesion.preguntasSesion.find(
          ps => ps.preguntaId._id.toString() === pregunta._id.toString()
        );
        
        if (preguntaSesion) {
          estadisticasDetalladas.distribucionPorEjeTematico[ejeTematico].total++;
          if (preguntaSesion.esCorrecta) {
            estadisticasDetalladas.distribucionPorEjeTematico[ejeTematico].correctas++;
          }
        }
      }
    }
    
    // Calculate precision for each eje tematico
    for (const eje in estadisticasDetalladas.distribucionPorEjeTematico) {
      const stats = estadisticasDetalladas.distribucionPorEjeTematico[eje];
      stats.precision = stats.total > 0 ? stats.correctas / stats.total : 0;
    }
    
    // Find most difficult and easiest questions
    const preguntasConResultados = sesion.preguntasSesion
      .map(ps => ({
        pregunta: ps.preguntaId,
        esCorrecta: ps.esCorrecta,
        segundosUtilizados: ps.segundosUtilizados
      }))
      .filter(p => p.pregunta);
    
    // Sort by correctness and time
    preguntasConResultados.sort((a, b) => {
      // First by correctness
      if (a.esCorrecta !== b.esCorrecta) {
        return a.esCorrecta ? 1 : -1;
      }
      // Then by time (longer time = more difficult)
      return b.segundosUtilizados - a.segundosUtilizados;
    });
    
    estadisticasDetalladas.preguntasMasDificiles = preguntasConResultados.slice(0, 3);
    estadisticasDetalladas.preguntasMasFaciles = [...preguntasConResultados].reverse().slice(0, 3);
    
    res.status(200).json({ estadisticasDetalladas });
  } catch (error) {
    console.error('Error al obtener estadísticas de sesión:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener estadísticas de sesión'
    });
  }
};