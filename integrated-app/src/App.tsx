import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './components/LanguageProvider';

// Dashboard Components
import AppLayout from './components/dashboard/AppLayout';
import MainDashboard from './components/dashboard/MainDashboard';
import GuestManagement from './components/dashboard/GuestManagement';
import TablePlanner from './components/dashboard/TablePlanner';
import BudgetTracker from './components/dashboard/BudgetTracker';
import TaskBoard from './components/dashboard/TaskBoard';
import SecuritySettings from './components/dashboard/SecuritySettings';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Guest Portal Components
import GuestPortal from './components/guest-area/GuestPortal';
import GuestInvitation from './components/guest-area/GuestInvitation';
import GuestRSVP from './components/guest-area/GuestRSVP';

// Public Pages
import LandingPage from './pages/LandingPage';
import FeatureDemo from './pages/FeatureDemo';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

// Admin Dashboard
import AdminDashboard from './pages/AdminDashboard';

// Theme and Styles
import './index.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check user preference for dark mode
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo" element={<FeatureDemo />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Guest Portal Routes */}
              <Route path="/guest/:accessCode" element={<GuestPortal />} />
              <Route path="/invitation/:accessCode" element={<GuestInvitation />} />
              <Route path="/rsvp/:accessCode" element={<GuestRSVP />} />
              
              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <MainDashboard />
                  </AppLayout>
                } 
              />
              <Route 
                path="/dashboard/guests" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <GuestManagement />
                  </AppLayout>
                } 
              />
              <Route 
                path="/dashboard/tables" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <TablePlanner />
                  </AppLayout>
                } 
              />
              <Route 
                path="/dashboard/budget" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <BudgetTracker />
                  </AppLayout>
                } 
              />
              <Route 
                path="/dashboard/tasks" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <TaskBoard />
                  </AppLayout>
                } 
              />
              <Route 
                path="/dashboard/settings" 
                element={
                  <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <SecuritySettings />
                  </AppLayout>
                } 
              />
              
              {/* Admin Dashboard */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
