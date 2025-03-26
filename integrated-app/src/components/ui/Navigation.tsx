import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import ThemeToggle from './ThemeToggle';
import AccessibilityControls from './AccessibilityControls';

// Optimierte Navigation für Desktop und Mobile
const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Navigation-Links
  const navLinks = [
    { path: '/', label: t('nav.home'), icon: 'home' },
    { path: '/features', label: t('nav.features'), icon: 'features' },
    { path: '/pricing', label: t('nav.pricing'), icon: 'pricing' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
    { path: '/contact', label: t('nav.contact'), icon: 'contact' },
  ];
  
  // Prüfen, ob ein Link aktiv ist
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  // Icon-Komponente
  const Icon = ({ name }: { name: string }) => {
    switch (name) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'features':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        );
      case 'pricing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        );
      case 'contact':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Mobile-Menü-Toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Desktop-Navigation
  const DesktopNavigation = () => (
    <nav className="hidden md:flex items-center space-x-4">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive(link.path)
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          aria-current={isActive(link.path) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
  
  // Mobile-Navigation
  const MobileNavigation = () => (
    <div className="md:hidden">
      <button
        onClick={toggleMobileMenu}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={mobileMenuOpen}
      >
        <span className="sr-only">{mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}</span>
        {mobileMenuOpen ? (
          <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        ) : (
          <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        )}
      </button>
      
      {mobileMenuOpen && (
        <div className="absolute top-16 inset-x-0 z-10 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <div className="pt-5 pb-6 px-5 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center p-3 rounded-md ${
                      isActive(link.path)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name={link.icon} />
                    <span className="ml-3">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-4 pb-6 px-5">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <AccessibilityControls />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="block h-8 w-auto"
                src="/logo.svg"
                alt="LemonWedding"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">LemonWedding</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <DesktopNavigation />
            
            <div className="hidden md:flex items-center ml-4 space-x-4">
              <ThemeToggle />
              <AccessibilityControls />
            </div>
            
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
