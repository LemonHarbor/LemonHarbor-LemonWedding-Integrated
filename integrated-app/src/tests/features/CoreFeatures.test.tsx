import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { createClient } from '@supabase/supabase-js';
import GuestManagementIntegrated from '../../components/dashboard/GuestManagementIntegrated';
import EnhancedTablePlanner from '../../components/dashboard/EnhancedTablePlanner';
import BudgetTrackerEnhanced from '../../components/dashboard/BudgetTrackerEnhanced';
import TaskBoardEnhanced from '../../components/dashboard/TaskBoardEnhanced';

// Mock für Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              { id: 1, name: 'Max Mustermann', email: 'max@example.com', status: 'confirmed', table_id: 1 },
              { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', status: 'pending', table_id: null },
            ],
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 3, name: 'Neu Gast', email: 'neu@example.com', status: 'pending', table_id: null },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 1, name: 'Max Mustermann', email: 'max@example.com', status: 'declined', table_id: null },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          then: jest.fn((callback) => callback({ error: null })),
        })),
      })),
    }),
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })),
    },
  })),
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

describe('Core Features Tests', () => {
  // GuestManagement Tests
  describe('GuestManagement Component', () => {
    test('renders guest list', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <GuestManagementIntegrated />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Max Mustermann/i)).toBeInTheDocument();
        expect(screen.getByText(/Anna Schmidt/i)).toBeInTheDocument();
      });
    });
  });
  
  // TablePlanner Tests
  describe('TablePlanner Component', () => {
    test('renders table planner', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <EnhancedTablePlanner />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Tischplan/i)).toBeInTheDocument();
      });
    });
  });
  
  // BudgetTracker Tests
  describe('BudgetTracker Component', () => {
    test('renders budget tracker', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <BudgetTrackerEnhanced />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Budget/i)).toBeInTheDocument();
      });
    });
  });
  
  // TaskBoard Tests
  describe('TaskBoard Component', () => {
    test('renders task board', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <TaskBoardEnhanced />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Aufgaben/i)).toBeInTheDocument();
      });
    });
  });
});
