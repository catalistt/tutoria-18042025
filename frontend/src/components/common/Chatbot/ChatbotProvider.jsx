import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ChatbotService from '../../../services/ChatbotService';

// Crear contexto
const ChatbotContext = createContext();

// Hook para usar el contexto
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot debe ser usado dentro de un ChatbotProvider');
  }
  return context;
};

// Proveedor del contexto
export const ChatbotProvider = ({ children }) => {
  // Estado para almacenar las conversaciones por pregunta
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  
  // Función para enviar un mensaje
  const sendMessage = useCallback(async (preguntaId, preguntaTexto, message, materiasRelacionadas, historialUsuario) => {
    try {
      // Iniciar carga
      setLoading(prev => ({ ...prev, [preguntaId]: true }));
      setError(prev => ({ ...prev, [preguntaId]: null }));
      
      // Obtener conversación actual o crear una nueva
      const currentConversation = conversations[preguntaId] || [];
      
      // Agregar mensaje del usuario
      const userMessage = { role: 'user', content: message };
      const updatedConversation = [...currentConversation, userMessage];
      
      // Actualizar estado de conversación
      setConversations(prev => ({
        ...prev,
        [preguntaId]: updatedConversation
      }));
      
      // Preparar contexto para la petición
      const context = {
        preguntaId,
        preguntaTexto,
        materiasRelacionadas,
        historialUsuario,
        conversacion: updatedConversation
      };
      
      // Enviar petición
      const response = await ChatbotService.sendMessage(context);
      
      // Crear mensaje de respuesta
      const assistantMessage = { role: 'assistant', content: response.respuesta };
      
      // Actualizar conversación con respuesta
      const finalConversation = [...updatedConversation, assistantMessage];
      setConversations(prev => ({
        ...prev,
        [preguntaId]: finalConversation
      }));
      
      return assistantMessage;
    } catch (err) {
      console.error('Error al enviar mensaje al chatbot:', err);
      setError(prev => ({ 
        ...prev, 
        [preguntaId]: 'Error al comunicarse con el asistente. Por favor, intente nuevamente.' 
      }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [preguntaId]: false }));
    }
  }, [conversations]);
  
  // Función para valorar una respuesta
  const rateResponse = useCallback(async (preguntaId, messageIndex, rating) => {
    try {
      if (!conversations[preguntaId] || !conversations[preguntaId][messageIndex]) {
        throw new Error('Mensaje no encontrado');
      }
      
      // Enviar valoración
      await ChatbotService.saveRating(preguntaId, {
        messageIndex,
        rating,
        message: conversations[preguntaId][messageIndex].content
      });
      
      return true;
    } catch (err) {
      console.error('Error al valorar respuesta:', err);
      return false;
    }
  }, [conversations]);
  
  // Función para reiniciar una conversación
  const resetConversation = useCallback((preguntaId) => {
    setConversations(prev => {
      const updated = { ...prev };
      delete updated[preguntaId];
      return updated;
    });
    setLoading(prev => {
      const updated = { ...prev };
      delete updated[preguntaId];
      return updated;
    });
    setError(prev => {
      const updated = { ...prev };
      delete updated[preguntaId];
      return updated;
    });
  }, []);
  
  // Valores a compartir en el contexto
  const value = {
    conversations,
    loading,
    error,
    sendMessage,
    rateResponse,
    resetConversation
  };
  
  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

ChatbotProvider.propTypes = {
  children: PropTypes.node.isRequired
};