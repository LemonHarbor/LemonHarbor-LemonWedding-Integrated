import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js Registrierung
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  created_at: string;
}

interface AnalyticsProps {
  users: User[];
  instances: WeddingInstance[];
  subscriptions: Subscription[];
}

const Analytics: React.FC<AnalyticsProps> = ({ users, instances, subscriptions }) => {
  const { t } = useTranslation();
  
  // Benutzerstatistiken
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const customerUsers = users.filter(user => user.role === 'customer').length;
  
  // Instanzstatistiken
  const totalInstances = instances.length;
  const activeInstances = instances.filter(instance => instance.status === 'active').length;
  const inactiveInstances = instances.filter(instance => instance.status === 'inactive').length;
  const pendingInstances = instances.filter(instance => instance.status === 'pending').length;
  
  // Abonnementstatistiken
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(subscription => subscription.status === 'active').length;
  const canceledSubscriptions = subscriptions.filter(subscription => subscription.status === 'canceled').length;
  const expiredSubscriptions = subscriptions.filter(subscription => subscription.status === 'expired').length;
  
  // Benutzer pro Monat (letzte 6 Monate)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date;
  }).reverse();
  
  const usersPerMonth = last6Months.map(month => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= startOfMonth && createdAt <= endOfMonth;
    }).length;
  });
  
  const monthLabels = last6Months.map(month => 
    month.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })
  );
  
  // Instanzen pro Status
  const instanceStatusData = {
    labels: [t('admin.active'), t('admin.inactive'), t('admin.pending')],
    datasets: [
      {
        data: [activeInstances, inactiveInstances, pendingInstances],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };
  
  // Abonnements pro Status
  const subscriptionStatusData = {
    labels: [t('admin.active'), t('admin.canceled'), t('admin.expired')],
    datasets: [
      {
        data: [activeSubscriptions, canceledSubscriptions, expiredSubscriptions],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
        borderWidth: 0,
      },
    ],
  };
  
  // Benutzer pro Monat Chart
  const usersPerMonthData = {
    labels: monthLabels,
    datasets: [
      {
        label: t('admin.newUsers'),
        data: usersPerMonth,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart-Optionen
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  return (
    <div>
      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.totalUsers')}</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
            <div className="ml-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                {t('admin.admins')}: {adminUsers}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {t('admin.customers')}: {customerUsers}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.totalInstances')}</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalInstances}</div>
            <div className="ml-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {t('admin.active')}: {activeInstances}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                {t('admin.inactive')}: {inactiveInstances}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                {t('admin.pending')}: {pendingInstances}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.totalSubscriptions')}</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalSubscriptions}</div>
            <div className="ml-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {t('admin.active')}: {activeSubscriptions}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                {t('admin.canceled')}: {canceledSubscriptions}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                {t('admin.expired')}: {expiredSubscriptions}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('admin.newUsersOverTime')}</h3>
          <div className="h-64">
            <Bar data={usersPerMonthData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('admin.instancesByStatus')}</h3>
          <div className="h-64 flex justify-center">
            <div className="w-64">
              <Pie data={instanceStatusData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('admin.subscriptionsByStatus')}</h3>
          <div className="h-64 flex justify-center">
            <div className="w-64">
              <Pie data={subscriptionStatusData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('admin.keyMetrics')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.instancesPerUser')}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(totalInstances / (customerUsers || 1)).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((totalInstances / (customerUsers || 1)) / 5 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.subscriptionRate')}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {((activeSubscriptions / (customerUsers || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((activeSubscriptions / (customerUsers || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.activeInstanceRate')}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {((activeInstances / (totalInstances || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((activeInstances / (totalInstances || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.churnRate')}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {((canceledSubscriptions / (totalSubscriptions || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((canceledSubscriptions / (totalSubscriptions || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
