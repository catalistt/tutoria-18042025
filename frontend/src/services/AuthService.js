import api from './api';

class AuthService {
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} - Promesa con la respuesta
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response;
  }

  /**
   * Iniciar sesión
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Object} - Datos del usuario
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('user');
  }

  /**
   * Obtener perfil del usuario
   * @returns {Promise} - Promesa con la respuesta
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} - Promesa con la respuesta
   */
  async updateProfile(userData) {
    const response = await api.put('/users/profile', userData);
    
    // Actualizar datos en localStorage si hay token
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          ...response.data.user,
        })
      );
    }
    
    return response.data;
  }

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Correo electrónico
   * @returns {Promise} - Promesa con la respuesta
   */
  async requestPasswordReset(email) {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  }

  /**
   * Restablecer contraseña
   * @param {string} token - Token de recuperación
   * @param {string} password - Nueva contraseña
   * @returns {Promise} - Promesa con la respuesta
   */
  async resetPassword(token, password) {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
}

export default new AuthService();