import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import GuestPortal from '../../components/guest-area/GuestPortal';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-guest-id' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-invitation-id',
              wedding_id: 'test-wedding-id',
              guest_name: 'Test Guest',
              rsvp_status: 'pending'
            },
            error: null
          })
        }))
      })),
      update: jest.fn().mockResolvedValue({
        data: { id: 'test-invitation-id' },
        error: null
      })
    })),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/image.jpg' }
        }))
      }))
    }
  }))
}));

describe('GuestPortal Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <GuestPortal />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  test('renders guest portal title', () => {
    expect(screen.getByText(/wedding invitation/i)).toBeInTheDocument();
  });

  test('allows guest to submit RSVP', async () => {
    const accessCodeInput = screen.getByLabelText(/access code/i);
    fireEvent.change(accessCodeInput, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
