import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Komponenten für die digitale Einladung
interface Invitation {
  id: string;
  guest_id: string;
  access_code: string;
  viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const GuestInvitation: React.FC<{ accessCode?: string }> = ({ accessCode }) => {
  const { t } = useTranslation();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Einladung und Gast laden
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!accessCode) {
        setError(t('guestPortal.noAccessCode'));
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Einladung laden
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('*')
          .eq('access_code', accessCode)
          .single();
          
        if (invitationError) throw invitationError;
        
        if (!invitationData) {
          setError(t('guestPortal.invalidAccessCode'));
          setLoading(false);
          return;
        }
        
        setInvitation(invitationData);
        
        // Gast laden
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('id', invitationData.guest_id)
          .single();
          
        if (guestError) throw guestError;
        
        setGuest(guestData);
        
        // Viewed-Timestamp aktualisieren, falls noch nicht gesetzt
        if (!invitationData.viewed_at) {
          await supabase
            .from('invitations')
            .update({ viewed_at: new Date().toISOString() })
            .eq('id', invitationData.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitation();
  }, [accessCode, t]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('guestPortal.error')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!guest || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('guestPortal.notFound')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('guestPortal.invalidAccessCode')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">{t('guestInvitation.title')}</h1>
            <p className="text-xl text-blue-100">{t('guestInvitation.subtitle')}</p>
          </div>
          
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('guestInvitation.hello')} {guest.name}!
            </h2>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              {t('guestInvitation.invitationText')}
            </p>
            
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('guestInvitation.dateAndTime')}
              </h3>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {t('guestInvitation.date')}
              </p>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {t('guestInvitation.time')}
              </p>
            </div>
            
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('guestInvitation.location')}
              </h3>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {t('guestInvitation.venue')}
              </p>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {t('guestInvitation.address')}
              </p>
            </div>
            
            <div className="mb-12">
              <a 
                href={`/rsvp/${invitation.access_code}`}
                className="inline-block py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transition-colors"
              >
                {t('guestInvitation.rsvpButton')}
              </a>
            </div>
            
            <div className="text-gray-600 dark:text-gray-400">
              <p>{t('guestInvitation.additionalInfo')}</p>
              <p className="mt-2">{t('guestInvitation.contactInfo')}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('guestPortal.accessCode')}: <span className="font-mono">{invitation.access_code}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestInvitation;
