import api from './api';

class RutaService {
  /**
   * Obtiene la ruta personalizada para un usuario y materia
   * @param {string} userId - ID del usuario
   * @param {string} materiaId - ID de la materia
   * @returns {Promise} - Promesa con la respuesta
   */
  async getRuta(userId, materiaId) {
    try {
      const response = await api.get(`/rutas/usuario/${userId}/materia/${materiaId}`);
      return response.data;
    } catch (error) {
      console.error('Error en RutaService.getRuta:', error);
      throw error;
    }
  }
  
  /**
   * Crea o actualiza una ruta personalizada
   * @param {string} userId - ID del usuario
   * @param {string} materiaId - ID de la materia
   * @param {Object} data - Datos de la ruta
   * @returns {Promise} - Promesa con la respuesta
   */
  async crearOActualizarRuta(userId, materiaId, data) {
    try {
      const response = await api.post(`/rutas/usuario/${userId}/materia/${materiaId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en RutaService.crearOActualizarRuta:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene las preguntas para un módulo de ruta
   * @param {string} userId - ID del usuario
   * @param {string} materiaId - ID de la materia
   * @param {number} moduloOrden - Orden del módulo
   * @returns {Promise} - Promesa con la respuesta
   */
  async getPreguntasModulo(userId, materiaId, moduloOrden) {
    try {
      const response = await api.get(`/rutas/usuario/${userId}/materia/${materiaId}/modulo/${moduloOrden}/preguntas`);
      return response.data;
    } catch (error) {
      console.error('Error en RutaService.getPreguntasModulo:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el estado de un módulo
   * @param {string} userId - ID del usuario
   * @param {string} materiaId - ID de la materia
   * @param {number} moduloOrden - Orden del módulo
   * @param {boolean} completado - Estado de completitud
   * @returns {Promise} - Promesa con la respuesta
   */
  async actualizarEstadoModulo(userId, materiaId, moduloOrden, completado) {
    try {
      const response = await api.put(`/rutas/usuario/${userId}/materia/${materiaId}/modulo/${moduloOrden}`, {
        completado
      });
      return response.data;
    } catch (error) {
      console.error('Error en RutaService.actualizarEstadoModulo:', error);
      throw error;
    }
  }
}

export default new RutaService();