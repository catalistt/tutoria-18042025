import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Tabs = ({ children, activeTab, onTabChange, className = '', variant = 'default' }) => {
  // Si no se proporciona un activeTab, usar el primer hijo
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || (children[0]?.props?.id || '')
  );
  
  // Determinar qué tab está activo
  const activeTabId = activeTab || internalActiveTab;
  
  // Manejar cambio de tab
  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };
  
  // Variantes
  const variantClasses = {
    default: 'border-b border-neutral-200',
    pills: 'space-x-2',
    boxed: 'border-b border-neutral-200'
  };
  
  // Estilos para tabs individuales según variante
  const tabStyles = {
    default: {
      normal: 'inline-block py-4 px-4 text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent',
      active: 'inline-block py-4 px-4 text-primary-600 border-b-2 border-primary-600 font-medium'
    },
    pills: {
        normal: 'inline-block py-2 px-4 text-neutral-500 hover:text-neutral-700 rounded-full',
        active: 'inline-block py-2 px-4 bg-primary-100 text-primary-700 rounded-full font-medium'
      },
      boxed: {
        normal: 'inline-block py-3 px-4 text-neutral-500 hover:text-neutral-700 border-b border-transparent',
        active: 'inline-block py-3 px-4 text-primary-600 bg-white border-l border-t border-r rounded-t-lg border-neutral-200 font-medium -mb-px'
      }
    };
    
    // Filtrar solo componentes TabPanel
    const tabPanels = React.Children.toArray(children).filter(
      child => child.type && child.type.displayName === 'TabPanel'
    );
    
    return (
      <div className={className}>
        <div className={variantClasses[variant] || variantClasses.default}>
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabPanels.map((panel) => (
              <button
                key={panel.props.id}
                className={
                  activeTabId === panel.props.id
                    ? tabStyles[variant].active
                    : tabStyles[variant].normal
                }
                onClick={() => handleTabChange(panel.props.id)}
              >
                {panel.props.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="py-4">
          {tabPanels.map((panel) => (
            <div
              key={panel.props.id}
              className={activeTabId === panel.props.id ? 'block' : 'hidden'}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  Tabs.propTypes = {
    children: PropTypes.node.isRequired,
    activeTab: PropTypes.string,
    onTabChange: PropTypes.func,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'pills', 'boxed'])
  };
  
  // TabPanel component
  const TabPanel = ({ children, id, label }) => {
    return <div>{children}</div>;
  };
  
  TabPanel.displayName = 'TabPanel';
  
  TabPanel.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired
  };
  
  export { Tabs, TabPanel };