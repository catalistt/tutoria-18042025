import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchLearningPath, 
  startModule, 
  completeModule 
} from '../../store/slices/learningPathSlice';
import { startSession, endSession } from '../../store/slices/sessionSlice';
import { ModuleCard, PathProgress, PathObjectives } from './PathComponents';
import { Button, Loading, ErrorMessage } from '../common/UI';
import { RutaPersonalizadaService } from '../../services';

const LearningPath = () => {
  const { materiaId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentPath, loading, error } = useSelector(state => state.learningPath);
  const [activeModuleId, setActiveModuleId] = useState(null);

  useEffect(() => {
    if (materiaId && user) {
      dispatch(fetchLearningPath({ userId: user._id, materiaId }));
    }
  }, [dispatch, materiaId, user]);

  const handleStartModule = (moduleId) => {
    // Start session
    dispatch(startSession({
      userId: user._id,
      materiaId,
      tipo: 'ruta TutorIA'
    }));
    
    // Start module
    dispatch(startModule(moduleId));
    setActiveModuleId(moduleId);
    
    // Navigate to module content
    navigate(`/learning/module/${moduleId}`);
  };

  const handleUpdatePath = async () => {
    try {
      await RutaPersonalizadaService.solicitarActualizacionRuta(user._id, materiaId);
      // Refresh the learning path
      dispatch(fetchLearningPath({ userId: user._id, materiaId }));
    } catch (error) {
      console.error('Error al actualizar la ruta de aprendizaje:', error);
    }
  };

  if (loading) return <Loading message="Cargando tu ruta de aprendizaje..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentPath) return <ErrorMessage message="No se encontró una ruta de aprendizaje para esta materia" />;

  const completedModules = currentPath.modulos.filter(m => m.logrado).length;
  const totalModules = currentPath.modulos.length;
  const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="learning-path-container">
      <div className="learning-path-header">
        <h1>Tu Ruta de Aprendizaje Personalizada</h1>
        <div className="path-metadata">
          <span className="path-creation">Creada: {new Date(currentPath.fechaCreacion).toLocaleDateString()}</span>
          <span className="path-updated">Actualizada: {new Date(currentPath.fechaActualizacion).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="learning-path-overview">
        <div className="path-stats">
          <PathProgress 
            progress={progress} 
            completedModules={completedModules} 
            totalModules={totalModules} 
          />
          
          <PathObjectives 
            objective={currentPath.objetivoPrincipal}
            initialLevel={currentPath.nivelInicialAciertos}
            targetLevel={currentPath.nivelObjetivoAciertos}
            currentProgress={(currentPath.nivelInicialAciertos + progress * (currentPath.nivelObjetivoAciertos - currentPath.nivelInicialAciertos) / 100).toFixed(2)}
          />
        </div>
        
        <div className="path-recommendations">
          <h3>Recomendaciones para ti</h3>
          <ul className="recommendations-list">
            <li><span className="recommendation-label">Enfoque en:</span> {currentPath.recomendacionesActuales.ejesEnfoque.join(', ')}</li>
            <li><span className="recommendation-label">Conceptos a reforzar:</span> {currentPath.recomendacionesActuales.conceptosReforzar.join(', ')}</li>
            <li><span className="recommendation-label">Ritmo sugerido:</span> {currentPath.recomendacionesActuales.ritmoSugerido}</li>
            <li><span className="recommendation-label">Descanso recomendado:</span> {currentPath.recomendacionesActuales.descansoRecomendado}</li>
          </ul>
        </div>
      </div>
      
      <div className="path-actions">
        <Button onClick={handleUpdatePath} primary>
          Actualizar Ruta de Aprendizaje
        </Button>
      </div>
      
      <div className="modules-container">
        <h2>Módulos de Aprendizaje</h2>
        <div className="modules-timeline">
          {currentPath.modulos
            .sort((a, b) => a.orden - b.orden)
            .map((modulo, index) => (
              <ModuleCard
                key={modulo.orden}
                module={modulo}
                index={index}
                onStart={() => handleStartModule(modulo.orden)}
                isActive={activeModuleId === modulo.orden}
                isLocked={index > 0 && !currentPath.modulos[index - 1].logrado}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;