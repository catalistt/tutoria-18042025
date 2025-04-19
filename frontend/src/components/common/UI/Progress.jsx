import React from 'react';
import PropTypes from 'prop-types';

const Progress = ({ 
  value, 
  max = 100, 
  label = false, 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  // Normalizar el valor para que no exceda el máximo
  const normalizedValue = Math.min(Math.max(0, value), max);
  
  // Calcular el porcentaje de progreso
  const percentage = (normalizedValue / max) * 100;
  
  // Colores
  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    accent: 'bg-accent-500',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-blue-500'
  };
  
  // Tamaños
  const heightClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-5'
  };
  
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-neutral-700">
            {label}
          </span>
          <span className="text-sm font-medium text-neutral-700">
            {normalizedValue}/{max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      
      <div className={`w-full bg-neutral-200 rounded-full ${heightClasses[size] || heightClasses.md}`}>
        <div
          className={`${colorClasses[color] || colorClasses.primary} rounded-full ${heightClasses[size] || heightClasses.md}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info']),
  className: PropTypes.string
};

export default Progress;