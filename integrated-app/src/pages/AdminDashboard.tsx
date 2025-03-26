import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Admin-Komponenten
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import UserManagement from './components/UserManagement';
import InstanceManagement from './components/InstanceManagement';
import SubscriptionPlans from './components/SubscriptionPlans';
import Analytics from './components/Analytics';
import SystemSettings from './components/SystemSettings';

// Typen und Interfaces
interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  created_at: string;
}

interface WeddingInstance {
  id: string;
  user_id: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [instances, setInstances] = useState<WeddingInstance[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Aktuellen Benutzer und Daten laden
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Aktuellen Benutzer prüfen
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Benutzerrolle prüfen
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (userError) throw userError;
        
        if (userData.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        
        setCurrentUser(userData);
        
        // Alle Benutzer laden
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (usersError) throw usersError;
        
        setUsers(usersData || []);
        
        // Alle Hochzeitsinstanzen laden
        const { data: instancesData, error: instancesError } = await supabase
          .from('wedding_instances')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (instancesError) throw instancesError;
        
        setInstances(instancesData || []);
        
        // Alle Abonnements laden
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (subscriptionsError) throw subscriptionsError;
        
        setSubscriptions(subscriptionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Echtzeit-Updates für Benutzer
    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new as User, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(user => 
            user.id === payload.new.id ? payload.new as User : user
          ));
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(user => user.id !== payload.old.id));
        }
      })
      .subscribe();
      
    // Echtzeit-Updates für Hochzeitsinstanzen
    const instancesSubscription = supabase
      .channel('instances-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'wedding_instances' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setInstances(prev => [payload.new as WeddingInstance, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setInstances(prev => prev.map(instance => 
            instance.id === payload.new.id ? payload.new as WeddingInstance : instance
          ));
        } else if (payload.eventType === 'DELETE') {
          setInstances(prev => prev.filter(instance => instance.id !== payload.old.id));
        }
      })
      .subscribe();
      
    // Echtzeit-Updates für Abonnements
    const subscriptionsSubscription = supabase
      .channel('subscriptions-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscriptions' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSubscriptions(prev => [payload.new as Subscription, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSubscriptions(prev => prev.map(subscription => 
            subscription.id === payload.new.id ? payload.new as Subscription : subscription
          ));
        } else if (payload.eventType === 'DELETE') {
          setSubscriptions(prev => prev.filter(subscription => subscription.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(instancesSubscription);
      supabase.removeChannel(subscriptionsSubscription);
    };
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('common.error')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={currentUser} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={
              <div>
                <h1 className="text-2xl font-bold mb-6">{t('admin.title')}</h1>
                <Analytics users={users} instances={instances} subscriptions={subscriptions} />
              </div>
            } />
            <Route path="/users" element={
              <div>
                <h1 className="text-2xl font-bold mb-6">{t('admin.userManagement')}</h1>
                <UserManagement users={users} />
              </div>
            } />
            <Route path="/instances" element={
              <div>
                <h1 className="text-2xl font-bold mb-6">{t('admin.instanceManagement')}</h1>
                <InstanceManagement instances={instances} users={users} />
              </div>
            } />
            <Route path="/subscriptions" element={
              <div>
                <h1 className="text-2xl font-bold mb-6">{t('admin.subscriptionPlans')}</h1>
                <SubscriptionPlans subscriptions={subscriptions} users={users} />
              </div>
            } />
            <Route path="/settings" element={
              <div>
                <h1 className="text-2xl font-bold mb-6">{t('admin.systemSettings')}</h1>
                <SystemSettings />
              </div>
            } />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
