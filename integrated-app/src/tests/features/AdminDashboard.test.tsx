import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import AdminDashboard from '../../pages/AdminDashboard';
import UserManagement from '../../components/admin/UserManagement';
import InstanceManagement from '../../components/admin/InstanceManagement';
import SubscriptionPlans from '../../components/admin/SubscriptionPlans';
import Analytics from '../../components/admin/Analytics';

// Mock für Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              { id: 'user1', email: 'user1@example.com', created_at: '2023-01-01', role: 'customer' },
              { id: 'user2', email: 'user2@example.com', created_at: '2023-01-02', role: 'admin' },
            ],
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'user3', email: 'user3@example.com', created_at: '2023-01-03', role: 'customer' },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'user1', email: 'user1@example.com', created_at: '2023-01-01', role: 'admin' },
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
        data: { user: { id: 'admin-user', email: 'admin@example.com' } },
        error: null,
      })),
      admin: {
        createUser: jest.fn(() => ({
          data: { user: { id: 'new-user', email: 'new@example.com' } },
          error: null,
        })),
        deleteUser: jest.fn(() => ({
          data: {},
          error: null,
        })),
      },
    },
  })),
}));

// Mock für Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
}));

describe('Admin Dashboard Tests', () => {
  // AdminDashboard Tests
  describe('AdminDashboard Component', () => {
    test('renders admin dashboard', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <AdminDashboard />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });
    });
  });
  
  // UserManagement Tests
  describe('UserManagement Component', () => {
    test('renders user list', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <UserManagement />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/user2@example.com/i)).toBeInTheDocument();
      });
    });
  });
  
  // InstanceManagement Tests
  describe('InstanceManagement Component', () => {
    test('renders instance management', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <InstanceManagement />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Instanzen/i)).toBeInTheDocument();
      });
    });
  });
  
  // Analytics Tests
  describe('Analytics Component', () => {
    test('renders analytics charts', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Analytics />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Analytik/i)).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });
  });
});
