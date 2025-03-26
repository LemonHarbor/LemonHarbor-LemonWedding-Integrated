import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { ErrorBoundary } from '../../utils/ErrorHandling';

// Test-Komponente, die einen Fehler auslöst
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Komponente funktioniert korrekt</div>;
};

// Test-Suite für End-to-End Tests
describe('End-to-End Tests', () => {
  // Test für Fehlerbehandlung
  test('ErrorBoundary fängt Fehler ab und zeigt Fallback-UI', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    expect(screen.getByText(/Ein Fehler ist aufgetreten/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Erneut versuchen/i })).toBeInTheDocument();
  });
  
  // Test für erfolgreiche Komponenten-Darstellung
  test('Komponente wird korrekt dargestellt, wenn kein Fehler auftritt', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Komponente funktioniert korrekt/i)).toBeInTheDocument();
  });
  
  // Test für Wiederherstellung nach Fehler
  test('ErrorBoundary kann sich nach einem Fehler erholen', async () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <div>
          <button onClick={() => setShouldThrow(false)}>Fehler beheben</button>
          {shouldThrow ? <ErrorComponent shouldThrow={true} /> : <ErrorComponent shouldThrow={false} />}
        </div>
      );
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    
    // "Erneut versuchen" Button klicken
    fireEvent.click(screen.getByRole('button', { name: /Erneut versuchen/i }));
    
    // "Fehler beheben" Button sollte jetzt sichtbar sein
    fireEvent.click(screen.getByRole('button', { name: /Fehler beheben/i }));
    
    // Komponente sollte jetzt korrekt dargestellt werden
    expect(screen.getByText(/Komponente funktioniert korrekt/i)).toBeInTheDocument();
  });
  
  // Test für Formularvalidierung
  test('Formularvalidierung funktioniert korrekt', () => {
    const handleSubmit = jest.fn(e => e.preventDefault());
    
    render(
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-Mail</label>
        <input 
          id="email" 
          type="email" 
          required 
          data-testid="email-input"
        />
        <button type="submit">Absenden</button>
      </form>
    );
    
    // Leeres Formular absenden sollte nicht funktionieren
    fireEvent.click(screen.getByRole('button', { name: /Absenden/i }));
    expect(handleSubmit).not.toHaveBeenCalled();
    
    // Ungültige E-Mail eingeben
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Absenden/i }));
    expect(handleSubmit).not.toHaveBeenCalled();
    
    // Gültige E-Mail eingeben
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Absenden/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
  
  // Test für Sprachänderung
  test('Sprachänderung funktioniert korrekt', async () => {
    const TestComponent = () => {
      const { t, i18n } = require('react-i18next').useTranslation();
      
      return (
        <div>
          <div data-testid="translated-text">{t('common.save')}</div>
          <button onClick={() => i18n.changeLanguage('en')}>English</button>
          <button onClick={() => i18n.changeLanguage('de')}>Deutsch</button>
        </div>
      );
    };
    
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );
    
    // Text sollte in der Standardsprache angezeigt werden
    const translatedText = screen.getByTestId('translated-text');
    const initialText = translatedText.textContent;
    
    // Sprache auf Englisch ändern
    fireEvent.click(screen.getByRole('button', { name: /English/i }));
    
    // Warten auf Sprachänderung
    await waitFor(() => {
      expect(translatedText.textContent).toBe('Save');
    });
    
    // Sprache auf Deutsch ändern
    fireEvent.click(screen.getByRole('button', { name: /Deutsch/i }));
    
    // Warten auf Sprachänderung
    await waitFor(() => {
      expect(translatedText.textContent).toBe('Speichern');
    });
  });
});
