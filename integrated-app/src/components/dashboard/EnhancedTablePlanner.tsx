import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Komponenten für die Tischplanung
import TableCanvas from './TableCanvas';
import TableControls from './TableControls';
import AIOptimizationDialog from './AIOptimizationDialog';
import GuestPool from './GuestPool';
import DroppableTableArea from './DroppableTableArea';

// Typen und Interfaces
interface Table {
  id: string;
  name: string;
  shape: 'round' | 'rectangle' | 'oval';
  capacity: number;
  position_x: number;
  position_y: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvp_status: 'confirmed' | 'declined' | 'pending';
  table_assignment: string | null;
  dietary_restrictions: string | null;
}

interface Relationship {
  id: string;
  guest_id: string;
  related_guest_id: string;
  relationship_type: 'preference' | 'conflict';
}

const TablePlanner: React.FC = () => {
  const { t } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Daten laden
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tische laden
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .order('name');
          
        if (tablesError) throw tablesError;
        
        // Bestätigte Gäste laden
        const { data: guestsData, error: guestsError } = await supabase
          .from('guests')
          .select('*')
          .eq('rsvp_status', 'confirmed')
          .order('name');
          
        if (guestsError) throw guestsError;
        
        // Beziehungen laden
        const { data: relationshipsData, error: relationshipsError } = await supabase
          .from('guest_relationships')
          .select('*');
          
        if (relationshipsError) throw relationshipsError;
        
        setTables(tablesData || []);
        setGuests(guestsData || []);
        setRelationships(relationshipsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Echtzeit-Updates für Tische
    const tablesSubscription = supabase
      .channel('tables-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tables' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTables(prev => [...prev, payload.new as Table]);
        } else if (payload.eventType === 'UPDATE') {
          setTables(prev => prev.map(table => 
            table.id === payload.new.id ? payload.new as Table : table
          ));
        } else if (payload.eventType === 'DELETE') {
          setTables(prev => prev.filter(table => table.id !== payload.old.id));
        }
      })
      .subscribe();
      
    // Echtzeit-Updates für Gäste
    const guestsSubscription = supabase
      .channel('guests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guests' 
      }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.rsvp_status === 'confirmed') {
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
      supabase.removeChannel(tablesSubscription);
      supabase.removeChannel(guestsSubscription);
    };
  }, []);
  
  // Tisch hinzufügen
  const addTable = async (newTable: Omit<Table, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([newTable])
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTables(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Tisches');
    }
  };
  
  // Tisch aktualisieren
  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTables(prev => prev.map(table => 
        table.id === id ? { ...table, ...updates } : table
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Tisches');
    }
  };
  
  // Tisch löschen
  const deleteTable = async (id: string) => {
    try {
      // Zuerst alle Gäste von diesem Tisch entfernen
      const guestsAtTable = guests.filter(guest => guest.table_assignment === id);
      
      for (const guest of guestsAtTable) {
        await supabase
          .from('guests')
          .update({ table_assignment: null })
          .eq('id', guest.id);
      }
      
      // Dann den Tisch löschen
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTables(prev => prev.filter(table => table.id !== id));
      setGuests(prev => prev.map(guest => 
        guest.table_assignment === id ? { ...guest, table_assignment: null } : guest
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Tisches');
    }
  };
  
  // Gast einem Tisch zuweisen
  const assignGuestToTable = async (guestId: string, tableId: string | null) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ table_assignment: tableId })
        .eq('id', guestId);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setGuests(prev => prev.map(guest => 
        guest.id === guestId ? { ...guest, table_assignment: tableId } : guest
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Zuweisen des Gastes');
    }
  };
  
  // KI-Optimierung starten
  const startAIOptimization = () => {
    setShowAIDialog(true);
  };
  
  // KI-Vorschläge anwenden
  const applyAISuggestions = async (suggestions: { guestId: string, tableId: string }[]) => {
    try {
      // Batch-Update für alle Zuweisungen
      for (const suggestion of suggestions) {
        await assignGuestToTable(suggestion.guestId, suggestion.tableId);
      }
      
      setShowAIDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der KI-Optimierung');
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
        <h1 className="text-2xl font-bold">{t('tablePlanner.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={startAIOptimization}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            {t('tablePlanner.aiAssistant')}
          </button>
          <TableControls 
            onAddTable={addTable} 
            tables={tables}
            onUpdateTable={updateTable}
            onDeleteTable={deleteTable}
          />
        </div>
      </div>
      
      <div className="flex flex-1 space-x-4">
        <div className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">{t('tablePlanner.guestPool')}</h2>
          <GuestPool 
            guests={guests.filter(guest => !guest.table_assignment)} 
            onAssign={assignGuestToTable}
          />
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg">
          <DroppableTableArea
            tables={tables}
            guests={guests}
            onTableUpdate={updateTable}
            onGuestAssign={assignGuestToTable}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
          />
        </div>
      </div>
      
      {showAIDialog && (
        <AIOptimizationDialog
          tables={tables}
          guests={guests}
          relationships={relationships}
          onClose={() => setShowAIDialog(false)}
          onApplySuggestions={applyAISuggestions}
        />
      )}
    </div>
  );
};

export default TablePlanner;
