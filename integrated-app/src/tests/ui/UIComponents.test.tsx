import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Navigation from '../../components/ui/Navigation';
import AccessibilityControls from '../../components/ui/AccessibilityControls';

// Mock für useTheme Hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  }),
}));

// Mock für useResponsive Hook
jest.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    prefersReducedMotion: false,
    getResponsiveValue: jest.fn(),
    getResponsiveClasses: jest.fn(),
  }),
}));

describe('UI Components Tests', () => {
  // ThemeToggle Tests
  describe('ThemeToggle Component', () => {
    test('renders without crashing', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <ThemeToggle />
        </I18nextProvider>
      );
      
      expect(screen.getByText(/lightMode|darkMode|systemTheme/i)).toBeInTheDocument();
    });
  });
  
  // Navigation Tests
  describe('Navigation Component', () => {
    test('renders navigation links', () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Navigation />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/features/i)).toBeInTheDocument();
      expect(screen.getByText(/pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/contact/i)).toBeInTheDocument();
    });
  });
  
  // AccessibilityControls Tests
  describe('AccessibilityControls Component', () => {
    test('renders accessibility button', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <AccessibilityControls />
        </I18nextProvider>
      );
      
      expect(screen.getByLabelText(/toggleMenu/i)).toBeInTheDocument();
    });
  });
});
