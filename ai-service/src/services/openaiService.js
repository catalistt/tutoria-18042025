const { OpenAI } = require('openai');

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Genera una respuesta para el chatbot basada en el contexto
 */
exports.generateChatResponse = async (context) => {
  try {
    const { 
      preguntaTexto, 
      materiasRelacionadas = [], 
      historialUsuario = {}, 
      conversacion = [] 
    } = context;
    
    // Preparar el prompt del sistema
    const systemPrompt = `
      Eres un tutor educativo que ayuda a estudiantes chilenos.
      
      Información del estudiante:
      - Nivel general: ${historialUsuario.nivelGeneral || 'No especificado'}/10
      - Materias de interés: ${historialUsuario.materiasInteresadas?.join(', ') || 'No especificadas'}
      - Objetivos académicos: ${historialUsuario.objetivos || 'No especificados'}
      
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
      ...conversacion
    ];
    
    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Extraer la respuesta
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generando respuesta con OpenAI:', error);
    throw new Error(`Error en comunicación con OpenAI: ${error.message}`);
  }
};

/**
 * Genera una ruta de aprendizaje personalizada con IA
 */
exports.generateLearningPath = async (data) => {
  try {
    const {
      ejesUnidadesDominados = [],
      ejesUnidadesPorTrabajar = [],
      ejesUnidadesNoIniciados = [],
      objetivoPrincipal = 'Mejorar comprensión general',
      materiaInfo = {},
      nivelActual = 0
    } = data;
    
    // Construir prompt para la IA
    const prompt = `
      Genera una ruta de aprendizaje personalizada para un estudiante en la materia "${materiaInfo.nombre || 'No especificada'}".
      
      El objetivo principal del estudiante es: ${objetivoPrincipal}
      
      Nivel actual: ${nivelActual.toFixed(2)}/1.0
      
      Ejes y unidades ya dominados (nivel ≥ 0.7):
      ${ejesUnidadesDominados.map(eu => `- ${eu.eje}: ${eu.unidad} (Nivel: ${eu.nivel.toFixed(2)})`).join('\n')}
      
      Ejes y unidades iniciados pero no dominados (nivel < 0.7):
      ${ejesUnidadesPorTrabajar.map(eu => `- ${eu.eje}: ${eu.unidad} (Nivel: ${eu.nivel.toFixed(2)})`).join('\n')}
      
      Ejes y unidades no iniciados:
      ${ejesUnidadesNoIniciados.map(eu => `- ${eu.eje}: ${eu.unidad}`).join('\n')}
      
      Genera una ruta de aprendizaje con 5-8 módulos secuenciales, cada uno enfocado en un conjunto coherente de unidades.
      Incluye recomendaciones de ritmo de estudio y conceptos a reforzar.
      
      La respuesta debe ser un JSON con la siguiente estructura:
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un experto en educación personalizada y planificación de rutas de aprendizaje adaptativas.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    // Extraer la respuesta
    const responseContent = completion.choices[0].message.content;
    
    // Parsear el JSON
    try {
      const rutaData = JSON.parse(responseContent);
      
      // Procesar IDs de ejes-unidades
      for (const modulo of rutaData.modulos) {
        // Mapear IDs según los proporcionados en los datos
        modulo.ejeUnidadIncluidos = modulo.ejeUnidadIncluidos.map(idTexto => {
          // Si es un ID numérico (índice), convertirlo al ID real
          if (!isNaN(idTexto)) {
            const indice = parseInt(idTexto) - 1;
            const todosIds = [
              ...ejesUnidadesDominados, 
              ...ejesUnidadesPorTrabajar, 
              ...ejesUnidadesNoIniciados
            ];
            return todosIds[indice]?.id || todosIds[0]?.id || '000000000000000000000000';
          }
          
          // Si ya es un ID de la base de datos, usarlo directamente
          return idTexto;
        });
      }
      
      return rutaData;
    } catch (parseError) {
      console.error('Error parseando respuesta JSON:', parseError);
      throw new Error('La respuesta de la IA no es un JSON válido');
    }
  } catch (error) {
    console.error('Error generando ruta de aprendizaje con OpenAI:', error);
    throw new Error(`Error en comunicación con OpenAI: ${error.message}`);
  }
};

/**
 * Genera preguntas con IA
 */
exports.generateQuestions = async (data) => {
  try {
    const {
      ejeUnidad,
      materia,
      cantidad = 5,
      dificultad = 5,
      tipoPreguntas = 'seleccion_multiple'
    } = data;
    
    // Construir prompt para la IA
    const prompt = `
      Genera ${cantidad} preguntas de ${tipoPreguntas === 'seleccion_multiple' ? 'selección múltiple' : 'desarrollo'} 
      para estudiantes de ${ejeUnidad.nombre_grado || 'escuela'} 
      sobre la unidad "${ejeUnidad.unidad}" del eje temático "${ejeUnidad.ejeTematico}" 
      de la asignatura "${materia.nombre}".
      
      Descripción de la unidad: ${ejeUnidad.descripcion?.join(' ') || 'No especificada'}
      
      Nivel de dificultad: ${dificultad}/10
      
      El formato de cada pregunta debe ser un objeto JSON con la siguiente estructura:
      
      ${tipoPreguntas === 'seleccion_multiple' ? `
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
      ` : `
      {
        "enunciado": {
          "texto": "Texto completo de la pregunta de desarrollo",
          "tieneImagenes": false,
          "imagenesLatex": []
        },
        "respuestaEsperada": "Descripción de la respuesta ideal",
        "criteriosEvaluacion": ["Criterio 1", "Criterio 2", "Criterio 3"],
        "pistas": ["Primera pista", "Segunda pista"],
        "metadatos": {
          "habilidades": ["Resolver problemas", "Analizar"],
          "segundosEstimados": 300,
          "keywords": ["palabra clave 1", "palabra clave 2"],
          "nivelCognitivo": "análisis"
        }
      }
      `}
      
      Devuelve un array JSON con las ${cantidad} preguntas.
    `;
    
    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un experto en educación y en generación de preguntas de evaluación para estudiantes chilenos.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    // Extraer la respuesta
    const responseContent = completion.choices[0].message.content;
    
    // Parsear el JSON
    try {
      const response = JSON.parse(responseContent);
      
      // Verificar la estructura de la respuesta
      if (!Array.isArray(response.preguntas)) {
        // Si la respuesta no tiene un array "preguntas", intentamos encontrar el array en la respuesta
        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }
        
        // Si no encontramos un array, intentamos convertir el objeto en array
        if (typeof response === 'object') {
          return [response];
        }
        
        throw new Error('La respuesta no contiene un array de preguntas');
      }
      
      return response.preguntas;
    } catch (parseError) {
      console.error('Error parseando respuesta JSON:', parseError);
      
      // Intentar extraer un array JSON de la respuesta
      try {
        const regex = /\[\s*\{[\s\S]*\}\s*\]/g;
        const match = responseContent.match(regex);
        
        if (match && match[0]) {
          return JSON.parse(match[0]);
        }
      } catch (regexError) {
        console.error('Error extrayendo JSON con regex:', regexError);
      }
      
      throw new Error('La respuesta de la IA no es un JSON válido');
    }
  } catch (error) {
    console.error('Error generando preguntas con OpenAI:', error);
    throw new Error(`Error en comunicación con OpenAI: ${error.message}`);
  }
};