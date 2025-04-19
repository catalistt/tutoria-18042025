import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Button, Loading } from '../common/UI';
import { Markdown } from '../common/Markdown';
import { useChatbot } from '../common/Chatbot/ChatbotProvider';
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid';

const ChatbotAssistant = ({ preguntaId, preguntaTexto, materiasRelacionadas }) => {
  const { user } = useSelector(state => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const { 
    conversations, 
    loading, 
    error, 
    sendMessage, 
    rateResponse 
  } = useChatbot();
  
  // Acceder a la conversación actual
  const currentConversation = conversations[preguntaId] || [];
  const isLoading = loading[preguntaId] || false;
  const currentError = error[preguntaId] || null;
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation, isLoading]);
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Preparar historial del usuario
    const historialUsuario = {
      nivelGeneral: user.engagement?.nivel || 1,
      materiasInteresadas: user.perfilAcademico?.materiaInicial || [],
      objetivos: user.perfilAcademico?.objetivoGeneral || 'Mejorar conocimientos'
    };
    
    // Enviar mensaje
    await sendMessage(
      preguntaId,
      preguntaTexto,
      newMessage,
      materiasRelacionadas,
      historialUsuario
    );
    
    setNewMessage('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleRateMessage = async (messageIndex, rating) => {
    await rateResponse(preguntaId, messageIndex, rating);
    // No actualizamos UI para mantener la experiencia simple
  };
  
  // Mensaje inicial de bienvenida si no hay conversación
  if (currentConversation.length === 0) {
    return (
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h3>Asistente TutorIA</h3>
        </div>
        
        <div className="chatbot-messages">
          <div className="message assistant">
            <div className="message-content">
              <Markdown content={`Hola ${user.nombre}, soy tu asistente para esta pregunta. ¿En qué puedo ayudarte?`} />
            </div>
          </div>
          
          {isLoading && (
            <div className="message assistant loading">
              <Loading size="small" />
            </div>
          )}
          
          {currentError && (
            <div className="message error">
              <div className="message-content">
                <p>{currentError}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chatbot-input">
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Haz una pregunta sobre este ejercicio..."
            rows={2}
          />
          <Button onClick={handleSendMessage} primary disabled={!newMessage.trim() || isLoading}>
            Enviar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Asistente TutorIA</h3>
      </div>
      
      <div className="chatbot-messages">
        <div className="message assistant">
          <div className="message-content">
            <Markdown content={`Hola ${user.nombre}, soy tu asistente para esta pregunta. ¿En qué puedo ayudarte?`} />
          </div>
        </div>
        
        {currentConversation.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              <Markdown content={message.content} />
            </div>
            
            {message.role === 'assistant' && (
              <div className="message-actions">
                <button 
                  onClick={() => handleRateMessage(index, 1)} 
                  className="text-neutral-400 hover:text-green-500"
                  title="Útil"
                >
                  <ThumbUpIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleRateMessage(index, -1)} 
                  className="text-neutral-400 hover:text-red-500 ml-2"
                  title="No útil"
                >
                  <ThumbDownIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <Loading size="small" />
          </div>
        )}
        
        {currentError && (
          <div className="message error">
            <div className="message-content">
              <p>{currentError}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input">
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Haz una pregunta sobre este ejercicio..."
          rows={2}
        />
        <Button onClick={handleSendMessage} primary disabled={!newMessage.trim() || isLoading}>
          Enviar
        </Button>
      </div>
    </div>
  );
};

ChatbotAssistant.propTypes = {
  preguntaId: PropTypes.string.isRequired,
  preguntaTexto: PropTypes.string.isRequired,
  materiasRelacionadas: PropTypes.arrayOf(PropTypes.string)
};

ChatbotAssistant.defaultProps = {
  materiasRelacionadas: []
};

export default ChatbotAssistant;