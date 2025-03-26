import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Typen und Interfaces
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  max_instances: number;
  is_active: boolean;
}

interface SubscriptionPlansProps {
  subscriptions: Subscription[];
  users: User[];
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ subscriptions, users }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Pläne laden
  React.useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        if (error) throw error;
        
        setPlans(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
    
    // Echtzeit-Updates für Pläne
    const plansSubscription = supabase
      .channel('plans-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscription_plans' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlans(prev => [...prev, payload.new as Plan]);
        } else if (payload.eventType === 'UPDATE') {
          setPlans(prev => prev.map(plan => 
            plan.id === payload.new.id ? payload.new as Plan : plan
          ));
        } else if (payload.eventType === 'DELETE') {
          setPlans(prev => prev.filter(plan => plan.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(plansSubscription);
    };
  }, []);
  
  // Gefilterte Abonnements
  const filteredSubscriptions = subscriptions.filter(subscription => 
    users.find(user => user.id === subscription.user_id)?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plans.find(plan => plan.id === subscription.plan_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Plan hinzufügen
  const addPlan = async (name: string, description: string, price: number, billingCycle: 'monthly' | 'yearly', features: string[], maxInstances: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([{
          name,
          description,
          price,
          billing_cycle: billingCycle,
          features,
          max_instances: maxInstances,
          is_active: true
        }]);
        
      if (error) throw error;
      
      setShowAddPlanModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Plan bearbeiten
  const editPlan = async (id: string, updates: Partial<Plan>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      setShowEditPlanModal(false);
      setSelectedPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Plan löschen
  const deletePlan = async (id: string) => {
    if (!confirm(t('admin.confirmDeletePlan'))) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prüfen, ob aktive Abonnements für diesen Plan existieren
      const { count, error: countError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        throw new Error(`Dieser Plan hat ${count} aktive Abonnements und kann nicht gelöscht werden.`);
      }
      
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Abonnement hinzufügen
  const addSubscription = async (userId: string, planId: string, startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan_id: planId,
          status: 'active',
          start_date: startDate,
          end_date: endDate
        }]);
        
      if (error) throw error;
      
      setShowAddSubscriptionModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Abonnement kündigen
  const cancelSubscription = async (id: string) => {
    if (!confirm(t('admin.confirmCancelSubscription'))) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Benutzer-Email anhand der ID finden
  const getUserEmail = (userId: string) => {
    const user = users.find(user => user.id === userId);
    return user ? user.email : 'Unbekannt';
  };
  
  // Plan-Name anhand der ID finden
  const getPlanName = (planId: string) => {
    const plan = plans.find(plan => plan.id === planId);
    return plan ? plan.name : 'Unbekannt';
  };
  
  // Status-Badge-Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  if (loading && plans.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="p-4 mb-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-l-4 border-red-500 rounded">
          {error}
        </div>
      )}
      
      {/* Abonnementpläne */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('admin.subscriptionPlans')}</h2>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('admin.addPlan')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {plan.is_active ? t('admin.active') : t('admin.inactive')}
                  </span>
                </div>
                
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(plan.price)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    / {plan.billing_cycle === 'monthly' ? t('admin.month') : t('admin.year')}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('admin.features')}</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('admin.maxInstances')}: {plan.max_instances}
                    </span>
                  </li>
                </ul>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowEditPlanModal(true);
                    }}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Abonnements */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('admin.subscriptions')}</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder={t('common.search')}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowAddSubscriptionModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('admin.addSubscription')}
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.plan')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.startDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.endDate')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {t('common.noResults')}
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map(subscription => (
                    <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getUserEmail(subscription.user_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getPlanName(subscription.plan_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(subscription.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(subscription.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => cancelSubscription(subscription.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            {t('admin.cancel')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.addPlan')}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const price = parseFloat(formData.get('price') as string);
                const billingCycle = formData.get('billingCycle') as 'monthly' | 'yearly';
                const featuresText = formData.get('features') as string;
                const features = featuresText.split('\n').filter(f => f.trim() !== '');
                const maxInstances = parseInt(formData.get('maxInstances') as string, 10);
                
                addPlan(name, description, price, billingCycle, features, maxInstances);
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.planName')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.planDescription')} *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.price')} *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.billingCycle')} *
                      </label>
                      <select
                        id="billingCycle"
                        name="billingCycle"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="monthly">{t('admin.monthly')}</option>
                        <option value="yearly">{t('admin.yearly')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.features')} *
                    </label>
                    <textarea
                      id="features"
                      name="features"
                      required
                      rows={4}
                      placeholder={t('admin.featuresPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.featuresHint')}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="maxInstances" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.maxInstances')} *
                    </label>
                    <input
                      type="number"
                      id="maxInstances"
                      name="maxInstances"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPlanModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Plan Modal */}
      {showEditPlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.editPlan')}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const price = parseFloat(formData.get('price') as string);
                const billingCycle = formData.get('billingCycle') as 'monthly' | 'yearly';
                const featuresText = formData.get('features') as string;
                const features = featuresText.split('\n').filter(f => f.trim() !== '');
                const maxInstances = parseInt(formData.get('maxInstances') as string, 10);
                const isActive = formData.get('isActive') === 'true';
                
                editPlan(selectedPlan.id, {
                  name,
                  description,
                  price,
                  billing_cycle: billingCycle,
                  features,
                  max_instances: maxInstances,
                  is_active: isActive
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.planName')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      defaultValue={selectedPlan.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.planDescription')} *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={2}
                      defaultValue={selectedPlan.description}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.price')} *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        defaultValue={selectedPlan.price}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.billingCycle')} *
                      </label>
                      <select
                        id="billingCycle"
                        name="billingCycle"
                        required
                        defaultValue={selectedPlan.billing_cycle}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="monthly">{t('admin.monthly')}</option>
                        <option value="yearly">{t('admin.yearly')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.features')} *
                    </label>
                    <textarea
                      id="features"
                      name="features"
                      required
                      rows={4}
                      defaultValue={selectedPlan.features.join('\n')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.featuresHint')}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="maxInstances" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.maxInstances')} *
                    </label>
                    <input
                      type="number"
                      id="maxInstances"
                      name="maxInstances"
                      required
                      min="1"
                      defaultValue={selectedPlan.max_instances}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.status')} *
                    </label>
                    <select
                      id="isActive"
                      name="isActive"
                      required
                      defaultValue={selectedPlan.is_active.toString()}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="true">{t('admin.active')}</option>
                      <option value="false">{t('admin.inactive')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPlanModal(false);
                      setSelectedPlan(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Subscription Modal */}
      {showAddSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.addSubscription')}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userId = formData.get('userId') as string;
                const planId = formData.get('planId') as string;
                const startDate = formData.get('startDate') as string;
                const endDate = formData.get('endDate') as string;
                
                addSubscription(userId, planId, startDate, endDate);
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.user')} *
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="planId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.plan')} *
                    </label>
                    <select
                      id="planId"
                      name="planId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      {plans.filter(plan => plan.is_active).map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(plan.price)} / {plan.billing_cycle === 'monthly' ? t('admin.month') : t('admin.year')})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.startDate')} *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.endDate')} *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      required
                      defaultValue={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSubscriptionModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
