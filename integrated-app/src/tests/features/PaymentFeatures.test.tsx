import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import PaymentPage from '../../pages/PaymentPage';

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
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'subscription-1',
              plan_id: 'plan-basic',
              status: 'active'
            },
            error: null
          })
        }))
      })),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: 'new-subscription-id' }],
        error: null
      }),
      update: jest.fn().mockResolvedValue({
        data: [{ id: 'updated-subscription-id' }],
        error: null
      })
    })),
    functions: {
      invoke: jest.fn().mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test-session' },
        error: null
      })
    },
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/image.jpg' }
        }))
      }))
    }
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

describe('PaymentPage Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <PaymentPage />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  test('renders subscription plans section', () => {
    expect(screen.getByText(/subscription plans/i)).toBeInTheDocument();
  });

  test('renders basic plan option', () => {
    expect(screen.getByText(/basic plan/i)).toBeInTheDocument();
  });

  test('renders premium plan option', () => {
    expect(screen.getByText(/premium plan/i)).toBeInTheDocument();
  });

  test('renders professional plan option', () => {
    expect(screen.getByText(/professional plan/i)).toBeInTheDocument();
  });
});
