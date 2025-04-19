const RutaPersonalizada = require('../models/rutaPersonalizada');
const Materia = require('../models/materia');
const Pregunta = require('../models/pregunta');
const EjeUnidad = require('../models/ejeUnidad');
const aiService = require('../services/aiService');

// Get learning path for a user and subject
exports.getRutaPersonalizada = async (req, res) => {
  try {
    const { userId, materiaId } = req.params;
    
    // Find the learning path
    const ruta = await RutaPersonalizada.findOne({
      usuarioId: userId,
      materiaId
    });
    
    if (!ruta) {
      return res.status(404).json({
        message: 'No se encontró una ruta personalizada para este usuario y materia'
      });
    }
    
    res.status(200).json({ ruta });
  } catch (error) {
    console.error('Error al obtener ruta personalizada:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener ruta personalizada'
    });
  }
};

// Create or update learning path
exports.crearOActualizarRuta = async (req, res) => {
  try {
    const { userId, materiaId } = req.params;
    const { objetivoPrincipal } = req.body;
    
    // Verify user and materia exist
    const materiaExists = await Materia.exists({ _id: materiaId });
    if (!materiaExists) {
      return res.status(404).json({
        message: 'Materia no encontrada'
      });
    }
    
    // Check if a learning path already exists
    let ruta = await RutaPersonalizada.findOne({
      usuarioId: userId,
      materiaId
    });
    
    // Generate a new learning path with AI
    const rutaData = await aiService.generarRutaPersonalizada(
      userId,
      materiaId,
      objetivoPrincipal || (ruta ? ruta.objetivoPrincipal : 'Mejorar comprensión general')
    );
    
    if (ruta) {
      // Update existing path
      ruta = await RutaPersonalizada.findByIdAndUpdate(
        ruta._id,
        {
          $set: {
            fechaActualizacion: Date.now(),
            objetivoPrincipal: rutaData.objetivoPrincipal,
            nivelInicialAciertos: rutaData.nivelInicialAciertos,
            nivelObjetivoAciertos: rutaData.nivelObjetivoAciertos,
            modulos: rutaData.modulos,
            recomendacionesActuales: rutaData.recomendacionesActuales
          }
        },
        { new: true }
      );
    } else {
      // Create new path
      ruta = new RutaPersonalizada({
        usuarioId: userId,
        materiaId,
        fechaCreacion: Date.now(),
        fechaActualizacion: Date.now(),
        objetivoPrincipal: rutaData.objetivoPrincipal,
        nivelInicialAciertos: rutaData.nivelInicialAciertos,
        nivelObjetivoAciertos: rutaData.nivelObjetivoAciertos,
        modulos: rutaData.modulos,
        recomendacionesActuales: rutaData.recomendacionesActuales
      });
      
      await ruta.save();
    }
    
    res.status(200).json({
      message: 'Ruta personalizada creada/actualizada exitosamente',
      ruta
    });
  } catch (error) {
    console.error('Error al crear/actualizar ruta personalizada:', error);
    res.status(500).json({
      message: 'Error en el servidor al crear/actualizar ruta personalizada'
    });
  }
};

// Get questions for a module
exports.getPreguntasModulo = async (req, res) => {
  try {
    const { userId, materiaId, moduloOrden } = req.params;
    
    // Find the learning path
    const ruta = await RutaPersonalizada.findOne({
      usuarioId: userId,
      materiaId
    });
    
    if (!ruta) {
      return res.status(404).json({
        message: 'No se encontró una ruta personalizada para este usuario y materia'
      });
    }
    
    // Find the module
    const modulo = ruta.modulos.find(m => m.orden.toString() === moduloOrden);
    if (!modulo) {
      return res.status(404).json({
        message: 'No se encontró el módulo especificado en la ruta'
      });
    }
    
    // Get questions for each eje-unidad in the module
    let preguntas = [];
    
    // If module already has questions, use them
    if (modulo.preguntas && modulo.preguntas.length > 0) {
      preguntas = await Pregunta.find({
        _id: { $in: modulo.preguntas }
      });
    } else {
      // Generate questions for each eje-unidad
      for (const ejeUnidadId of modulo.ejeUnidadIncluidos) {
        // Get existing questions
        const preguntasExistentes = await Pregunta.find({
          ejeUnidadId
        }).limit(5);
        
        preguntas = [...preguntas, ...preguntasExistentes];
        
        // If not enough questions, generate more
        if (preguntasExistentes.length < 5) {
          // Determine appropriate difficulty
          let dificultad = Math.floor(ruta.nivelInicialAciertos * 10) + 2;
          dificultad = Math.min(Math.max(dificultad, 1), 10); // Ensure between 1-10
          
          // Generate new questions
          const preguntasGeneradas = await aiService.generarPreguntas(
            ejeUnidadId,
            5 - preguntasExistentes.length,
            dificultad
          );
          
          preguntas = [...preguntas, ...preguntasGeneradas];
        }
      }
      
      // Update module with generated questions
      const preguntasIds = preguntas.map(p => p._id.toString());
      await RutaPersonalizada.updateOne(
        { _id: ruta._id, 'modulos.orden': parseInt(moduloOrden) },
        { $set: { 'modulos.$.preguntas': preguntasIds } }
      );
    }
    
    res.status(200).json({
      modulo,
      preguntas
    });
  } catch (error) {
    console.error('Error al obtener preguntas del módulo:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener preguntas del módulo'
    });
  }
};

// Update module completion status
exports.actualizarEstadoModulo = async (req, res) => {
  try {
    const { userId, materiaId, moduloOrden } = req.params;
    const { completado } = req.body;
    
    // Update module status
    const ruta = await RutaPersonalizada.findOneAndUpdate(
      {
        usuarioId: userId,
        materiaId,
        'modulos.orden': parseInt(moduloOrden)
      },
      {
        $set: {
          'modulos.$.logrado': completado
        }
      },
      { new: true }
    );
    
    if (!ruta) {
      return res.status(404).json({
        message: 'No se encontró la ruta o el módulo especificado'
      });
    }
    
    res.status(200).json({
      message: 'Estado del módulo actualizado exitosamente',
      ruta
    });
  } catch (error) {
    console.error('Error al actualizar estado del módulo:', error);
    res.status(500).json({
      message: 'Error en el servidor al actualizar estado del módulo'
    });
  }
};