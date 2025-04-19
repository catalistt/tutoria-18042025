const Gamificacion = require('../models/gamificacion');
const Usuario = require('../models/usuario');

// Get user gamification data
exports.getGamificacionUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find or create gamification record
    let gamificacion = await Gamificacion.findOne({ usuarioId: userId });
    
    if (!gamificacion) {
      // Create default gamification record
      gamificacion = new Gamificacion({
        usuarioId: userId,
        ultimaActualizacion: Date.now(),
        nivel: 1,
        puntosTotales: 0,
        puntosParaSiguienteNivel: 1000,
        diasDeRachaActual: 0,
        diasDeRachaMax: 0
      });
      
      await gamificacion.save();
    }
    
    res.status(200).json({ gamificacion });
  } catch (error) {
    console.error('Error al obtener datos de gamificación:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener datos de gamificación'
    });
  }
};

// Update user streak
exports.actualizarRacha = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }
    
    // Find gamification record
    const gamificacion = await Gamificacion.findOne({ usuarioId: userId });
    if (!gamificacion) {
      return res.status(404).json({
        message: 'Registro de gamificación no encontrado'
      });
    }
    
    // Check if user logged in today
    const today = new Date();
    const lastLogin = new Date(usuario.engagement.ultimoLogin);
    
    // Check if last login was today
    const isToday = (
      today.getDate() === lastLogin.getDate() &&
      today.getMonth() === lastLogin.getMonth() &&
      today.getFullYear() === lastLogin.getFullYear()
    );
    
    // Check if last login was yesterday
    const isYesterday = (
      today.getDate() === lastLogin.getDate() + 1 &&
      today.getMonth() === lastLogin.getMonth() &&
      today.getFullYear() === lastLogin.getFullYear()
    ) || (
      lastLogin.getDate() === new Date(
        lastLogin.getFullYear(), 
        lastLogin.getMonth() + 1, 
        0
      ).getDate() && // Last day of month
      today.getDate() === 1 &&
      (
        (today.getMonth() === lastLogin.getMonth() + 1 && today.getFullYear() === lastLogin.getFullYear()) ||
        (today.getMonth() === 0 && lastLogin.getMonth() === 11 && today.getFullYear() === lastLogin.getFullYear() + 1)
      )
    );
    
    // Update streak
    if (isToday) {
      // Do nothing, already counted for today
    } else if (isYesterday) {
      // Increment streak
      gamificacion.diasDeRachaActual++;
      // Update max streak if needed
      if (gamificacion.diasDeRachaActual > gamificacion.diasDeRachaMax) {
        gamificacion.diasDeRachaMax = gamificacion.diasDeRachaActual;
      }
    } else {
      // Reset streak
      gamificacion.diasDeRachaActual = 1;
    }
    
    // Add streak bonus points
    if (gamificacion.diasDeRachaActual > 1) {
      const rachaBonus = Math.min(gamificacion.diasDeRachaActual * 5, 50); // Cap at 50 points
      gamificacion.puntosTotales += rachaBonus;
    }
    
    // Update last update timestamp
    gamificacion.ultimaActualizacion = Date.now();
    
    await gamificacion.save();
    
    res.status(200).json({
      message: 'Racha actualizada exitosamente',
      gamificacion
    });
  } catch (error) {
    console.error('Error al actualizar racha:', error);
    res.status(500).json({
      message: 'Error en el servidor al actualizar racha'
    });
  }
};

// Handle challenge completion
exports.completarDesafio = async (req, res) => {
  try {
    const { userId, desafioId } = req.params;
    
    // Find gamification record
    const gamificacion = await Gamificacion.findOne({ usuarioId: userId });
    if (!gamificacion) {
      return res.status(404).json({
        message: 'Registro de gamificación no encontrado'
      });
    }
    
    // Find the challenge
    const desafio = gamificacion.desafios.find(d => d.id === desafioId);
    if (!desafio) {
      return res.status(404).json({
        message: 'Desafío no encontrado'
      });
    }
    
    // Check if already completed
    if (desafio.completado) {
      return res.status(400).json({
        message: 'Este desafío ya fue completado'
      });
    }
    
    // Mark as completed
    desafio.completado = true;
    
    // Award points
    if (desafio.tipoRecompensa === 'puntos') {
      gamificacion.puntosTotales += desafio.cantidadRecompensa;
    }
    
    // Check for level up
    if (gamificacion.puntosTotales >= gamificacion.puntosParaSiguienteNivel) {
      gamificacion.nivel += 1;
      gamificacion.puntosParaSiguienteNivel = Math.floor(gamificacion.puntosParaSiguienteNivel * 1.5);
      
      // Also update user engagement level
      await Usuario.findByIdAndUpdate(
        userId,
        {
          $set: {
            'engagement.nivel': gamificacion.nivel
          }
        }
      );
    }
    
    await gamificacion.save();
    
    res.status(200).json({
      message: 'Desafío completado exitosamente',
      gamificacion
    });
  } catch (error) {
    console.error('Error al completar desafío:', error);
    res.status(500).json({
      message: 'Error en el servidor al completar desafío'
    });
  }
};

// Purchase reward
exports.comprarRecompensa = async (req, res) => {
  try {
    const { userId, recompensaId } = req.params;
    
    // Find gamification record
    const gamificacion = await Gamificacion.findOne({ usuarioId: userId });
    if (!gamificacion) {
      return res.status(404).json({
        message: 'Registro de gamificación no encontrado'
      });
    }
    
    // Find the reward
    const recompensa = gamificacion.recompensasDisponibles.find(r => r.id === recompensaId);
    if (!recompensa) {
      return res.status(404).json({
        message: 'Recompensa no encontrada'
      });
    }
    
    // Check if already purchased
    if (recompensa.desbloqueado) {
      return res.status(400).json({
        message: 'Esta recompensa ya fue desbloqueada'
      });
    }
    
    // Check if user has enough points
    if (gamificacion.puntosTotales < recompensa.costo) {
      return res.status(400).json({
        message: 'No tienes suficientes puntos para esta recompensa'
      });
    }
    
    // Purchase reward
    recompensa.desbloqueado = true;
    gamificacion.puntosTotales -= recompensa.costo;
    
    await gamificacion.save();
    
    res.status(200).json({
      message: 'Recompensa desbloqueada exitosamente',
      gamificacion
    });
  } catch (error) {
    console.error('Error al comprar recompensa:', error);
    res.status(500).json({
      message: 'Error en el servidor al comprar recompensa'
    });
  }
};