import { useState, useEffect } from 'react';

// Typen für die Theme-Einstellungen
type Theme = 'light' | 'dark' | 'system';

// Hook für die Theme-Verwaltung
export function useTheme() {
  // Initialer Theme-Wert aus localStorage oder 'system' als Fallback
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) {
        return storedTheme;
      }
    }
    return 'system';
  });

  // Aktueller Theme-Modus (light oder dark)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Theme-Änderungen überwachen und anwenden
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Aktuelle Theme-Einstellung speichern
    if (theme !== 'system') {
      localStorage.setItem('theme', theme);
    }
    
    // Theme anwenden
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
    
    // System-Theme-Änderungen überwachen
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
          setResolvedTheme('dark');
        } else {
          root.classList.remove('dark');
          setResolvedTheme('light');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Theme wechseln
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  // Spezifisches Theme setzen
  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setSpecificTheme,
  };
}
