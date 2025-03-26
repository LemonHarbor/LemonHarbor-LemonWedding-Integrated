import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

// Typen und Interfaces
interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

interface WeddingInstance {
  id: string;
  user_id: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  name: string;
  wedding_date: string | null;
  theme: string;
  language: string;
}

interface InstanceManagementProps {
  instances: WeddingInstance[];
  users: User[];
}

const InstanceManagement: React.FC<InstanceManagementProps> = ({ instances, users }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInstanceModal, setShowAddInstanceModal] = useState(false);
  const [showEditInstanceModal, setShowEditInstanceModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WeddingInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Supabase Client initialisieren
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Gefilterte Instanzen
  const filteredInstances = instances.filter(instance => 
    instance.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    users.find(user => user.id === instance.user_id)?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Instanz hinzufügen
  const addInstance = async (userId: string, name: string, domain: string, theme: string, language: string, weddingDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prüfen, ob Domain bereits existiert
      const { data: existingDomain, error: domainError } = await supabase
        .from('wedding_instances')
        .select('domain')
        .eq('domain', domain)
        .single();
        
      if (domainError && domainError.code !== 'PGRST116') {
        throw domainError;
      }
      
      if (existingDomain) {
        throw new Error(t('admin.domainAlreadyExists'));
      }
      
      // Instanz erstellen
      const { error: instanceError } = await supabase
        .from('wedding_instances')
        .insert([{
          user_id: userId,
          domain,
          name,
          status: 'pending',
          theme,
          language,
          wedding_date: weddingDate || null
        }]);
        
      if (instanceError) throw instanceError;
      
      setShowAddInstanceModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Instanz bearbeiten
  const editInstance = async (id: string, updates: Partial<WeddingInstance>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Wenn Domain geändert wurde, prüfen, ob sie bereits existiert
      if (updates.domain && updates.domain !== selectedInstance?.domain) {
        const { data: existingDomain, error: domainError } = await supabase
          .from('wedding_instances')
          .select('domain')
          .eq('domain', updates.domain)
          .single();
          
        if (domainError && domainError.code !== 'PGRST116') {
          throw domainError;
        }
        
        if (existingDomain) {
          throw new Error(t('admin.domainAlreadyExists'));
        }
      }
      
      const { error } = await supabase
        .from('wedding_instances')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      setShowEditInstanceModal(false);
      setSelectedInstance(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Instanz löschen
  const deleteInstance = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteInstance'))) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Instanz löschen
      const { error } = await supabase
        .from('wedding_instances')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  // Instanz aktivieren/deaktivieren
  const toggleInstanceStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('wedding_instances')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    }
  };
  
  // Benutzer-Email anhand der ID finden
  const getUserEmail = (userId: string) => {
    const user = users.find(user => user.id === userId);
    return user ? user.email : 'Unbekannt';
  };
  
  // Status-Badge-Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('admin.weddingInstances')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('admin.manageInstances')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t('common.search')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <button
            onClick={() => setShowAddInstanceModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('admin.createInstance')}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.instanceName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.domain')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.owner')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.createdAt')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInstances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              filteredInstances.map(instance => (
                <tr key={instance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {instance.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {instance.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getUserEmail(instance.user_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(instance.status)}`}>
                      {instance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(instance.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleInstanceStatus(instance.id, instance.status)}
                      className={`${
                        instance.status === 'active' 
                          ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' 
                          : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                      } mr-4`}
                    >
                      {instance.status === 'active' ? t('admin.deactivate') : t('admin.activate')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInstance(instance);
                        setShowEditInstanceModal(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => deleteInstance(instance.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Instance Modal */}
      {showAddInstanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.createInstance')}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userId = formData.get('userId') as string;
                const name = formData.get('name') as string;
                const domain = formData.get('domain') as string;
                const theme = formData.get('theme') as string;
                const language = formData.get('language') as string;
                const weddingDate = formData.get('weddingDate') as string;
                
                addInstance(userId, name, domain, theme, language, weddingDate);
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.owner')} *
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.instanceName')} *
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
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.domain')} *
                    </label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      required
                      pattern="[a-z0-9-]+"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.domainHint')}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.theme')} *
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="classic">{t('admin.themeClassic')}</option>
                      <option value="modern">{t('admin.themeModern')}</option>
                      <option value="rustic">{t('admin.themeRustic')}</option>
                      <option value="elegant">{t('admin.themeElegant')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.language')} *
                    </label>
                    <select
                      id="language"
                      name="language"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="de">{t('settings.german')}</option>
                      <option value="en">{t('settings.english')}</option>
                      <option value="fr">{t('settings.french')}</option>
                      <option value="es">{t('settings.spanish')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('settings.weddingDate')}
                    </label>
                    <input
                      type="date"
                      id="weddingDate"
                      name="weddingDate"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddInstanceModal(false)}
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
      
      {/* Edit Instance Modal */}
      {showEditInstanceModal && selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.editInstance')}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userId = formData.get('userId') as string;
                const name = formData.get('name') as string;
                const domain = formData.get('domain') as string;
                const theme = formData.get('theme') as string;
                const language = formData.get('language') as string;
                const weddingDate = formData.get('weddingDate') as string;
                const status = formData.get('status') as 'active' | 'inactive' | 'pending';
                
                editInstance(selectedInstance.id, {
                  user_id: userId,
                  name,
                  domain,
                  theme,
                  language,
                  wedding_date: weddingDate || null,
                  status
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.owner')} *
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      required
                      defaultValue={selectedInstance.user_id}
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.instanceName')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      defaultValue={selectedInstance.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.domain')} *
                    </label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      required
                      pattern="[a-z0-9-]+"
                      defaultValue={selectedInstance.domain}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.domainHint')}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.status')} *
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      defaultValue={selectedInstance.status}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">{t('admin.statusActive')}</option>
                      <option value="inactive">{t('admin.statusInactive')}</option>
                      <option value="pending">{t('admin.statusPending')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.theme')} *
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      required
                      defaultValue={selectedInstance.theme}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="classic">{t('admin.themeClassic')}</option>
                      <option value="modern">{t('admin.themeModern')}</option>
                      <option value="rustic">{t('admin.themeRustic')}</option>
                      <option value="elegant">{t('admin.themeElegant')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.language')} *
                    </label>
                    <select
                      id="language"
                      name="language"
                      required
                      defaultValue={selectedInstance.language}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="de">{t('settings.german')}</option>
                      <option value="en">{t('settings.english')}</option>
                      <option value="fr">{t('settings.french')}</option>
                      <option value="es">{t('settings.spanish')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('settings.weddingDate')}
                    </label>
                    <input
                      type="date"
                      id="weddingDate"
                      name="weddingDate"
                      defaultValue={selectedInstance.wedding_date || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditInstanceModal(false);
                      setSelectedInstance(null);
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
    </div>
  );
};

export default InstanceManagement;
