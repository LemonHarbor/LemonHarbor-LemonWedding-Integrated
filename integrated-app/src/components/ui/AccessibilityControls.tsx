import React from 'react';
import { useResponsive, ResponsiveContainer } from '../../hooks/useResponsive';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';

// Komponente für Barrierefreiheit nach WCAG 2.1
const AccessibilityControls: React.FC = () => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { isMobile, prefersReducedMotion } = useResponsive();
  
  // State für Barrierefreiheits-Einstellungen
  const [fontSize, setFontSize] = React.useState(100); // Prozent
  const [highContrast, setHighContrast] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(prefersReducedMotion);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = React.useState(false);
  
  // Anwenden der Barrierefreiheits-Einstellungen
  React.useEffect(() => {
    // Schriftgröße anpassen
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // Hoher Kontrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Animationen reduzieren
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Einstellungen speichern
    localStorage.setItem('accessibility', JSON.stringify({
      fontSize,
      highContrast,
      reduceMotion
    }));
  }, [fontSize, highContrast, reduceMotion]);
  
  // Einstellungen beim Laden wiederherstellen
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility');
    if (savedSettings) {
      try {
        const { fontSize: savedFontSize, highContrast: savedHighContrast, reduceMotion: savedReduceMotion } = JSON.parse(savedSettings);
        setFontSize(savedFontSize);
        setHighContrast(savedHighContrast);
        setReduceMotion(savedReduceMotion);
      } catch (error) {
        console.error('Fehler beim Laden der Barrierefreiheits-Einstellungen:', error);
      }
    }
  }, []);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label={t('accessibility.toggleMenu')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </button>
      
      {showAccessibilityMenu && (
        <div className={`absolute ${isMobile ? 'right-0' : 'left-0'} mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10`}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            {t('accessibility.settings')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('accessibility.fontSize')}
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  aria-label={t('accessibility.decreaseFontSize')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <div className="flex-1 mx-2 text-center text-sm text-gray-700 dark:text-gray-300">
                  {fontSize}%
                </div>
                <button
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  aria-label={t('accessibility.increaseFontSize')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="high-contrast"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="high-contrast" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('accessibility.highContrast')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reduce-motion"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reduce-motion" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('accessibility.reduceMotion')}
              </label>
            </div>
            
            <button
              onClick={() => {
                setFontSize(100);
                setHighContrast(false);
                setReduceMotion(prefersReducedMotion);
              }}
              className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
            >
              {t('accessibility.resetSettings')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls;
