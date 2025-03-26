import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';
import SubscriptionPlans from '../components/payment/SubscriptionPlans';
import OneTimePayment from '../components/payment/OneTimePayment';
import WhiteLabel from '../components/payment/WhiteLabel';

// Supabase Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PaymentPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'subscription' | 'one_time' | 'white_label'>('subscription');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setSuccessMessage(t('payment.subscriptionSuccess'));
    // Weiterleitung zum Dashboard nach kurzer Verzögerung
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };
  
  const handleOneTimeSuccess = (paymentId: string) => {
    setSuccessMessage(t('payment.oneTimeSuccess'));
    // Weiterleitung zum Dashboard nach kurzer Verzögerung
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };
  
  const handleWhiteLabelSuccess = (whitelabelId: string) => {
    setSuccessMessage(t('payment.whiteLabelSuccess'));
    // Weiterleitung zum Dashboard nach kurzer Verzögerung
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('payment.title')}</h1>
      
      {successMessage ? (
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-green-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">{t('payment.success')}</h2>
              <p className="text-green-700 dark:text-green-300 mt-1">{successMessage}</p>
              <p className="text-green-600 dark:text-green-400 mt-2">{t('payment.redirecting')}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'subscription'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('subscription')}
              >
                {t('payment.subscriptions')}
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'one_time'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('one_time')}
              >
                {t('payment.oneTimePayment')}
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'white_label'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('white_label')}
              >
                {t('payment.whiteLabel')}
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'subscription' && (
                <SubscriptionPlans onSubscriptionSuccess={handleSubscriptionSuccess} />
              )}
              
              {activeTab === 'one_time' && (
                <OneTimePayment onSuccess={handleOneTimeSuccess} />
              )}
              
              {activeTab === 'white_label' && (
                <WhiteLabel onSuccess={handleWhiteLabelSuccess} />
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('payment.faq')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('payment.faqQuestion1')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('payment.faqAnswer1')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('payment.faqQuestion2')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('payment.faqAnswer2')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('payment.faqQuestion3')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('payment.faqAnswer3')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('payment.faqQuestion4')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('payment.faqAnswer4')}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentPage;
