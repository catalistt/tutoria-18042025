import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  BadgeDisplay, 
  AchievementsList, 
  LevelProgress, 
  ChallengesList,
  RewardsShop
} from './GamificationComponents';
import { GamificationService } from '../../services';
import { Loading, ErrorMessage } from '../common/Feedback';
import { Tabs, TabPanel } from '../common/Navigation';

const GamificationProfile = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        setLoading(true);
        const response = await GamificationService.getUserGamification(user._id);
        setGamificationData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gamification data:', err);
        setError('Hubo un problema al cargar tus datos de gamificación. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [user._id]);

  if (loading) return <Loading message="Cargando tu perfil de gamificación..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!gamificationData) return <ErrorMessage message="No se encontraron datos de gamificación" />;

  return (
    <div className="gamification-container">
      <div className="gamification-header">
        <h1>Tu Progreso</h1>
        <p>Sigue avanzando para desbloquear nuevos logros y recompensas</p>
      </div>

      <div className="gamification-overview">
        <div className="gamification-stats">
          <div className="stat-card level">
            <h3>Nivel</h3>
            <div className="stat-value">{gamificationData.nivel}</div>
            <LevelProgress 
              puntosTotales={gamificationData.puntosTotales} 
              puntosParaSiguienteNivel={gamificationData.puntosParaSiguienteNivel} 
            />
          </div>
          
          <div className="stat-card streak">
            <h3>Racha Actual</h3>
            <div className="stat-value">{gamificationData.diasDeRachaActual} días</div>
            <div className="stat-secondary">Mejor racha: {gamificationData.diasDeRachaMax} días</div>
          </div>
          
          <div className="stat-card points">
            <h3>Puntos Totales</h3>
            <div className="stat-value">{gamificationData.puntosTotales}</div>
            <div className="stat-secondary">Para gastar en recompensas</div>
          </div>
        </div>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
        <TabPanel id="overview" label="General">
          <div className="gamification-detailed-stats">
            <div className="stats-row">
              <div className="stat-box">
                <h4>Sesiones Totales</h4>
                <div className="stat-number">{gamificationData.estadisticasEstudio.sesionesTotales}</div>
              </div>
              
              <div className="stat-box">
                <h4>Preguntas Respondidas</h4>
                <div className="stat-number">{gamificationData.estadisticasEstudio.preguntasRespondidasTotal}</div>
              </div>
              
              <div className="stat-box">
                <h4>Tasa de Acierto</h4>
                <div className="stat-number">{(gamificationData.estadisticasEstudio.tasaAciertoGlobal * 100).toFixed(1)}%</div>
              </div>
              
              <div className="stat-box">
                <h4>Tiempo Total</h4>
                <div className="stat-number">{Math.floor(gamificationData.estadisticasEstudio.tiempoTotalPlataforma / 60)} hrs</div>
              </div>
            </div>
          </div>
          
          <ChallengesList challenges={gamificationData.desafios} />
        </TabPanel>
        
        <TabPanel id="badges" label="Insignias">
          <BadgeDisplay badges={gamificationData.insignias} />
        </TabPanel>
        
        <TabPanel id="rewards" label="Recompensas">
          <RewardsShop 
            rewards={gamificationData.recompensasDisponibles} 
            currentPoints={gamificationData.puntosTotales} 
          />
        </TabPanel>
        
        <TabPanel id="achievements" label="Logros">
          <AchievementsList userId={user._id} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default GamificationProfile;
