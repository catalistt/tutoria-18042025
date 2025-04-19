import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  footer, 
  onClick, 
  hoverable = false 
}) => {
  const cardClasses = [
    'card',
    hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {subtitle && <p className="text-neutral-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div>
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  footer: PropTypes.node,
  onClick: PropTypes.func,
  hoverable: PropTypes.bool
};

export default Card;