import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Komponenten für das Gästemanagement
import GuestList from './GuestList';
import PaginatedGuestList from './PaginatedGuestList';
import SendReminderDialog from './SendReminderDialog';
import GuestRelationshipManager from './GuestRelationshipManager';
import GuestManagementPreview from './GuestManagementPreview';

// Typen und Interfaces
interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  rsvp_status: 'confirmed' | 'declined' | 'pending';
  dietary_restrictions: string | null;
  table_assignment: string | null;
  category: 'family' | 'friends' | 'colleagues' | null;
  created_at: string;
  updated_at: string;
}

const GuestManagementIntegrated: React.FC = () => {
  const { t } = useTranslation();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Daten laden
  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setGuests(data || []);
        setFilteredGuests(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuests();
    
    // Echtzeit-Updates für Gäste
    const subscription = supabase
      .channel('guests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guests' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setGuests(prev => [...prev, payload.new as Guest]);
        } else if (payload.eventType === 'UPDATE') {
          setGuests(prev => prev.map(guest => 
            guest.id === payload.new.id ? payload.new as Guest : guest
          ));
        } else if (payload.eventType === 'DELETE') {
          setGuests(prev => prev.filter(guest => guest.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  // Filter anwenden
  useEffect(() => {
    let result = guests;
    
    // Suchbegriff filtern
    if (searchTerm) {
      result = result.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.phone && guest.phone.includes(searchTerm))
      );
    }
    
    // Status filtern
    if (statusFilter !== 'all') {
      result = result.filter(guest => guest.rsvp_status === statusFilter);
    }
    
    // Kategorie filtern
    if (categoryFilter !== 'all') {
      result = result.filter(guest => guest.category === categoryFilter);
    }
    
    setFilteredGuests(result);
  }, [guests, searchTerm, statusFilter, categoryFilter]);
  
  // Gast hinzufügen
  const addGuest = async (newGuest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([newGuest])
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setGuests(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Gastes');
    }
  };
  
  // Gast aktualisieren
  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setGuests(prev => prev.map(guest => 
        guest.id === id ? { ...guest, ...updates } : guest
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Gastes');
    }
  };
  
  // Gast löschen
  const deleteGuest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setGuests(prev => prev.filter(guest => guest.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Gastes');
    }
  };
  
  // RSVP-Erinnerungen senden
  const sendReminders = async (guestIds: string[]) => {
    try {
      // Edge Function aufrufen
      const { error } = await supabase.functions.invoke('send-rsvp-reminders', {
        body: { guestIds }
      });
      
      if (error) throw error;
      
      setShowReminderDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Erinnerungen');
    }
  };
  
  // Gäste importieren
  const importGuests = async (guestData: any[]) => {
    try {
      const { error } = await supabase
        .from('guests')
        .insert(guestData);
        
      if (error) throw error;
      
      // Daten neu laden
      const { data, error: fetchError } = await supabase
        .from('guests')
        .select('*')
        .order('name');
        
      if (fetchError) throw fetchError;
      
      setGuests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Importieren der Gäste');
    }
  };
  
  // Gäste exportieren
  const exportGuests = () => {
    try {
      const dataStr = JSON.stringify(guests, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'guests.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Exportieren der Gäste');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">{t('common.loading')}...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('guestManagement.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowReminderDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('guestManagement.sendReminders')}
          </button>
          <button 
            onClick={exportGuests}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {t('guestManagement.export')}
          </button>
          <button 
            onClick={() => document.getElementById('import-input')?.click()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            {t('guestManagement.import')}
          </button>
          <input 
            id="import-input"
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target?.result as string);
                    importGuests(data);
                  } catch (err) {
                    setError('Ungültiges Dateiformat');
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t('guestManagement.searchPlaceholder')}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <select
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('guestManagement.allStatuses')}</option>
            <option value="confirmed">{t('guestManagement.confirmed')}</option>
            <option value="declined">{t('guestManagement.declined')}</option>
            <option value="pending">{t('guestManagement.pending')}</option>
          </select>
        </div>
        
        <div>
          <select
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t('guestManagement.allCategories')}</option>
            <option value="family">{t('guestManagement.family')}</option>
            <option value="friends">{t('guestManagement.friends')}</option>
            <option value="colleagues">{t('guestManagement.colleagues')}</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg overflow-hidden">
        <PaginatedGuestList 
          guests={filteredGuests}
          onUpdate={updateGuest}
          onDelete={deleteGuest}
          onAdd={addGuest}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{t('guestManagement.statistics')}</h2>
          <GuestManagementPreview guests={guests} />
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{t('guestManagement.relationships')}</h2>
          <GuestRelationshipManager guests={guests} />
        </div>
      </div>
      
      {showReminderDialog && (
        <SendReminderDialog
          guests={guests.filter(g => g.rsvp_status === 'pending')}
          onClose={() => setShowReminderDialog(false)}
          onSend={sendReminders}
        />
      )}
    </div>
  );
};

export default GuestManagementIntegrated;
