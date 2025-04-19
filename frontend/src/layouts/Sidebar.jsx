import React, { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserIcon,
  CogIcon,
  LogoutIcon
} from '@heroicons/react/24/solid';

import Logo from '../common/Logo';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Definir enlaces de navegación
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Materias', href: '/subjects', icon: BookOpenIcon },
    { name: 'Progreso', href: '/gamification', icon: TrophyIcon },
    { name: 'Perfil', href: '/profile', icon: UserIcon },
    { name: 'Configuración', href: '/settings', icon: CogIcon },
  ];
  
  // Verificar si un enlace está activo
  const isActive = (href) => {
    return location.pathname === href || 
           (href !== '/dashboard' && location.pathname.startsWith(href));
  };
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <>
      {/* Sidebar móvil */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 md:hidden"
          onClose={setSidebarOpen}
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-neutral-600 bg-opacity-75" />
          </Transition.Child>
          
          {/* Contenido del sidebar */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-900">
              {/* Botón cerrar */}
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Cerrar sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center px-4 py-5">
                <Logo className="h-8 w-auto" />
                <span className="ml-2 text-white text-xl font-semibold">TutorIA</span>
              </div>
              
              {/* Navegación */}
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${isActive(item.href)
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`
                          mr-4 flex-shrink-0 h-6 w-6
                          ${isActive(item.href)
                            ? 'text-white'
                            : 'text-primary-300 group-hover:text-white'
                          }
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Botón de cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-primary-100 hover:bg-primary-700 hover:text-white"
                  >
                    <LogoutIcon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-primary-300 group-hover:text-white"
                      aria-hidden="true"
                    />
                    Cerrar sesión
                  </button>
                </nav>
              </div>
              
              {/* Perfil del usuario */}
              <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
                <div className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="inline-block h-10 w-10 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'Usuario')}&background=4F46E5&color=fff`}
                        alt={user?.nombre || 'Usuario'}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-white">{user?.nombre || 'Usuario'}</p>
                      <p className="text-sm font-medium text-primary-200">
                        {user?.grado || 'Estudiante'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
      
      {/* Sidebar escritorio (estático) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-primary-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Logo className="h-8 w-auto" />
                <span className="ml-2 text-white text-xl font-semibold">TutorIA</span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isActive(item.href)
                        ? 'bg-primary-700 text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-6 w-6
                        ${isActive(item.href)
                          ? 'text-white'
                          : 'text-primary-300 group-hover:text-white'
                        }
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
                
                {/* Botón de cerrar sesión */}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary-100 hover:bg-primary-700 hover:text-white"
                >
                  <LogoutIcon
                    className="mr-3 flex-shrink-0 h-6 w-6 text-primary-300 group-hover:text-white"
                    aria-hidden="true"
                  />
                  Cerrar sesión
                </button>
              </nav>
            </div>
            
            {/* Perfil del usuario */}
            <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
              <Link to="/profile" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'Usuario')}&background=4F46E5&color=fff`}
                      alt={user?.nombre || 'Usuario'}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.nombre || 'Usuario'}</p>
                    <p className="text-xs font-medium text-primary-200">
                      {user?.grado || 'Estudiante'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;