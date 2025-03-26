import React from 'react';
import { Helmet } from 'react-helmet-async';

// PWA Manifest und Service Worker Konfiguration
const PWASetup: React.FC = () => {
  return (
    <Helmet>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="LemonWedding" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <script>{`
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
              .then(registration => {
                console.log('SW registered: ', registration);
              })
              .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
              });
          });
        }
      `}</script>
    </Helmet>
  );
};

export default PWASetup;
