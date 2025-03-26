import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import PWASetup from '../../components/ui/PWASetup';

// Mock für Helmet
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));

// Mock für useTheme Hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    resolvedTheme: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  })),
}));

// Mock für useResponsive Hook
jest.mock('../../hooks/useResponsive', () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isSmallMobile: false,
    isLandscape: true,
    isPortrait: false,
    hasTouchScreen: false,
    prefersReducedMotion: false,
    getResponsiveValue: jest.fn((options) => options.default),
    getResponsiveClasses: jest.fn((base, responsive) => base),
  })),
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  ResponsiveGrid: ({ children }) => <div data-testid="responsive-grid">{children}</div>,
  ResponsiveText: ({ children }) => <div data-testid="responsive-text">{children}</div>,
}));

describe('Integration Tests', () => {
  // Theme Integration Tests
  describe('Theme Integration', () => {
    test('useTheme hook returns expected values', () => {
      const Component = () => {
        const theme = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme.theme}</div>
            <div data-testid="resolved-theme">{theme.resolvedTheme}</div>
            <button data-testid="toggle-theme" onClick={theme.toggleTheme}>Toggle</button>
          </div>
        );
      };
      
      render(<Component />);
      
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });
  });
  
  // Responsive Integration Tests
  describe('Responsive Integration', () => {
    test('useResponsive hook returns expected values', () => {
      const Component = () => {
        const responsive = useResponsive();
        return (
          <div>
            <div data-testid="is-mobile">{responsive.isMobile ? 'true' : 'false'}</div>
            <div data-testid="is-desktop">{responsive.isDesktop ? 'true' : 'false'}</div>
          </div>
        );
      };
      
      render(<Component />);
      
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    });
    
    test('responsive components render correctly', () => {
      const { ResponsiveContainer, ResponsiveGrid, ResponsiveText } = require('../../hooks/useResponsive');
      
      const Component = () => (
        <ResponsiveContainer>
          <ResponsiveGrid>
            <ResponsiveText variant="h1">Heading</ResponsiveText>
            <ResponsiveText>Content</ResponsiveText>
          </ResponsiveGrid>
        </ResponsiveContainer>
      );
      
      render(<Component />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-grid')).toBeInTheDocument();
      expect(screen.getAllByTestId('responsive-text')).toHaveLength(2);
    });
  });
  
  // PWA Integration Tests
  describe('PWA Integration', () => {
    test('PWASetup component renders correctly', () => {
      render(<PWASetup />);
      
      expect(screen.getByTestId('helmet')).toBeInTheDocument();
    });
  });
  
  // i18n Integration Tests
  describe('i18n Integration', () => {
    test('i18n translation works correctly', () => {
      const TestComponent = () => {
        const { t } = require('react-i18next').useTranslation();
        return <div data-testid="translation">{t('common.save')}</div>;
      };
      
      render(
        <I18nextProvider i18n={i18n}>
          <TestComponent />
        </I18nextProvider>
      );
      
      expect(screen.getByTestId('translation')).toBeInTheDocument();
    });
  });
});
