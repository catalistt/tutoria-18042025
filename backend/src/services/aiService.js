const axios = require('axios');
const Pregunta = require('../models/pregunta');
const EjeUnidad = require('../models/ejeUnidad');
const UsuarioEjeUnidad = require('../models/usuarioEjeUnidad');
const config = require('../config');

/**
 * Servicio para generación de preguntas con IA
 */
exports.generarPreguntas = async (ejeUnidadId, cantidad, dificultad) => {
  try {
    // Obtener información del eje unidad
    const ejeUnidad = await EjeUnidad.findById(ejeUnidadId)
      .populate('materia');
    
    if (!ejeUnidad) {
      throw new Error('Eje-unidad no encontrado');
    }
    
    // Construir prompt para la IA
    const prompt = `
      Genera ${cantidad} preguntas de selección múltiple para estudiantes de ${ejeUnidad.nombre_grado} 
      sobre la unidad "${ejeUnidad.unidad}" del eje temático "${ejeUnidad.ejeTematico}" 
      de la asignatura "${ejeUnidad.materia.nombre}".
      
      Descripción de la unidad: ${ejeUnidad.descripcion.join(' ')}
      
      Nivel de dificultad: ${dificultad}/10
      
      El formato de cada pregunta debe ser:
      {
        "enunciado": {
          "texto": "Texto completo de la pregunta",
          "tieneImagenes": false,
          "imagenesLatex": []
        },
        "alternativas": [
          {
            "identificador": "a",
            "texto": "Primera alternativa"
          },
          {
            "identificador": "b",
            "texto": "Segunda alternativa"
          },
          {
            "identificador": "c",
            "texto": "Tercera alternativa"
          },
          {
            "identificador": "d",
            "texto": "Cuarta alternativa"
          }
        ],
        "alternativasCorrectas": ["a"],
        "pistas": ["Primera pista", "Segunda pista"],
        "metadatos": {
          "habilidades": ["Resolver problemas", "Analizar"],
          "segundosEstimados": 120,
          "keywords": ["palabra clave 1", "palabra clave 2"],
          "nivelCognitivo": "aplicación"
        }
      }
    `;
    
    // Llamar a la API de OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un experto en educación y en generación de preguntas de selección múltiple para estudiantes chilenos.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extraer la respuesta
    const contenido = response.data.choices[0].message.content;
    
    // Procesar la respuesta para extraer las preguntas en formato JSON
    const regex = /```json\n([\s\S]*?)\n```|{[\s\S]*?}/g;
    const matches = [...contenido.matchAll(regex)];
    
    const preguntasGeneradas = [];
    
    for (const match of matches) {
      try {
        // Extraer el JSON ya sea de un bloque de código o directamente
        const jsonString = match[1] || match[0];
        const preguntaData = JSON.parse(jsonString);
        
        // Añadir datos faltantes
        preguntaData.ejeUnidadId = ejeUnidadId;
        preguntaData.dificultad = dificultad;
        preguntaData.metadatos.fechaCreacion = new Date();
        preguntaData.metadatos.autor = 'IA TutorIA';
        preguntaData.metadatos.fuente = 'generación automática';
        preguntaData.estadisticas = {
          vecesUtilizada: 0,
          tasaAcierto: 0.5, // Valor inicial
          segundosPromedioRespuesta: preguntaData.metadatos.segundosEstimados,
          dificultadHistorica: dificultad / 10,
          vecesReportada: 0
        };
        
        // Crear la pregunta en la base de datos
        const nuevaPregunta = new Pregunta(preguntaData);
        const preguntaGuardada = await nuevaPregunta.save();
        
        preguntasGeneradas.push(preguntaGuardada);
      } catch (err) {
        console.error('Error al procesar pregunta generada:', err);
      }
    }
    
    return preguntasGeneradas;
  } catch (error) {
    console.error('Error en generación de preguntas:', error);
    throw error;
  }
};

/**
 * Servicio para procesar mensajes del chatbot
 */
exports.procesarMensajeChatbot = async (contexto) => {
  try {
    const { preguntaId, preguntaTexto, materiasRelacionadas, historialUsuario, conversacion } = contexto;
    
    // Preparar el prompt del sistema
    const systemPrompt = `
      Eres un tutor educativo que ayuda a estudiantes chilenos.
      
      Información del estudiante:
      - Nivel general: ${historialUsuario.nivelGeneral}/10
      - Materias de interés: ${historialUsuario.materiasInteresadas.join(', ')}
      - Objetivos académicos: ${historialUsuario.objetivos}
      
      Estás respondiendo sobre esta pregunta específica:
      "${preguntaTexto}"
      
      Materias relacionadas: ${materiasRelacionadas.join(', ')}
      
      Directrices:
      1. Nunca des la respuesta directa, guía al estudiante para que llegue a ella.
      2. Usa un lenguaje claro y adaptado al nivel del estudiante.
      3. Ofrece pistas graduales que incrementen en especificidad.
      4. Si el estudiante está frustrado, dale ánimo y descompón el problema.
      5. Relaciona los conceptos con ejemplos de la vida real cuando sea posible.
      6. Refuerza conceptos previos si son necesarios para resolver la pregunta.
      7. Felicita genuinamente cuando el estudiante muestra comprensión.
    `;
    
    // Preparar mensajes para la API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversacion.slice(-10) // Últimos 10 mensajes para mantener contexto sin exceder límites
    ];
    
    // Llamar a la API de OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extraer la respuesta
    const respuesta = response.data.choices[0].message.content;
    
    return { respuesta };
  } catch (error) {
    console.error('Error en procesamiento de mensaje de chatbot:', error);
    throw error;
  }
};

/**
 * Servicio para generar rutas de aprendizaje personalizadas
 */
exports.generarRutaPersonalizada = async (usuarioId, materiaId, objetivoPrincipal) => {
  try {
    // Obtener perfil académico del usuario
    const usuarioEjeUnidades = await UsuarioEjeUnidad.find({ usuarioId })
      .populate({
        path: 'ejeUnidadId',
        match: { materia: materiaId },
        populate: { path: 'materia' }
      });
    
    // Filtrar entradas vacías (de otras materias)
    const progresoMateria = usuarioEjeUnidades.filter(ueu => ueu.ejeUnidadId !== null);
    
    // Obtener todos los ejes-unidades de la materia para identificar los que faltan
    const todosEjesUnidades = await EjeUnidad.find({ materia: materiaId })
      .populate('materia');
    
    // Preparar datos para la IA
    const ejesUnidadesDominados = progresoMateria
      .filter(ueu => ueu.nivelGeneral >= 0.7)
      .map(ueu => ({
        id: ueu.ejeUnidadId._id,
        eje: ueu.ejeUnidadId.ejeTematico,
        unidad: ueu.ejeUnidadId.unidad,
        nivel: ueu.nivelGeneral
      }));
    
    const ejesUnidadesPorTrabajar = progresoMateria
      .filter(ueu => ueu.nivelGeneral < 0.7)
      .map(ueu => ({
        id: ueu.ejeUnidadId._id,
        eje: ueu.ejeUnidadId.ejeTematico,
        unidad: ueu.ejeUnidadId.unidad,
        nivel: ueu.nivelGeneral
      }));
    
    const ejesUnidadesNoIniciados = todosEjesUnidades
      .filter(eu => !progresoMateria.some(ueu => ueu.ejeUnidadId._id.toString() === eu._id.toString()))
      .map(eu => ({
        id: eu._id,
        eje: eu.ejeTematico,
        unidad: eu.unidad,
        nivel: 0
      }));
    
    // Calcular nivel inicial promedio
    let nivelInicial = 0;
    if (progresoMateria.length > 0) {
      nivelInicial = progresoMateria.reduce((sum, ueu) => sum + ueu.nivelGeneral, 0) / progresoMateria.length;
    }
    
    // Construir prompt para la IA
    const prompt = `
      Genera una ruta de aprendizaje personalizada para un estudiante en la materia "${todosEjesUnidades[0]?.materia.nombre || 'No especificada'}".
      
      El objetivo principal del estudiante es: ${objetivoPrincipal || 'Mejorar su comprensión general de la materia'}
      
      Nivel actual: ${nivelInicial.toFixed(2)}/1.0
      
      Ejes y unidades ya dominados (nivel ≥ 0.7):
      ${ejesUnidadesDominados.map(eu => `- ${eu.eje}: ${eu.unidad} (Nivel: ${eu.nivel.toFixed(2)})`).join('\n')}
      
      Ejes y unidades iniciados pero no dominados (nivel < 0.7):
      ${ejesUnidadesPorTrabajar.map(eu => `- ${eu.eje}: ${eu.unidad} (Nivel: ${eu.nivel.toFixed(2)})`).join('\n')}
      
      Ejes y unidades no iniciados:
      ${ejesUnidadesNoIniciados.map(eu => `- ${eu.eje}: ${eu.unidad}`).join('\n')}
      
      Genera una ruta de aprendizaje con 5-8 módulos secuenciales, cada uno enfocado en un conjunto coherente de unidades.
      Incluye recomendaciones de ritmo de estudio y conceptos a reforzar.
      
      La respuesta debe tener el siguiente formato JSON:
      {
        "nivelInicialAciertos": 0.4,
        "nivelObjetivoAciertos": 0.8,
        "modulos": [
          {
            "orden": 1,
            "titulo": "Título descriptivo del módulo",
            "ejeUnidadIncluidos": ["id1", "id2"],
            "descripcion": "Descripción detallada",
            "minutosEstimados": 45
          }
        ],
        "recomendacionesActuales": {
          "ejesEnfoque": ["Eje 1", "Eje 2"],
          "conceptosReforzar": ["Concepto 1", "Concepto 2"],
          "ritmoSugerido": "3 sesiones semanales",
          "descansoRecomendado": "15 minutos entre sesiones"
        }
      }
    `;
    
    // Llamar a la API de OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un experto en educación personalizada y planificación de rutas de aprendizaje adaptativas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extraer la respuesta
    const contenido = response.data.choices[0].message.content;
    
    // Procesar la respuesta para extraer el JSON
    const regex = /```json\n([\s\S]*?)\n```|{[\s\S]*?}/;
    const match = regex.exec(contenido);
    
    if (!match) {
      throw new Error('No se pudo extraer un JSON válido de la respuesta');
    }
    
    // Extraer el JSON ya sea de un bloque de código o directamente
    const jsonString = match[1] || match[0];
    const rutaData = JSON.parse(jsonString);
    
    // Procesar IDs de ejes-unidades
    for (const modulo of rutaData.modulos) {
      // Convertir IDs de texto a IDs reales de la base de datos
      modulo.ejeUnidadIncluidos = modulo.ejeUnidadIncluidos.map(idTexto => {
        // Buscar el eje-unidad real que corresponde a este índice
        const todosIds = [
          ...ejesUnidadesDominados, 
          ...ejesUnidadesPorTrabajar, 
          ...ejesUnidadesNoIniciados
        ];
        
        // Si es un ID numérico (índice), convertirlo al ID real
        if (!isNaN(idTexto)) {
          const indice = parseInt(idTexto) - 1;
          return todosIds[indice]?.id || todosIds[0].id;
        }
        
        // Si ya es un ID de la base de datos, usarlo directamente
        return idTexto;
      });
    }
    
    return {
      usuarioId,
      materiaId,
      objetivoPrincipal,
      nivelInicialAciertos: rutaData.nivelInicialAciertos,
      nivelObjetivoAciertos: rutaData.nivelObjetivoAciertos,
      modulos: rutaData.modulos,
      recomendacionesActuales: rutaData.recomendacionesActuales
    };
  } catch (error) {
    console.error('Error en generación de ruta personalizada:', error);
    throw error;
  }
};