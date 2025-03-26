import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { createClient } from '@supabase/supabase-js';

// Mock für Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [
            { id: 1, name: 'Test Error', message: 'This is a test error', status: 'resolved' },
            { id: 2, name: 'Another Error', message: 'This is another test error', status: 'pending' },
          ],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        data: { id: 3, name: 'New Error', message: 'This is a new error', status: 'pending' },
        error: null,
      })),
    })),
    auth: {
      onAuthStateChange: jest.fn((callback) => {
        callback('SIGNED_IN', { user: { id: 'user-123', email: 'test@example.com' } });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
  })),
}));

// Fehlerbehandlungssystem
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Fehler in Datenbank loggen
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL || '',
      process.env.REACT_APP_SUPABASE_ANON_KEY || ''
    );
    
    supabase.from('error_logs').insert({
      name: error.name,
      message: error.message,
      stack: error.stack,
      component: errorInfo.componentStack,
      status: 'pending',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Etwas ist schiefgelaufen</h2>
          <p className="mb-4">Ein Fehler ist aufgetreten. Unsere Techniker wurden benachrichtigt.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Globaler Fehlerhandler
const setupGlobalErrorHandler = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL || '',
      process.env.REACT_APP_SUPABASE_ANON_KEY || ''
    );
    
    supabase.from('error_logs').insert({
      name: error?.name || 'UnknownError',
      message: message.toString(),
      source,
      line: lineno,
      column: colno,
      stack: error?.stack,
      status: 'pending',
    });
    
    return false;
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL || '',
      process.env.REACT_APP_SUPABASE_ANON_KEY || ''
    );
    
    supabase.from('error_logs').insert({
      name: 'UnhandledPromiseRejection',
      message: event.reason?.message || 'Unknown promise rejection',
      stack: event.reason?.stack,
      status: 'pending',
    });
  });
};

// Komponente zum Anzeigen und Verwalten von Fehlern (für Administratoren)
const ErrorManagement = () => {
  const [errors, setErrors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchErrors = async () => {
      const supabase = createClient(
        process.env.REACT_APP_SUPABASE_URL || '',
        process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      );
      
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setErrors(data);
      }
      
      setLoading(false);
    };
    
    fetchErrors();
  }, []);
  
  const markAsResolved = async (id) => {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL || '',
      process.env.REACT_APP_SUPABASE_ANON_KEY || ''
    );
    
    await supabase
      .from('error_logs')
      .update({ status: 'resolved' })
      .eq('id', id);
    
    setErrors(errors.map(error => 
      error.id === id ? { ...error, status: 'resolved' } : error
    ));
  };
  
  if (loading) {
    return <div>Lade Fehlerprotokolle...</div>;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Fehlerprotokolle</h2>
      
      {errors.length === 0 ? (
        <p>Keine Fehler gefunden.</p>
      ) : (
        <div className="space-y-4">
          {errors.map(error => (
            <div 
              key={error.id} 
              className={`p-4 rounded-lg ${
                error.status === 'resolved' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{error.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  error.status === 'resolved' 
                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                    : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                }`}>
                  {error.status}
                </span>
              </div>
              <p className="mt-1">{error.message}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Stack Trace</summary>
                  <pre className="mt-2 text-xs overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.status !== 'resolved' && (
                <button
                  onClick={() => markAsResolved(error.id)}
                  className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Als gelöst markieren
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Tests für das Fehlerbehandlungssystem
describe('Error Handling System Tests', () => {
  test('ErrorBoundary renders fallback UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    expect(screen.getByText(/Ein Fehler ist aufgetreten/i)).toBeInTheDocument();
  });
  
  test('ErrorManagement component renders error logs', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorManagement />
      </I18nextProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Fehlerprotokolle/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Another Error/i)).toBeInTheDocument();
    });
  });
});

export { ErrorBoundary, setupGlobalErrorHandler, ErrorManagement };
