const Materia = require('../models/materia');
const EjeUnidad = require('../models/ejeUnidad');
const Usuario = require('../models/usuario');
const UsuarioEjeUnidad = require('../models/usuarioEjeUnidad');

// Get all subjects
exports.getAllMaterias = async (req, res) => {
  try {
    const materias = await Materia.find();
    res.status(200).json({ materias });
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener materias'
    });
  }
};

// Get subject by ID
exports.getMateriaById = async (req, res) => {
  try {
    const materia = await Materia.findById(req.params.id);
    if (!materia) {
      return res.status(404).json({
        message: 'Materia no encontrada'
      });
    }
    res.status(200).json({ materia });
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener materia'
    });
  }
};

// Get subjects for a specific user with progress data
exports.getMateriasByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    
    // Verify user exists
    const userExists = await Usuario.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }
    
    // Get all materias
    const materias = await Materia.find();
    
    // Get user progress for all materias
    const userEjeUnidades = await UsuarioEjeUnidad.find({ usuarioId: userId });
    
    // Get all ejes-unidades to calculate progress
    const ejesUnidades = await EjeUnidad.find();
    
    // Calculate progress for each materia
    const materiasConProgreso = await Promise.all(materias.map(async (materia) => {
      // Find all ejes-unidades for this materia
      const materiaEjesUnidades = ejesUnidades.filter(eu => eu.materia.toString() === materia._id.toString());
      
      // Find user progress entries for this materia's ejes-unidades
      const progresoEntries = userEjeUnidades.filter(ueu => 
        materiaEjesUnidades.some(meu => meu._id.toString() === ueu.ejeUnidadId.toString())
      );
      
      // Calculate average progress
      let progresoPromedio = 0;
      if (progresoEntries.length > 0) {
        progresoPromedio = progresoEntries.reduce((sum, entry) => sum + entry.nivelGeneral, 0) / progresoEntries.length;
      }
      
      return {
        ...materia.toObject(),
        progreso: progresoPromedio,
        ejeUnidadesCompletados: progresoEntries.filter(p => p.nivelGeneral >= 0.7).length,
        totalEjeUnidades: materiaEjesUnidades.length
      };
    }));
    
    res.status(200).json({ materias: materiasConProgreso });
  } catch (error) {
    console.error('Error al obtener materias del usuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener materias del usuario'
    });
  }
};

// Get topic units for a subject
exports.getEjesUnidadesByMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    
    // Verify materia exists
    const materiaExists = await Materia.exists({ _id: materiaId });
    if (!materiaExists) {
      return res.status(404).json({
        message: 'Materia no encontrada'
      });
    }
    
    // Get all ejes-unidades for the materia
    const ejesUnidades = await EjeUnidad.find({ materia: materiaId }).sort('ejeTematico unidad');
    
    // Group by ejeTematico
    const ejesPorTematica = ejesUnidades.reduce((groups, item) => {
      const group = groups[item.ejeTematico] || [];
      group.push(item);
      groups[item.ejeTematico] = group;
      return groups;
    }, {});
    
    res.status(200).json({
      materiaId,
      ejesTematicos: Object.keys(ejesPorTematica),
      ejesUnidades: ejesPorTematica
    });
  } catch (error) {
    console.error('Error al obtener ejes-unidades:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener ejes-unidades'
    });
  }
};

// Get user progress for a specific subject
exports.getUsuarioProgresoMateria = async (req, res) => {
  try {
    const { userId, materiaId } = req.params;
    
    // Verify user and materia exist
    const userExists = await Usuario.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }
    
    const materiaExists = await Materia.exists({ _id: materiaId });
    if (!materiaExists) {
      return res.status(404).json({
        message: 'Materia no encontrada'
      });
    }
    
    // Get all ejes-unidades for the materia
    const ejesUnidades = await EjeUnidad.find({ materia: materiaId });
    
    // Get user progress for those ejes-unidades
    const userEjeUnidades = await UsuarioEjeUnidad.find({
      usuarioId: userId,
      ejeUnidadId: { $in: ejesUnidades.map(eu => eu._id) }
    });
    
    // Calculate progress statistics
    const ejeUnidadesTotal = ejesUnidades.length;
    const ejeUnidadesIniciados = userEjeUnidades.length;
    const ejeUnidadesCompletados = userEjeUnidades.filter(ueu => ueu.nivelGeneral >= 0.7).length;
    
    let progresoGeneral = 0;
    if (userEjeUnidades.length > 0) {
      progresoGeneral = userEjeUnidades.reduce((sum, ueu) => sum + ueu.nivelGeneral, 0) / userEjeUnidades.length;
    }
    
    // Get detailed progress by ejes tematicos
    const progresoPorEje = {};
    ejesUnidades.forEach(eu => {
      if (!progresoPorEje[eu.ejeTematico]) {
        progresoPorEje[eu.ejeTematico] = {
          total: 0,
          completados: 0,
          progreso: 0
        };
      }
      
      progresoPorEje[eu.ejeTematico].total++;
      
      const userProgress = userEjeUnidades.find(ueu => ueu.ejeUnidadId.toString() === eu._id.toString());
      if (userProgress) {
        progresoPorEje[eu.ejeTematico].progreso += userProgress.nivelGeneral;
        if (userProgress.nivelGeneral >= 0.7) {
          progresoPorEje[eu.ejeTematico].completados++;
        }
      }
    });
    
    // Calculate average progress for each eje
    Object.keys(progresoPorEje).forEach(eje => {
      if (progresoPorEje[eje].total > 0) {
        progresoPorEje[eje].progreso = progresoPorEje[eje].progreso / progresoPorEje[eje].total;
      }
    });
    
    res.status(200).json({
      materiaId,
      userId,
      resumen: {
        ejeUnidadesTotal,
        ejeUnidadesIniciados,
        ejeUnidadesCompletados,
        progresoGeneral
      },
      progresoPorEje
    });
  } catch (error) {
    console.error('Error al obtener progreso de materia:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener progreso de materia'
    });
  }
};