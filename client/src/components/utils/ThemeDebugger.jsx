import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function ThemeDebugger() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showDetails, setShowDetails] = useState(false);
  
  // Get CSS variables
  const getComputedVariables = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      background: styles.getPropertyValue('--background-primary'),
      text: styles.getPropertyValue('--text-primary'),
      accent: styles.getPropertyValue('--accent-color'),
    };
  };
  
  const vars = getComputedVariables();
  
  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        padding: '10px', 
        backgroundColor: 'var(--card-background)',
        border: '1px solid var(--divider-color)',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Theme: <strong>{theme}</strong></span>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          style={{ marginLeft: '8px', border: 'none', background: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>
      
      {showDetails && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ margin: '4px 0' }}>HTML data-theme: {document.documentElement.getAttribute('data-theme')}</p>
          <p style={{ margin: '4px 0' }}>localStorage theme: {localStorage.getItem('theme')}</p>
          <p style={{ margin: '4px 0' }}>Context theme: {theme}</p>
          <p style={{ margin: '4px 0' }}>CSS Variables:</p>
          <ul style={{ margin: '0', paddingLeft: '15px' }}>
            <li>background: {vars.background}</li>
            <li>text: {vars.text}</li>
            <li>accent: {vars.accent}</li>
          </ul>
          <div style={{ marginTop: '8px' }}>
            <button 
              onClick={() => {
                toggleTheme();
                console.log("Theme toggled via debugger");
              }}
              style={{ 
                backgroundColor: 'var(--accent-color)', 
                color: 'white', 
                border: 'none', 
                padding: '4px 8px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Toggle Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeDebugger;