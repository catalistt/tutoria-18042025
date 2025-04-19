import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importar componentes principales
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Importar páginas de autenticación
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Importar páginas principales
import Dashboard from './pages/Dashboard';
import SubjectList from './pages/subjects/SubjectList';
import SubjectDetail from './pages/subjects/SubjectDetail';
import LearningPath from './pages/learning/LearningPath';
import ModuleSession from './pages/learning/ModuleSession';
import PracticeSession from './pages/learning/PracticeSession';
import GamificationProfile from './pages/gamification/GamificationProfile';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import Welcome from './pages/onboarding/Welcome';
import OnboardingForm from './pages/onboarding/OnboardingForm';

// Importar páginas de error
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

// Importar acciones de Redux
import { getUser } from './store/slices/authSlice';
import { clearMessage } from './store/slices/messageSlice';

// Importar proveedores de contexto
import { ChatbotProvider } from './components/common/Chatbot/ChatbotProvider';
import { ThemeProvider } from './contexts/ThemeContext';

// Componente de ruta protegida que verifica autenticación
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isLoggedIn } = useSelector(state => state.auth);
  
  if (requireAuth && !isLoggedIn) {
    // Si se requiere autenticación y el usuario no está logueado, redirigir a login
    return <Navigate to="/login" replace />;
  } else if (!requireAuth && isLoggedIn) {
    // Si no se requiere autenticación y el usuario está logueado, redirigir a dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente de ruta protegida que verifica que se haya completado el onboarding
const OnboardingProtectedRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector(state => state.auth);
  
  if (!isLoggedIn) {
    // Si el usuario no está logueado, redirigir a login
    return <Navigate to="/login" replace />;
  } else if (isLoggedIn && !user?.perfilAcademico?.objetivoGeneral) {
    // Si el usuario está logueado pero no ha completado el onboarding, redirigir a welcome
    return <Navigate to="/welcome" replace />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Si hay un token en localStorage, intentar obtener datos del usuario
    if (isLoggedIn) {
      dispatch(getUser());
    }
    
    // Limpiar mensajes al cambiar de ruta
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch, isLoggedIn]);
  
  return (
    <ThemeProvider>
      <ChatbotProvider>
        <Router>
          <Routes>
            {/* Rutas de autenticación (no requieren estar logueado) */}
            <Route path="/" element={
              <ProtectedRoute requireAuth={false}>
                <AuthLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>
            
            {/* Rutas de onboarding (requieren estar logueado) */}
            <Route path="welcome" element={
              <ProtectedRoute>
                <AuthLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Welcome />} />
              <Route path="onboarding" element={<OnboardingForm />} />
            </Route>
            
            {/* Rutas principales (requieren estar logueado y haber completado onboarding) */}
            <Route path="/" element={
              <OnboardingProtectedRoute>
                <MainLayout />
              </OnboardingProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Rutas de materias */}
              <Route path="subjects">
                <Route index element={<SubjectList />} />
                <Route path=":id" element={<SubjectDetail />} />
              </Route>
              
              {/* Rutas de aprendizaje */}
              <Route path="learning">
                <Route path="path/:materiaId" element={<LearningPath />} />
                <Route path="module/:moduleId" element={<ModuleSession />} />
                <Route path="practice/:materiaId" element={<PracticeSession />} />
              </Route>
              
              {/* Rutas de gamificación */}
              <Route path="gamification" element={<GamificationProfile />} />
              
              {/* Rutas de usuario */}
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Rutas de error */}
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        
        {/* Container para notificaciones */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ChatbotProvider>
    </ThemeProvider>
  );
};

export default App;