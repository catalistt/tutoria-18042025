import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  status = null, 
  initials = null 
}) => {
  // Tamaños
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };
  
  // Estados
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-neutral-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };
  
  const avatarClasses = [
    'relative rounded-full flex items-center justify-center overflow-hidden',
    sizeClasses[size] || sizeClasses.md,
    className
  ].filter(Boolean).join(' ');
  
  const statusSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };
  
  const renderContent = () => {
    if (src) {
      return <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />;
    }
    
    if (initials) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-primary-200 text-primary-800 font-medium">
          {initials.substring(0, 2).toUpperCase()}
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600">
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };
  
  return (
    <div className={avatarClasses}>
      {renderContent()}
      
      {status && (
        <span className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${statusClasses[status]} ${statusSize[size]}`} />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away', null]),
  initials: PropTypes.string
};

export default Avatar;