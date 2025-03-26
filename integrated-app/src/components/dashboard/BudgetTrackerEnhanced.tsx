import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Komponenten für die Budgetverfolgung
interface Expense {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  planned_amount: number;
  actual_amount: number;
  created_at: string;
  updated_at: string;
}

const BudgetTrackerEnhanced: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPlanned, setTotalPlanned] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Daten laden
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Budgetkategorien laden
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('budget_categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        // Ausgaben laden
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
          
        if (expensesError) throw expensesError;
        
        setCategories(categoriesData || []);
        setExpenses(expensesData || []);
        
        // Summen berechnen
        if (categoriesData) {
          const planned = categoriesData.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0);
          const actual = categoriesData.reduce((sum, cat) => sum + (cat.actual_amount || 0), 0);
          setTotalPlanned(planned);
          setTotalActual(actual);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Echtzeit-Updates für Budgetkategorien
    const categoriesSubscription = supabase
      .channel('budget-categories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'budget_categories' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCategories(prev => [...prev, payload.new as BudgetCategory]);
        } else if (payload.eventType === 'UPDATE') {
          setCategories(prev => prev.map(cat => 
            cat.id === payload.new.id ? payload.new as BudgetCategory : cat
          ));
        } else if (payload.eventType === 'DELETE') {
          setCategories(prev => prev.filter(cat => cat.id !== payload.old.id));
        }
        
        // Summen neu berechnen
        setCategories(prev => {
          const planned = prev.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0);
          const actual = prev.reduce((sum, cat) => sum + (cat.actual_amount || 0), 0);
          setTotalPlanned(planned);
          setTotalActual(actual);
          return prev;
        });
      })
      .subscribe();
      
    // Echtzeit-Updates für Ausgaben
    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setExpenses(prev => [...prev, payload.new as Expense]);
          updateCategoryAmount(payload.new.category_id, payload.new.amount, 'add');
        } else if (payload.eventType === 'UPDATE') {
          // Alte Ausgabe finden, um Differenz zu berechnen
          const oldExpense = expenses.find(exp => exp.id === payload.new.id);
          if (oldExpense) {
            // Alte Kategorie aktualisieren, falls sie sich geändert hat
            if (oldExpense.category_id !== payload.new.category_id) {
              updateCategoryAmount(oldExpense.category_id, oldExpense.amount, 'subtract');
              updateCategoryAmount(payload.new.category_id, payload.new.amount, 'add');
            } else {
              // Nur Betrag hat sich geändert
              const difference = payload.new.amount - oldExpense.amount;
              updateCategoryAmount(payload.new.category_id, difference, 'add');
            }
          }
          
          setExpenses(prev => prev.map(exp => 
            exp.id === payload.new.id ? payload.new as Expense : exp
          ));
        } else if (payload.eventType === 'DELETE') {
          const deletedExpense = expenses.find(exp => exp.id === payload.old.id);
          if (deletedExpense) {
            updateCategoryAmount(deletedExpense.category_id, deletedExpense.amount, 'subtract');
          }
          
          setExpenses(prev => prev.filter(exp => exp.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(expensesSubscription);
    };
  }, []);
  
  // Kategorie-Betrag aktualisieren
  const updateCategoryAmount = async (categoryId: string, amount: number, operation: 'add' | 'subtract') => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      const newAmount = operation === 'add' 
        ? (category.actual_amount || 0) + amount
        : (category.actual_amount || 0) - amount;
      
      const { error } = await supabase
        .from('budget_categories')
        .update({ actual_amount: newAmount })
        .eq('id', categoryId);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, actual_amount: newAmount } : cat
      ));
      
      // Gesamtsumme aktualisieren
      setTotalActual(prev => 
        operation === 'add' ? prev + amount : prev - amount
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Kategorie');
    }
  };
  
  // Kategorie hinzufügen
  const addCategory = async (newCategory: Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert([newCategory])
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setCategories(prev => [...prev, data]);
      setTotalPlanned(prev => prev + (newCategory.planned_amount || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Kategorie');
    }
  };
  
  // Kategorie aktualisieren
  const updateCategory = async (id: string, updates: Partial<BudgetCategory>) => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;
      
      const { error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...updates } : cat
      ));
      
      // Gesamtsumme aktualisieren, falls sich der geplante Betrag geändert hat
      if (updates.planned_amount !== undefined) {
        const difference = updates.planned_amount - category.planned_amount;
        setTotalPlanned(prev => prev + difference);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Kategorie');
    }
  };
  
  // Kategorie löschen
  const deleteCategory = async (id: string) => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;
      
      // Prüfen, ob Ausgaben mit dieser Kategorie existieren
      const { count, error: countError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        throw new Error(`Diese Kategorie hat ${count} zugeordnete Ausgaben und kann nicht gelöscht werden.`);
      }
      
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setTotalPlanned(prev => prev - (category.planned_amount || 0));
      setTotalActual(prev => prev - (category.actual_amount || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Kategorie');
    }
  };
  
  // Ausgabe hinzufügen
  const addExpense = async (newExpense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setExpenses(prev => [data, ...prev]);
      
      // Kategorie-Betrag aktualisieren
      updateCategoryAmount(newExpense.category_id, newExpense.amount, 'add');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Ausgabe');
    }
  };
  
  // Ausgabe aktualisieren
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const expense = expenses.find(exp => exp.id === id);
      if (!expense) return;
      
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setExpenses(prev => prev.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      ));
      
      // Kategorie-Betrag aktualisieren, falls sich der Betrag oder die Kategorie geändert hat
      if (updates.amount !== undefined || updates.category_id !== undefined) {
        if (updates.category_id !== undefined && updates.category_id !== expense.category_id) {
          // Kategorie hat sich geändert
          updateCategoryAmount(expense.category_id, expense.amount, 'subtract');
          updateCategoryAmount(
            updates.category_id, 
            updates.amount !== undefined ? updates.amount : expense.amount, 
            'add'
          );
        } else if (updates.amount !== undefined) {
          // Nur Betrag hat sich geändert
          const difference = updates.amount - expense.amount;
          updateCategoryAmount(expense.category_id, difference, 'add');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Ausgabe');
    }
  };
  
  // Ausgabe löschen
  const deleteExpense = async (id: string) => {
    try {
      const expense = expenses.find(exp => exp.id === id);
      if (!expense) return;
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistische UI-Aktualisierung
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      
      // Kategorie-Betrag aktualisieren
      updateCategoryAmount(expense.category_id, expense.amount, 'subtract');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Ausgabe');
    }
  };
  
  // Budget-Bericht exportieren
  const exportBudgetReport = () => {
    try {
      const report = {
        categories: categories,
        expenses: expenses,
        summary: {
          totalPlanned,
          totalActual,
          remaining: totalPlanned - totalActual,
          percentUsed: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0
        }
      };
      
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'budget-report.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Exportieren des Berichts');
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
        <h1 className="text-2xl font-bold">{t('budgetTracker.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={exportBudgetReport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {t('budgetTracker.exportReport')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('budgetTracker.plannedBudget')}</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPlanned)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('budgetTracker.actualExpenses')}</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalActual)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">{t('budgetTracker.remaining')}</h2>
          <p className={`text-3xl font-bold ${
            totalPlanned - totalActual >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPlanned - totalActual)}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{t('budgetTracker.categories')}</h2>
          
          <div className="space-y-4">
            {categories.map(category => (
              <div 
                key={category.id} 
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{category.name}</h3>
                  <div className="text-sm">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(category.actual_amount || 0)}
                    {' / '}
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(category.planned_amount || 0)}
                  </div>
                </div>
                
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      (category.actual_amount || 0) <= (category.planned_amount || 0)
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        ((category.actual_amount || 0) / (category.planned_amount || 1)) * 100,
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              // Hier würde ein Modal zum Hinzufügen einer Kategorie geöffnet werden
              const name = prompt(t('budgetTracker.enterCategoryName'));
              const amount = parseFloat(prompt(t('budgetTracker.enterPlannedAmount')) || '0');
              
              if (name && !isNaN(amount)) {
                addCategory({
                  name,
                  planned_amount: amount,
                  actual_amount: 0
                });
              }
            }}
          >
            {t('budgetTracker.addCategory')}
          </button>
        </div>
        
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedCategory 
                ? `${t('budgetTracker.expensesFor')} ${categories.find(c => c.id === selectedCategory)?.name}`
                : t('budgetTracker.allExpenses')
              }
            </h2>
            
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Hier würde ein Modal zum Hinzufügen einer Ausgabe geöffnet werden
                const description = prompt(t('budgetTracker.enterDescription'));
                const amount = parseFloat(prompt(t('budgetTracker.enterAmount')) || '0');
                const categoryId = selectedCategory || prompt(t('budgetTracker.enterCategoryId'));
                
                if (description && !isNaN(amount) && categoryId) {
                  addExpense({
                    category_id: categoryId,
                    amount,
                    description,
                    date: new Date().toISOString().split('T')[0],
                    receipt_url: null
                  });
                }
              }}
            >
              {t('budgetTracker.addExpense')}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('budgetTracker.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('budgetTracker.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('budgetTracker.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('budgetTracker.amount')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {expenses
                  .filter(expense => !selectedCategory || expense.category_id === selectedCategory)
                  .map(expense => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {categories.find(c => c.id === expense.category_id)?.name || 'Unbekannt'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          onClick={() => {
                            // Hier würde ein Modal zum Bearbeiten einer Ausgabe geöffnet werden
                            const description = prompt(t('budgetTracker.enterDescription'), expense.description);
                            const amount = parseFloat(prompt(t('budgetTracker.enterAmount'), expense.amount.toString()) || '0');
                            
                            if (description && !isNaN(amount)) {
                              updateExpense(expense.id, {
                                description,
                                amount
                              });
                            }
                          }}
                        >
                          {t('common.edit')}
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => {
                            if (confirm(t('budgetTracker.confirmDelete'))) {
                              deleteExpense(expense.id);
                            }
                          }}
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTrackerEnhanced;
