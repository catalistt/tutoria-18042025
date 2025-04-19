import api from './api';

class ChatbotService {
  /**
   * Envía un mensaje al chatbot y obtiene una respuesta
   * @param {Object} context - Contexto para el procesamiento del mensaje
   * @returns {Promise} - Promesa con la respuesta
   */
  async sendMessage(context) {
    try {
      const response = await api.post('/chatbot/mensaje', context);
      return response.data;
    } catch (error) {
      console.error('Error en ChatbotService.sendMessage:', error);
      throw error;
    }
  }
  
  /**
   * Guarda la valoración de una respuesta del chatbot
   * @param {string} preguntaId - ID de la pregunta
   * @param {Object} data - Datos de valoración
   * @returns {Promise} - Promesa con la respuesta
   */
  async saveRating(preguntaId, data) {
    try {
      const response = await api.post(`/chatbot/pregunta/${preguntaId}/valoracion`, data);
      return response.data;
    } catch (error) {
      console.error('Error en ChatbotService.saveRating:', error);
      throw error;
    }
  }
}

export default new ChatbotService();