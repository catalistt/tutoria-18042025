const Pregunta = require('../models/pregunta');
const EjeUnidad = require('../models/ejeUnidad');

// Get questions for a specific eje-unidad
exports.getPreguntasByEjeUnidad = async (req, res) => {
  try {
    const { ejeUnidadId } = req.params;
    const { dificultad, limit } = req.query;
    
    // Build query
    const query = { ejeUnidadId };
    if (dificultad) {
      query.dificultad = dificultad;
    }
    
    // Get questions
    let preguntasQuery = Pregunta.find(query);
    
    // Apply limit if provided
    if (limit) {
      preguntasQuery = preguntasQuery.limit(parseInt(limit));
    }
    
    const preguntas = await preguntasQuery.exec();
    
    res.status(200).json({ preguntas });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener preguntas'
    });
  }
};

// Get a random set of questions for a specific materia
exports.getRandomPreguntasByMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { cantidad = 10, dificultadMin, dificultadMax } = req.query;
    
    // Get all ejes-unidades for the materia
    const ejesUnidades = await EjeUnidad.find({ materia: materiaId });
    if (ejesUnidades.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron ejes-unidades para esta materia'
      });
    }
    
    // Build query
    const query = {
      ejeUnidadId: { $in: ejesUnidades.map(eu => eu._id) }
    };
    
    if (dificultadMin || dificultadMax) {
      query.dificultad = {};
      if (dificultadMin) {
        query.dificultad.$gte = parseInt(dificultadMin);
      }
      if (dificultadMax) {
        query.dificultad.$lte = parseInt(dificultadMax);
      }
    }
    
    // Get random questions
    const preguntas = await Pregunta.aggregate([
      { $match: query },
      { $sample: { size: parseInt(cantidad) } }
    ]);
    
    // Update stats (increment vecesUtilizada)
    if (preguntas.length > 0) {
      await Pregunta.updateMany(
        { _id: { $in: preguntas.map(p => p._id) } },
        { $inc: { 'estadisticas.vecesUtilizada': 1 } }
      );
    }
    
    res.status(200).json({ preguntas });
  } catch (error) {
    console.error('Error al obtener preguntas aleatorias:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener preguntas aleatorias'
    });
  }
};

// Update question stats after user interaction
exports.updatePreguntaStats = async (req, res) => {
  try {
    const { preguntaId } = req.params;
    const { esCorrecta, segundosUtilizados, esReportada } = req.body;
    
    const updateData = {};
    
    // Update question stats
    if (esCorrecta !== undefined || segundosUtilizados) {
      const pregunta = await Pregunta.findById(preguntaId);
      if (!pregunta) {
        return res.status(404).json({
          message: 'Pregunta no encontrada'
        });
      }
      
      // Calculate new tasa de acierto
      if (esCorrecta !== undefined) {
        const totalUsada = pregunta.estadisticas.vecesUtilizada;
        const aciertosAnteriores = totalUsada * pregunta.estadisticas.tasaAcierto;
        const nuevosAciertos = aciertosAnteriores + (esCorrecta ? 1 : 0);
        updateData['estadisticas.tasaAcierto'] = nuevosAciertos / (totalUsada + 1);
      }
      
      // Calculate new tiempo promedio
      if (segundosUtilizados) {
        const totalUsada = pregunta.estadisticas.vecesUtilizada;
        const tiempoTotal = totalUsada * pregunta.estadisticas.segundosPromedioRespuesta;
        const nuevoTiempoTotal = tiempoTotal + segundosUtilizados;
        updateData['estadisticas.segundosPromedioRespuesta'] = nuevoTiempoTotal / (totalUsada + 1);
      }
      
      // Recalculate historical difficulty
      if (esCorrecta !== undefined || segundosUtilizados) {
        // Formula for difficulty: 70% tasa de acierto + 30% tiempo promedio normalizado
        const nuevaTasaAcierto = updateData['estadisticas.tasaAcierto'] || pregunta.estadisticas.tasaAcierto;
        const nuevoTiempoPromedio = updateData['estadisticas.segundosPromedioRespuesta'] || pregunta.estadisticas.segundosPromedioRespuesta;
        
        // Normalize time (assumed 180 seconds is standard, over 300 is slow)
        const tiempoNormalizado = Math.min(nuevoTiempoPromedio / 180, 1);
        
        // Higher tasa de acierto means LESS difficulty
        // Higher tiempo normalizado means MORE difficulty
        updateData['estadisticas.dificultadHistorica'] = (0.7 * (1 - nuevaTasaAcierto)) + (0.3 * tiempoNormalizado);
      }
    }
    
    // Increment report count if reported
    if (esReportada) {
      updateData['$inc'] = { 'estadisticas.vecesReportada': 1 };
    }
    
    // Update question
    if (Object.keys(updateData).length > 0) {
      await Pregunta.findByIdAndUpdate(preguntaId, updateData);
    }
    
    res.status(200).json({
      message: 'Estadísticas de pregunta actualizadas correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar estadísticas de pregunta:', error);
    res.status(500).json({
      message: 'Error en el servidor al actualizar estadísticas de pregunta'
    });
  }
};