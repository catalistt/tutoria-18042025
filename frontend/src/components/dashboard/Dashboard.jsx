import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, BarChart, PieChart } from '../common/Charts';
import { SubjectCard } from '../common/Cards';
import { Loading, ErrorMessage } from '../common/Feedback';
import { MateriaService, ProgresoService } from '../../services';
import { 
  ProgressCard, 
  StreakCard, 
  LevelCard, 
  RecentSessionsCard 
} from './DashboardCards';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [progreso, setProgreso] = useState({});
  const [statsGlobales, setStatsGlobales] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch materias
        const materiasResponse = await MateriaService.getUserMaterias(user._id);
        setMaterias(materiasResponse.data);
        
        // Fetch progreso general
        const progresoResponse = await ProgresoService.getProgresoGeneral(user._id);
        setProgreso(progresoResponse.data);
        
        // Fetch estadísticas globales
        const statsResponse = await ProgresoService.getEstadisticasGlobales(user._id);
        setStatsGlobales(statsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Hubo un problema al cargar los datos. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  if (loading) return <Loading message="Cargando tu dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Bienvenido, {user.nombre}</h1>
        <p className="last-login">Último ingreso: {new Date(user.engagement.ultimoLogin).toLocaleDateString()}</p>
      </div>
      
      <div className="stats-overview">
        <div className="stats-row">
          <StreakCard 
            diasConsecutivos={user.engagement.diasConsecutivos} 
            maxConsecutivos={user.engagement.maxConsecutivos} 
          />
          <LevelCard 
            nivel={user.engagement.nivel} 
          />
          <ProgressCard 
            materiasPorcentaje={progreso.materiasCompletadas || 0} 
            totalMaterias={materias.length} 
          />
        </div>
      </div>
      
      <div className="charts-section">
        <div className="chart-container">
          <h3>Progreso por Materia</h3>
          <BarChart 
            data={progreso.progresoPorMateria || []} 
            xKey="materia" 
            yKey="porcentaje" 
            color="#4caf50" 
          />
        </div>
        
        <div className="chart-container">
          <h3>Distribución de Tiempo</h3>
          <PieChart 
            data={statsGlobales.distribucionTiempo || []} 
            nameKey="materia" 
            valueKey="minutos" 
          />
        </div>
      </div>
      
      <div className="subjects-section">
        <h2>Tus Materias</h2>
        <div className="subjects-grid">
          {materias.map(materia => (
            <SubjectCard 
              key={materia._id} 
              materia={materia} 
              progreso={progreso.progresoPorMateria?.find(p => p.materiaId === materia._id)?.porcentaje || 0} 
            />
          ))}
        </div>
      </div>
      
      <RecentSessionsCard sesiones={statsGlobales.sesionesRecientes || []} />
    </div>
  );
};

export default Dashboard;