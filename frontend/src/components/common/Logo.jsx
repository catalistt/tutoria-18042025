import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ className = '' }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 50 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="25" cy="25" r="20" fill="#1E95FF" />
      <path 
        d="M18 20C18 18.8954 18.8954 18 20 18H30C31.1046 18 32 18.8954 32 20V30C32 31.1046 31.1046 32 30 32H20C18.8954 32 18 31.1046 18 30V20Z" 
        fill="white" 
      />
      <path 
        d="M23 25C23 23.8954 23.8954 23 25 23H35C36.1046 23 37 23.8954 37 25V35C37 36.1046 36.1046 37 35 37H25C23.8954 37 23 36.1046 23 35V25Z" 
        fill="#E0F9E7" 
      />
      <path 
        d="M13 15C13 13.8954 13.8954 13 15 13H25C26.1046 13 27 13.8954 27 15V25C27 26.1046 26.1046 27 25 27H15C13.8954 27 13 26.1046 13 25V15Z" 
        fill="#083A81" 
      />
      <path 
        d="M25 15L20 25H25L30 15H25Z" 
        fill="white" 
      />
      <circle cx="39" cy="19" r="2" fill="#FF4811" />
    </svg>
  );
};

Logo.propTypes = {
  className: PropTypes.string
};

export default Logo;