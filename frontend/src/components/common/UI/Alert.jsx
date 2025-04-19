import React from 'react';
import PropTypes from 'prop-types';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Alert = ({ 
  children, 
  type = 'info', 
  title, 
  icon = true, 
  dismissible = false, 
  onDismiss, 
  className = '' 
}) => {
  // Configuraciones según el tipo
  const alertConfig = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
    }
  };
  
  const config = alertConfig[type] || alertConfig.info;
  
  return (
    <div className={`${config.bgColor} ${config.borderColor} border-l-4 p-4 rounded-r-md ${className}`}>
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            {config.icon}
          </div>
        )}
        <div className={`${icon ? 'ml-3' : ''} flex-grow`}>
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="flex-shrink-0 ml-4">
            <button
              type="button"
              className={`inline-flex ${config.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-500`}
              onClick={onDismiss}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  icon: PropTypes.bool,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string
};

export default Alert;