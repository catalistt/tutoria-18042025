import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '../components/common/Logo';

const AuthLayout = () => {
  const { isLoggedIn } = useSelector(state => state.auth);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo className="w-auto h-12" />
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          TutorIA
        </h2>
        <p className="mt-2 text-center text-sm text-primary-200">
          Aprendizaje personalizado impulsado por IA, alineado con el currículo chileno
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        {!isLoggedIn && (
          <div className="mt-6 text-center text-sm">
            <p className="text-primary-200">
              Al usar TutorIA, aceptas nuestros{' '}
              <Link to="/terms" className="font-medium text-white hover:text-primary-100">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link to="/privacy" className="font-medium text-white hover:text-primary-100">
                Política de Privacidad
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;