import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import AdminDashboard from '../../pages/AdminDashboard';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'admin@example.com',
            user_metadata: {
              name: 'Admin User'
            }
          }
        },
        error: null
      }),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null
          })
        }))
      })),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: 'new-instance-id' }],
        error: null
      }),
      update: jest.fn().mockResolvedValue({
        data: [{ id: 'updated-instance-id' }],
        error: null
      }),
      delete: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }))
  }))
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'admin@example.com'
    },
    role: 'admin',
    loading: false
  }))
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <AdminDashboard />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  test('renders admin dashboard title', () => {
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  test('renders user management section', () => {
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
  });

  test('renders instance management section', () => {
    expect(screen.getByText(/instance management/i)).toBeInTheDocument();
  });

  test('renders analytics section', () => {
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });
});
