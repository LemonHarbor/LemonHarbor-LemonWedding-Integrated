import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import GuestPortal from '../../components/guest-area/GuestPortal';
import GuestInvitation from '../../components/guest-area/GuestInvitation';
import GuestRSVP from '../../components/guest-area/GuestRSVP';

// Mock für Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { 
              id: 1, 
              name: 'Max Mustermann', 
              email: 'max@example.com', 
              status: 'pending', 
              access_code: 'ABC123',
              dietary_restrictions: '',
              plus_one: false
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { 
                id: 1, 
                name: 'Max Mustermann', 
                email: 'max@example.com', 
                status: 'confirmed', 
                access_code: 'ABC123',
                dietary_restrictions: 'vegetarian',
                plus_one: true
              },
              error: null,
            })),
          })),
        })),
      })),
    }),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/invitation.jpg' },
        })),
      })),
    },
  })),
}));

describe('Guest Portal Tests', () => {
  // GuestPortal Tests
  describe('GuestPortal Component', () => {
    test('renders access code form', () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <GuestPortal />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Zugangscode/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Zugang/i })).toBeInTheDocument();
    });
  });
  
  // GuestInvitation Tests
  describe('GuestInvitation Component', () => {
    test('renders invitation details', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <GuestInvitation guestId="1" accessCode="ABC123" />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Max Mustermann/i)).toBeInTheDocument();
      });
    });
  });
  
  // GuestRSVP Tests
  describe('GuestRSVP Component', () => {
    test('renders RSVP form', async () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <GuestRSVP guestId="1" accessCode="ABC123" />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/RSVP/i)).toBeInTheDocument();
        expect(screen.getByText(/Teilnahme/i)).toBeInTheDocument();
      });
    });
  });
});
