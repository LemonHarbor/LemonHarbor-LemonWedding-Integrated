import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';

// Supabase Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WhiteLabelProps {
  onSuccess: (whitelabelId: string) => void;
}

const WhiteLabel: React.FC<WhiteLabelProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [customDomain, setCustomDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      // Benutzer-ID abrufen
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        throw new Error(t('payment.notLoggedIn'));
      }
      
      // Logo hochladen, falls vorhanden
      let logoUrl = null;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('white-label-logos')
          .upload(fileName, logo);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('white-label-logos')
          .getPublicUrl(fileName);
          
        logoUrl = urlData.publicUrl;
      }
      
      // White-Label-Konfiguration speichern
      const { data: whitelabelData, error: whitelabelError } = await supabase
        .from('white_label_configs')
        .insert([{
          user_id: user.id,
          company_name: companyName,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          custom_domain: customDomain,
          contact_email: contactEmail,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (whitelabelError) throw whitelabelError;
      
      // Zahlungsabsicht erstellen
      const { data: intentData, error: intentError } = await supabase.functions.invoke('create-white-label-payment', {
        body: {
          userId: user.id,
          whitelabelId: whitelabelData.id
        }
      });
      
      if (intentError) throw intentError;
      
      if (!intentData || !intentData.paymentUrl) {
        throw new Error(t('payment.failedToCreatePayment'));
      }
      
      // Weiterleitung zur Zahlungsseite
      window.location.href = intentData.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payment.unknownError'));
      setLoading(false);
    }
  };
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogo(event.target.files[0]);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {t('payment.whiteLabelOption')}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t('payment.whiteLabelDescription')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.companyName')} *
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.companyLogo')}
          </label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('payment.logoHint')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('payment.primaryColor')} *
            </label>
            <div className="flex">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                required
                className="h-10 w-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="ml-2 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('payment.secondaryColor')} *
            </label>
            <div className="flex">
              <input
                type="color"
                id="secondaryColor"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                required
                className="h-10 w-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="ml-2 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.customDomain')}
          </label>
          <input
            type="text"
            id="customDomain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="hochzeit.ihrefirma.de"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('payment.domainHint')}
          </p>
        </div>
        
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.contactEmail')} *
          </label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('payment.whiteLabelPricing')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t('payment.whiteLabelPricingDescription')}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">{t('payment.setupFee')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(499)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-700 dark:text-gray-300">{t('payment.monthlyFee')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(99)}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('payment.processing')}
            </span>
          ) : (
            t('payment.orderWhiteLabel')
          )}
        </button>
      </form>
    </div>
  );
};

export default WhiteLabel;
