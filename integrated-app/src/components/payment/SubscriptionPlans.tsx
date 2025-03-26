import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@supabase/supabase-js';

// Stripe Promise initialisieren
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Supabase Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typen und Interfaces
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

interface PaymentFormProps {
  plan: Plan;
  onSuccess: (subscriptionId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
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
      const { data: intentData, error: intentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          planId: plan.id,
          userId: user.id,
          billingCycle: plan.billing_cycle
        }
      });
      
      if (intentError) throw intentError;
      
      if (!intentData || !intentData.clientSecret) {
        throw new Error(t('payment.failedToCreateIntent'));
      }
      
      // Zahlung bestätigen
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error(t('payment.cardElementNotFound'));
      }
      
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        }
      );
      
      if (paymentError) {
        throw paymentError;
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Abonnement in Datenbank speichern
        const startDate = new Date().toISOString();
        const endDate = new Date();
        
        if (plan.billing_cycle === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: user.id,
            plan_id: plan.id,
            status: 'active',
            start_date: startDate,
            end_date: endDate.toISOString(),
            payment_intent_id: paymentIntent.id
          }])
          .select()
          .single();
          
        if (subscriptionError) throw subscriptionError;
        
        onSuccess(subscription.id);
      } else {
        throw new Error(t('payment.paymentFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payment.unknownError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('payment.cardDetails')}
        </label>
        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('payment.processing')}
            </span>
          ) : (
            `${t('payment.pay')} ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(plan.price)}`
          )}
        </button>
      </div>
    </form>
  );
};

interface SubscriptionPlansProps {
  onSubscriptionSuccess: (subscriptionId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSubscriptionSuccess }) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Pläne laden
  React.useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
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
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-l-4 border-red-500 rounded">
        {error}
      </div>
    );
  }
  
  if (plans.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500 rounded">
        {t('payment.noPlansAvailable')}
      </div>
    );
  }
  
  if (selectedPlan) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('payment.subscribeToX', { plan: selectedPlan.name })}
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">{t('payment.plan')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">{t('payment.price')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedPlan.price)}
              {' / '}
              {selectedPlan.billing_cycle === 'monthly' ? t('admin.month') : t('admin.year')}
            </span>
          </div>
        </div>
        
        <Elements stripe={stripePromise}>
          <PaymentForm 
            plan={selectedPlan} 
            onSuccess={onSubscriptionSuccess}
            onCancel={() => setSelectedPlan(null)}
          />
        </Elements>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('payment.choosePlan')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
              
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
              <ul className="space-y-2 mb-6">
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
              
              <button
                onClick={() => setSelectedPlan(plan)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('payment.subscribe')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
