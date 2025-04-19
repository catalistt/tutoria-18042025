import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MenuIcon, 
  BellIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { SearchIcon } from '@heroicons/react/24/solid';

const Header = ({ setSidebarOpen, user, isStudySession }) => {
  const navigate = useNavigate();
  const { notifications } = useSelector(state => state.notifications || { notifications: [] });
  
  // Función para volver atrás en sesiones de estudio
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          {isStudySession ? (
            <button
              onClick={handleGoBack}
              className="px-3 py-2 rounded-md flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Volver
            </button>
          ) : (
            <div className="w-full max-w-lg lg:max-w-xs relative">
              <label htmlFor="search" className="sr-only">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Buscar contenido..."
                  type="search"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notificaciones */}
          <button
            type="button"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {notifications && notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-block w-2 h-2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"></span>
            )}
          </button>
          
          {/* Avatar del usuario (solo para móviles, escritorio está en sidebar) */}
          <div className="ml-3 relative md:hidden">
            <Link
              to="/profile"
              className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <img
                className="h-8 w-8 rounded-full"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'Usuario')}&background=4F46E5&color=fff`}
                alt={user?.nombre || 'Usuario'}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;