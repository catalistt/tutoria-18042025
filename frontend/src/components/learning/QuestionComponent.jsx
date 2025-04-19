import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Markdown } from '../common/Markdown';
import { ImageRenderer, LatexRenderer, TableRenderer } from '../common/Renderers';
import { Button, Timer } from '../common/UI';
import { ChatbotAssistant } from './ChatbotAssistant';
import { saveAnswer, reportQuestion, bookmarkQuestion } from '../../store/slices/sessionSlice';

const QuestionComponent = ({ 
  pregunta, 
  onAnswerSubmit, 
  tiempoSugerido, 
  showFeedback = true,
  allowSkip = false
}) => {
  const dispatch = useDispatch();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPista, setShowPista] = useState(false);
  const [pistaActual, setPistaActual] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowPista(false);
    setPistaActual(0);
    setShowChatbot(false);
    setTimeSpent(0);
    setTimerActive(true);
  }, [pregunta._id]);

  const handleAnswerSelect = (identifier) => {
    if (showAnswer) return; // Prevent changing answer after submission
    setSelectedAnswer(identifier);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer && !allowSkip) return;
    
    setTimerActive(false);
    setShowAnswer(true);
    
    const isCorrect = pregunta.alternativasCorrectas.includes(selectedAnswer);
    
    // Dispatch to Redux store
    dispatch(saveAnswer({
      preguntaId: pregunta._id,
      respuesta: selectedAnswer,
      esCorrecta: isCorrect,
      tiempoUtilizado: timeSpent,
      usoPista: showPista,
      usoChatbot: showChatbot
    }));
    
    // Call parent callback
    onAnswerSubmit(isCorrect, timeSpent, selectedAnswer);
  };

  const handleShowNextHint = () => {
    if (pistaActual < pregunta.pistas.length - 1) {
      setPistaActual(pistaActual + 1);
    }
    if (!showPista) {
      setShowPista(true);
    }
  };

  const handleBookmark = () => {
    dispatch(bookmarkQuestion(pregunta._id));
  };

  const handleReport = () => {
    dispatch(reportQuestion(pregunta._id));
  };

  const handleTimeUpdate = (time) => {
    setTimeSpent(time);
  };

  const isCorrectAnswer = (identifier) => {
    return showAnswer && pregunta.alternativasCorrectas.includes(identifier);
  };

  const isIncorrectAnswer = (identifier) => {
    return showAnswer && selectedAnswer === identifier && !pregunta.alternativasCorrectas.includes(identifier);
  };

  return (
    <div className="question-container">
      <div className="question-header">
        <div className="question-metadata">
          <span className="difficulty">Dificultad: {pregunta.dificultad}/10</span>
          <span className="estimated-time">Tiempo estimado: {pregunta.metadatos.segundosEstimados} segundos</span>
        </div>
        <Timer 
          seconds={tiempoSugerido || pregunta.metadatos.segundosEstimados} 
          active={timerActive}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
      
      <div className="question-content">
        <div className="question-text">
          <Markdown content={pregunta.enunciado.texto} />
          
          {pregunta.enunciado.tieneImagenes && pregunta.enunciado.imagenesURL.map((url, index) => (
            <ImageRenderer key={`img-${index}`} src={url} alt={`Imagen ${index + 1}`} />
          ))}
          
          {pregunta.enunciado.tieneImagenes && pregunta.enunciado.imagenesLatex.map((latex, index) => (
            <LatexRenderer key={`latex-${index}`} formula={latex} />
          ))}
          
          {pregunta.enunciado.tieneTablas && pregunta.enunciado.tablasLatex.map((tabla, index) => (
            <TableRenderer key={`table-${index}`} content={tabla} />
          ))}
        </div>
        
        <div className="question-alternatives">
          {pregunta.alternativas.map((alt) => (
            <div 
              key={alt.identificador}
              className={`alternative ${selectedAnswer === alt.identificador ? 'selected' : ''} 
                        ${isCorrectAnswer(alt.identificador) ? 'correct' : ''} 
                        ${isIncorrectAnswer(alt.identificador) ? 'incorrect' : ''}`}
              onClick={() => handleAnswerSelect(alt.identificador)}
            >
              <span className="identifier">{alt.identificador})</span>
              <div className="alternative-content">
                <Markdown content={alt.texto} />
                
                {alt.tieneImagenes && alt.imagenesURL.map((url, index) => (
                  <ImageRenderer key={`alt-img-${index}`} src={url} alt={`Imagen alternativa ${index + 1}`} />
                ))}
                
                {alt.tieneImagenes && alt.imagenesLatex.map((latex, index) => (
                  <LatexRenderer key={`alt-latex-${index}`} formula={latex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="question-actions">
        <div className="primary-actions">
          <Button 
            onClick={handleAnswerSubmit} 
            disabled={!selectedAnswer && !allowSkip} 
            primary
          >
            {allowSkip && !selectedAnswer ? 'Saltar' : 'Responder'}
          </Button>
          
          <Button 
            onClick={() => setShowChatbot(!showChatbot)} 
            secondary
          >
            {showChatbot ? 'Ocultar asistente' : 'Ayuda IA'}
          </Button>
          
          {pregunta.pistas.length > 0 && (
            <Button 
              onClick={handleShowNextHint} 
              secondary
            >
              {showPista ? 'Siguiente pista' : 'Mostrar pista'}
            </Button>
          )}
        </div>
        
        <div className="secondary-actions">
          <Button onClick={handleBookmark} icon="bookmark">Guardar</Button>
          <Button onClick={handleReport} icon="flag">Reportar</Button>
        </div>
      </div>
      
      {showPista && (
        <div className="hints-container">
          <h4>Pista {pistaActual + 1}/{pregunta.pistas.length}</h4>
          <p>{pregunta.pistas[pistaActual]}</p>
        </div>
      )}
      
      {showAnswer && showFeedback && (
        <div className="feedback-container">
          <h3 className={pregunta.alternativasCorrectas.includes(selectedAnswer) ? 'correct-feedback' : 'incorrect-feedback'}>
            {pregunta.alternativasCorrectas.includes(selectedAnswer) ? '¡Correcto!' : 'Incorrecto'}
          </h3>
          
          {!pregunta.alternativasCorrectas.includes(selectedAnswer) && (
            <div className="correct-answer">
              <p>La respuesta correcta es: {pregunta.alternativasCorrectas.map(id => 
                pregunta.alternativas.find(alt => alt.identificador === id)?.identificador
              ).join(', ')}</p>
            </div>
          )}
        </div>
      )}
      
      {showChatbot && (
        <ChatbotAssistant 
          preguntaId={pregunta._id} 
          preguntaTexto={pregunta.enunciado.texto}
          materiasRelacionadas={pregunta.metadatos.keywords}
        />
      )}
    </div>
  );
};

export default QuestionComponent;