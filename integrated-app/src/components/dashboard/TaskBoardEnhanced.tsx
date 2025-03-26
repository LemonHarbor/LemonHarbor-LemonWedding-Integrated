import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Komponenten für die Aufgabenverwaltung
interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const TaskBoardEnhanced: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date');
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Daten laden
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('tasks')
          .select('*');
          
        // Sortierung anwenden
        if (sortBy === 'due_date') {
          query = query.order('due_date', { ascending: true, nullsLast: true });
        } else if (sortBy === 'priority') {
          // Priorität: high > medium > low
          query = query.order('priority', { 
            ascending: false,
            foreignTable: 'priorities',
            transform: (priority) => {
              if (priority === 'high') return 3;
              if (priority === 'medium') return 2;
              return 1;
            }
          });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        setTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    // Echtzeit-Updates für Aufgaben
    const subscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(task => 
            task.id === payload.new.id ? payload.new as Task : task
          ));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(task => task.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sortBy]);
  
  // Gefilterte Aufgaben
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    return !task.completed;
  });
  
  // Aufgabe hinzufügen
  const addTask = async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTasks(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Aufgabe');
    }
  };
  
  // Aufgabe aktualisieren
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Aufgabe');
    }
  };
  
  // Aufgabe löschen
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Aufgabe');
    }
  };
  
  // Aufgabe als erledigt markieren
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Aufgabe');
    }
  };
  
  // Prioritätsfarbe
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <h1 className="text-2xl font-bold">{t('taskBoard.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              const title = prompt(t('taskBoard.enterTaskTitle'));
              if (title) {
                const dueDate = prompt(t('taskBoard.enterDueDate'), new Date().toISOString().split('T')[0]);
                const priority = prompt(
                  t('taskBoard.enterPriority'), 
                  'medium'
                ) as 'high' | 'medium' | 'low';
                
                addTask({
                  title,
                  due_date: dueDate || null,
                  priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
                  completed: false
                });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('taskBoard.addTask')}
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <select
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
          >
            <option value="all">{t('taskBoard.allTasks')}</option>
            <option value="completed">{t('taskBoard.completedTasks')}</option>
            <option value="pending">{t('taskBoard.pendingTasks')}</option>
          </select>
        </div>
        
        <div>
          <select
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority' | 'created_at')}
          >
            <option value="due_date">{t('taskBoard.sortByDueDate')}</option>
            <option value="priority">{t('taskBoard.sortByPriority')}</option>
            <option value="created_at">{t('taskBoard.sortByCreatedAt')}</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('taskBoard.noTasks')}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-4 rounded-lg border ${
                  task.completed 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' 
                    : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id, !task.completed)}
                      className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    <div>
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.due_date && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {t(`taskBoard.priority.${task.priority}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        const title = prompt(t('taskBoard.enterTaskTitle'), task.title);
                        if (title) {
                          const dueDate = prompt(
                            t('taskBoard.enterDueDate'), 
                            task.due_date || new Date().toISOString().split('T')[0]
                          );
                          const priority = prompt(
                            t('taskBoard.enterPriority'), 
                            task.priority
                          ) as 'high' | 'medium' | 'low';
                          
                          updateTask(task.id, {
                            title,
                            due_date: dueDate || null,
                            priority: ['high', 'medium', 'low'].includes(priority) ? priority : task.priority
                          });
                        }
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      {t('common.edit')}
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (confirm(t('taskBoard.confirmDelete'))) {
                          deleteTask(task.id);
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('taskBoard.totalTasks')}</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {tasks.length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('taskBoard.completedTasks')}</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {tasks.filter(task => task.completed).length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('taskBoard.pendingTasks')}</h2>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {tasks.filter(task => !task.completed).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskBoardEnhanced;
