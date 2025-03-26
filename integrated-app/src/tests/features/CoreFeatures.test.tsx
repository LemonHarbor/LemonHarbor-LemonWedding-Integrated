import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import CoreFeatures from '../../pages/CoreFeatures';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@example.com',
            user_metadata: {
              name: 'Test User'
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
          order: jest.fn(() => ({
            data: [
              { id: 'guest-1', name: 'John Doe', status: 'confirmed' },
              { id: 'guest-2', name: 'Jane Smith', status: 'pending' }
            ],
            error: null
          }))
        }))
      })),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: 'new-guest-id' }],
        error: null
      }),
      update: jest.fn().mockResolvedValue({
        data: [{ id: 'updated-guest-id' }],
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
      email: 'user@example.com'
    },
    role: 'customer',
    loading: false
  }))
}));

describe('CoreFeatures Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <CoreFeatures />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  test('renders guest management section', () => {
    expect(screen.getByText(/guest management/i)).toBeInTheDocument();
  });

  test('renders table planner section', () => {
    expect(screen.getByText(/table planner/i)).toBeInTheDocument();
  });

  test('renders budget tracker section', () => {
    expect(screen.getByText(/budget tracker/i)).toBeInTheDocument();
  });

  test('renders task board section', () => {
    expect(screen.getByText(/task board/i)).toBeInTheDocument();
  });
});
