const User = require('../models/usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, nombre, fechaNacimiento, grado, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Create user object
    const user = new User({
      email,
      nombre,
      fechaNacimiento,
      grado,
      password: await bcrypt.hash(password, 10),
      perfilAcademico: {
        curso: grado,
        objetivoGeneral: 'Sin definir',
        tiempoEstudioSemanal: 5,
        materiaInicial: []
      },
      metadatos: {
        fechaRegistro: Date.now(),
        dispositivoRegistro: req.headers['user-agent'] || 'Unknown',
        dispositivosUsados: [req.headers['user-agent'] || 'Unknown']
      }
    });

    // Save user
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        _id: user._id,
        email: user.email,
        nombre: user.nombre,
        grado: user.grado
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      message: 'Error en el servidor al registrar usuario'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Update engagement metrics
    const today = new Date();
    const lastLogin = new Date(user.engagement.ultimoLogin);
    const isConsecutiveDay = (
      today.getDate() === lastLogin.getDate() + 1 &&
      today.getMonth() === lastLogin.getMonth() &&
      today.getFullYear() === lastLogin.getFullYear()
    );

    // Update user login data
    const updateData = {
      'engagement.ultimoLogin': Date.now(),
    };

    if (isConsecutiveDay) {
      updateData['engagement.diasConsecutivos'] = user.engagement.diasConsecutivos + 1;
      if (user.engagement.diasConsecutivos + 1 > user.engagement.maxConsecutivos) {
        updateData['engagement.maxConsecutivos'] = user.engagement.diasConsecutivos + 1;
      }
    } else if (!isConsecutiveDay && lastLogin.getDate() !== today.getDate()) {
      updateData['engagement.diasConsecutivos'] = 1;
    }

    await User.findByIdAndUpdate(user._id, { $set: updateData });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        _id: user._id,
        email: user.email,
        nombre: user.nombre,
        grado: user.grado,
        engagement: {
          ...user.engagement,
          ...updateData.engagement
        }
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      message: 'Error en el servidor al iniciar sesión'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener perfil'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updateData = {};
    const allowedFields = [
      'nombre',
      'grado',
      'perfilAcademico.objetivoGeneral',
      'perfilAcademico.tiempoEstudioSemanal',
      'perfilAcademico.materiaInicial',
      'metadatos.regionDomicilio',
      'metadatos.comunaDomicilio',
      'metadatos.establecimientoEducacional.nombre',
      'metadatos.establecimientoEducacional.tipo',
      'metadatos.establecimientoEducacional.region',
      'metadatos.siCompartirDatosAnonimos',
      'metadatos.siCompartirProgreso'
    ];

    // Filter allowed fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Add metadata about the update
    updateData['metadatos.ultimaActualizacionPerfil'] = Date.now();

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      message: 'Error en el servidor al actualizar perfil'
    });
  }
};