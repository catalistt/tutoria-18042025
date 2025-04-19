import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link to="/terms" className="text-neutral-500 hover:text-neutral-700">
            Términos de Servicio
          </Link>
          <Link to="/privacy" className="text-neutral-500 hover:text-neutral-700">
            Política de Privacidad
          </Link>
          <Link to="/contact" className="text-neutral-500 hover:text-neutral-700">
            Contacto
          </Link>
        </div>
        <div className="mt-8 md:mt-0 md:order-1 flex items-center">
          <Logo className="h-6 w-auto" />
          <span className="ml-2 text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} TutorIA. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;