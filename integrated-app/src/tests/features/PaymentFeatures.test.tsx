import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import SubscriptionPlans from '../../components/payment/SubscriptionPlans';
import OneTimePayment from '../../components/payment/OneTimePayment';
import WhiteLabel from '../../components/payment/WhiteLabel';
import PaymentPage from '../../pages/PaymentPage';

// Mock für Stripe
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({
    confirmCardPayment: jest.fn(() => Promise.resolve({ paymentIntent: { status: 'succeeded', id: 'pi_123' } })),
  }),
  useElements: () => ({
    getElement: jest.fn(() => true),
  }),
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

// Mock für Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              { 
                id: 'plan_basic', 
                name: 'Basic', 
                description: 'Für kleine Hochzeiten', 
                price: 49.99, 
                billing_cycle: 'monthly',
                features: ['Gästeliste', 'Tischplan', 'Budget'],
                max_instances: 1,
                is_active: true
              },
              { 
                id: 'plan_premium', 
                name: 'Premium', 
                description: 'Für mittlere Hochzeiten', 
                price: 99.99, 
                billing_cycle: 'monthly',
                features: ['Gästeliste', 'Tischplan', 'Budget', 'Aufgaben', 'Gästeportal'],
                max_instances: 1,
                is_active: true
              },
            ],
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'sub_123', status: 'active' },
            error: null,
          })),
        })),
      })),
    }),
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })),
    },
    functions: {
      invoke: jest.fn(() => Promise.resolve({
        data: { clientSecret: 'cs_123', paymentId: 'pi_123', paymentUrl: 'https://example.com/pay', redirectUrl: 'https://example.com/redirect' },
        error: null,
      })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({
          data: { path: 'logos/logo.png' },
          error: null,
        })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/logo.png' },
        })),
      })),
    },
  })),
}));

describe('Payment Features Tests', () => {
  // SubscriptionPlans Tests
  describe('SubscriptionPlans Component', () => {
    test('renders subscription plans', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <SubscriptionPlans onSubscriptionSuccess={jest.fn()} />
        </I18nextProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Basic/i)).toBeInTheDocument();
        expect(screen.getByText(/Premium/i)).toBeInTheDocument();
      });
    });
  });
  
  // OneTimePayment Tests
  describe('OneTimePayment Component', () => {
    test('renders payment form', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <OneTimePayment onSuccess={jest.fn()} />
        </I18nextProvider>
      );
      
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });
  
  // WhiteLabel Tests
  describe('WhiteLabel Component', () => {
    test('renders white label form', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <WhiteLabel onSuccess={jest.fn()} />
        </I18nextProvider>
      );
      
      expect(screen.getByLabelText(/companyName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/companyLogo/i)).toBeInTheDocument();
    });
  });
  
  // PaymentPage Tests
  describe('PaymentPage Component', () => {
    test('renders payment tabs', () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <PaymentPage />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/subscriptions/i)).toBeInTheDocument();
      expect(screen.getByText(/oneTimePayment/i)).toBeInTheDocument();
      expect(screen.getByText(/whiteLabel/i)).toBeInTheDocument();
    });
  });
});
