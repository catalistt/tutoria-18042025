import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Determinar si estamos en una ruta de sesión de estudio
  const isStudySession = location.pathname.includes('/learning/module/') || 
                          location.pathname.includes('/learning/practice/');
  
  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      {/* Sidebar para móviles */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />
      
      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          user={user}
          isStudySession={isStudySession}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
        
        {!isStudySession && <Footer />}
      </div>
    </div>
  );
};

export default MainLayout;