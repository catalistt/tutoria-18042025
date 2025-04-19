import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Página temporal para mostrar que la aplicación está funcionando
const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">TutorIA</h1>
      <p className="text-lg text-center mb-6">Plataforma educativa potenciada por IA</p>
      <p className="text-sm text-gray-600 text-center">¡Aplicación en construcción!</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;