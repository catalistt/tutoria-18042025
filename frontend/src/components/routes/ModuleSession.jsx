import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchModuleQuestions, 
  saveAnswer, 
  completeModule 
} from '../../store/slices/moduleSlice';
import { endSession, updateSessionStats } from '../../store/slices/sessionSlice';
import { QuestionComponent } from '../learning/QuestionComponent';
import { SessionSummary } from './SessionSummary';
import { ProgressBar, Button, Loading, ErrorMessage } from '../common/UI';

const ModuleSession = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentModule, questions, loading, error } = useSelector(state => state.module);
  const { currentSession } = useSelector(state => state.session);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  useEffect(() => {
    if (moduleId && user) {
      dispatch(fetchModuleQuestions(moduleId));
    }
  }, [dispatch, moduleId, user]);
  
  useEffect(() => {
    if (currentModule && !timeRemaining) {
      setTimeRemaining(currentModule.minutosEstimados * 60); // Convert to seconds
    }
  }, [currentModule, timeRemaining]);
  
  const handleAnswerSubmit = (isCorrect, timeSpent, selectedAnswer) => {
    // Save answer locally
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: questions[currentQuestionIndex]._id,
      isCorrect,
      timeSpent,
      selectedAnswer
    };
    setAnswers(newAnswers);
    
    // Update session stats in Redux
    dispatch(updateSessionStats({
      isCorrect,
      timeSpent
    }));
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeSession();
      }
    }, 2000);
  };
  
  const completeSession = () => {
    // Calculate session stats
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const accuracy = questions.length > 0 ? correctAnswers / questions.length : 0;
    
    // Complete session in Redux
    dispatch(endSession({
      completed: true,
      stats: {
        questionsTotal: questions.length,
        questionsCorrect: correctAnswers,
        averageResponseTime: totalTime / questions.length,
        accuracy
      }
    }));
    
    // Complete module if accuracy is good enough
    if (accuracy >= 0.7) { // 70% correct answers required to pass
      dispatch(completeModule(moduleId));
    }
    
    setSessionCompleted(true);
  };
  
  const handleSessionEnd = () => {
    navigate('/dashboard');
  };
  
  if (loading) return <Loading message="Cargando módulo de aprendizaje..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentModule || !questions.length) return <ErrorMessage message="No se encontraron preguntas para este módulo" />;
  
  // Show session summary if completed
  if (sessionCompleted) {
    return (
      <SessionSummary 
        answers={answers}
        questions={questions}
        totalTime={answers.reduce((sum, a) => sum + a.timeSpent, 0)}
        moduleTitle={currentModule.titulo}
        onFinish={handleSessionEnd}
      />
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <div className="module-session-container">
      <div className="session-header">
        <h1>{currentModule.titulo}</h1>
        <div className="session-progress">
          <span className="progress-text">Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
          <ProgressBar percentage={progress} />
        </div>
      </div>
      
      {questions.length > currentQuestionIndex && (
        <QuestionComponent 
          pregunta={questions[currentQuestionIndex]}
          onAnswerSubmit={handleAnswerSubmit}
          tiempoSugerido={60} // Default 60 seconds per question
        />
      )}
      
      <div className="session-controls">
        <Button onClick={handleSessionEnd} secondary>
          Finalizar Sesión
        </Button>
      </div>
    </div>
  );
};

export default ModuleSession;