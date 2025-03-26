import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';

// Supabase Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OneTimePaymentProps {
  onSuccess: (paymentId: string) => void;
}

const OneTimePayment: React.FC<OneTimePaymentProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(99);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'bank_transfer'>('credit_card');
  
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
      
      // Zahlungsabsicht erstellen
      const { data: intentData, error: intentError } = await supabase.functions.invoke('create-one-time-payment', {
        body: {
          userId: user.id,
          amount,
          description,
          paymentMethod
        }
      });
      
      if (intentError) throw intentError;
      
      if (!intentData || !intentData.paymentId) {
        throw new Error(t('payment.failedToCreatePayment'));
      }
      
      // Zahlung in Datenbank speichern
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount,
          description,
          payment_method: paymentMethod,
          status: 'pending',
          payment_id: intentData.paymentId
        }]);
        
      if (paymentError) throw paymentError;
      
      // Weiterleitung zur Zahlungsseite
      if (paymentMethod === 'credit_card') {
        window.location.href = intentData.redirectUrl;
      } else if (paymentMethod === 'paypal') {
        window.location.href = intentData.redirectUrl;
      } else {
        // Bei Banküberweisung direkt erfolgreich
        onSuccess(intentData.paymentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payment.unknownError'));
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {t('payment.oneTimePayment')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.amount')} (€)
          </label>
          <input
            type="number"
            id="amount"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.description')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payment.paymentMethod')}
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="credit_card"
                name="payment_method"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="credit_card" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('payment.creditCard')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="paypal"
                name="payment_method"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="paypal" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                PayPal
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="bank_transfer"
                name="payment_method"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="bank_transfer" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('payment.bankTransfer')}
              </label>
            </div>
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
            `${t('payment.pay')} ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)}`
          )}
        </button>
      </form>
    </div>
  );
};

export default OneTimePayment;
