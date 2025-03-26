# LemonWedding - Entwicklerdokumentation

## Inhaltsverzeichnis
1. [Einführung](#einführung)
2. [Entwicklungsumgebung](#entwicklungsumgebung)
3. [Projektstruktur](#projektstruktur)
4. [Architektur](#architektur)
5. [Frontend](#frontend)
6. [Backend](#backend)
7. [Datenbank](#datenbank)
8. [API-Referenz](#api-referenz)
9. [Authentifizierung](#authentifizierung)
10. [Internationalisierung](#internationalisierung)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Erweiterbarkeit](#erweiterbarkeit)
14. [Best Practices](#best-practices)
15. [Bekannte Probleme](#bekannte-probleme)

## Einführung

Diese Entwicklerdokumentation bietet einen umfassenden Überblick über die technischen Aspekte der LemonWedding-Anwendung. Sie richtet sich an Entwickler, die an der Wartung, Erweiterung oder Anpassung der Anwendung arbeiten.

LemonWedding ist eine umfassende Hochzeitsplanungs-App, die durch die Integration zweier bestehender Repositories (LemonWedding und HochzeitsappReally) entstanden ist. Die App basiert auf React mit TypeScript und Vite als Frontend und Supabase als Backend.

## Entwicklungsumgebung

### Voraussetzungen

- **Node.js**: Version 16.x oder höher
- **npm**: Version 8.x oder höher
- **Git**: Version 2.x oder höher
- **Supabase CLI**: Neueste Version
- **IDE**: Visual Studio Code (empfohlen)

### Einrichtung

1. **Repository klonen**:
   ```bash
   git clone https://github.com/LemonHarbor/LemonWedding-Integrated.git
   cd LemonWedding-Integrated
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**:
   Erstellen Sie eine `.env.local`-Datei basierend auf der `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   
   Konfigurieren Sie die folgenden Variablen:
   ```
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
   VITE_API_URL=http://localhost:3000
   VITE_ENVIRONMENT=development
   ```

4. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

5. **Supabase lokal starten** (optional):
   ```bash
   supabase start
   ```

### VS Code Erweiterungen

Die folgenden VS Code Erweiterungen werden empfohlen:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- vscode-styled-components
- i18n Ally

## Projektstruktur

```
LemonWedding-Integrated/
├── .github/                  # GitHub-Workflows und CI/CD-Konfiguration
├── public/                   # Statische Assets
│   ├── fonts/                # Schriftarten
│   ├── images/               # Bilder
│   ├── locales/              # Übersetzungsdateien
│   ├── manifest.json         # PWA-Manifest
│   └── service-worker.js     # Service Worker für PWA
├── src/                      # Quellcode
│   ├── components/           # React-Komponenten
│   │   ├── admin/            # Admin-Dashboard-Komponenten
│   │   ├── dashboard/        # Dashboard-Komponenten
│   │   ├── guest-area/       # Gästeportal-Komponenten
│   │   ├── payment/          # Zahlungskomponenten
│   │   └── ui/               # UI-Komponenten
│   ├── context/              # React Context Provider
│   ├── hooks/                # Benutzerdefinierte React Hooks
│   ├── pages/                # Seitenkomponenten
│   ├── services/             # Dienste für API-Aufrufe
│   ├── styles/               # Globale Stile
│   ├── types/                # TypeScript-Typdefinitionen
│   ├── utils/                # Hilfsfunktionen
│   ├── App.tsx               # Hauptanwendungskomponente
│   ├── i18n.ts               # Internationalisierungskonfiguration
│   ├── main.tsx              # Einstiegspunkt der Anwendung
│   └── vite-env.d.ts         # Vite-Umgebungstypdeklarationen
├── supabase/                 # Supabase-Konfiguration
│   ├── functions/            # Edge-Funktionen
│   ├── migrations/           # Datenbankmigrationen
│   └── seed.sql              # Seed-Daten
├── tests/                    # Tests
│   ├── e2e/                  # End-to-End-Tests
│   ├── features/             # Feature-Tests
│   ├── integration/          # Integrationstests
│   └── ui/                   # UI-Komponententests
├── .env.example              # Beispiel für Umgebungsvariablen
├── .eslintrc.js              # ESLint-Konfiguration
├── .gitignore                # Git-Ignore-Datei
├── .prettierrc               # Prettier-Konfiguration
├── index.html                # HTML-Einstiegspunkt
├── package.json              # NPM-Paketdefinition
├── postcss.config.js         # PostCSS-Konfiguration
├── tailwind.config.js        # Tailwind CSS-Konfiguration
├── tsconfig.json             # TypeScript-Konfiguration
└── vite.config.ts            # Vite-Konfiguration
```

## Architektur

LemonWedding folgt einer modernen Frontend-Architektur mit React und TypeScript, während Supabase als Backend-as-a-Service (BaaS) verwendet wird.

### Architekturübersicht

```
+----------------------------------+
|           Client                 |
|  +----------------------------+  |
|  |        React App           |  |
|  |  +---------------------+   |  |
|  |  |     Components      |   |  |
|  |  +---------------------+   |  |
|  |  |       Hooks         |   |  |
|  |  +---------------------+   |  |
|  |  |      Contexts       |   |  |
|  |  +---------------------+   |  |
|  |  |       Pages         |   |  |
|  |  +---------------------+   |  |
|  +----------------------------+  |
+----------------------------------+
              |
              | HTTP/WebSocket
              |
+----------------------------------+
|           Supabase               |
|  +----------------------------+  |
|  |     Authentication        |   |
|  +----------------------------+  |
|  |      Database (Postgres)  |   |
|  +----------------------------+  |
|  |      Storage              |   |
|  +----------------------------+  |
|  |      Realtime             |   |
|  +----------------------------+  |
|  |      Edge Functions       |   |
|  +----------------------------+  |
+----------------------------------+
              |
              | API Calls
              |
+----------------------------------+
|        External Services         |
|  +----------------------------+  |
|  |        Stripe              |  |
|  +----------------------------+  |
|  |        Email Service       |  |
|  +----------------------------+  |
+----------------------------------+
```

### Designprinzipien

- **Komponenten-basierte Architektur**: Die Anwendung ist in wiederverwendbare Komponenten aufgeteilt.
- **Zustandsverwaltung**: Verwendung von React Context und Hooks für die Zustandsverwaltung.
- **Typsicherheit**: Strikte TypeScript-Typisierung für alle Komponenten und Funktionen.
- **Responsive Design**: Mobile-First-Ansatz mit Tailwind CSS.
- **Internationalisierung**: Mehrsprachige Unterstützung mit i18next.
- **Barrierefreiheit**: WCAG 2.1-konforme Komponenten.
- **Progressive Web App**: Offline-Unterstützung und Installation auf Geräten.

## Frontend

### Technologie-Stack

- **React 18**: Für die Benutzeroberfläche
- **TypeScript**: Für Typsicherheit
- **Vite**: Als Build-Tool
- **Tailwind CSS**: Für Styling
- **React Router**: Für das Routing
- **i18next**: Für Internationalisierung
- **React Query**: Für Datenabruf und -caching
- **Zustand**: Für globale Zustandsverwaltung
- **React Hook Form**: Für Formularverwaltung
- **Zod**: Für Schemavalidierung

### Komponenten

Die Komponenten sind in folgende Kategorien unterteilt:

#### UI-Komponenten

Grundlegende UI-Elemente, die in der gesamten Anwendung wiederverwendet werden:
- `Button`: Schaltflächen in verschiedenen Varianten
- `Input`: Eingabefelder
- `Select`: Auswahlfelder
- `Modal`: Modale Dialoge
- `Card`: Kartenkomponente
- `ThemeToggle`: Umschalter für das Theme
- `Navigation`: Navigationskomponente
- `AccessibilityControls`: Barrierefreiheitssteuerungen

#### Dashboard-Komponenten

Komponenten für das Benutzer-Dashboard:
- `GuestManagementIntegrated`: Gästemanagement
- `EnhancedTablePlanner`: Tischplanung
- `BudgetTrackerEnhanced`: Budget-Tracker
- `TaskBoardEnhanced`: Aufgabenverwaltung
- `Dashboard`: Hauptdashboard-Komponente

#### Gästeportal-Komponenten

Komponenten für das Gästeportal:
- `GuestPortal`: Hauptportal-Komponente
- `GuestInvitation`: Einladungskomponente
- `GuestRSVP`: RSVP-Komponente

#### Admin-Komponenten

Komponenten für das Admin-Dashboard:
- `UserManagement`: Benutzerverwaltung
- `InstanceManagement`: Instanzverwaltung
- `SubscriptionPlans`: Abonnementverwaltung
- `Analytics`: Analytik-Komponente

#### Zahlungskomponenten

Komponenten für Zahlungen und Abonnements:
- `SubscriptionPlans`: Abonnementpläne
- `OneTimePayment`: Einmalzahlungen
- `WhiteLabel`: White-Label-Konfiguration
- `PaymentPage`: Zahlungsseite

### Hooks

Benutzerdefinierte React Hooks für wiederverwendbare Logik:

- `useAuth`: Authentifizierung und Benutzerrollen
- `useTheme`: Theme-Verwaltung (hell/dunkel)
- `useResponsive`: Responsive Design-Hilfsfunktionen
- `useGuests`: Gästemanagement
- `useTables`: Tischplanung
- `useBudget`: Budget-Tracking
- `useTasks`: Aufgabenverwaltung
- `useRealtime`: Echtzeit-Updates
- `useSubscription`: Abonnementverwaltung

### Context Provider

React Context Provider für globalen Zustand:

- `AuthContext`: Authentifizierung und Benutzerrollen
- `ThemeContext`: Theme-Verwaltung
- `LanguageContext`: Spracheinstellungen
- `NotificationContext`: Benachrichtigungen
- `SettingsContext`: Benutzereinstellungen

### Routing

Das Routing wird mit React Router implementiert:

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GuestManagement from './pages/GuestManagement';
import TablePlanner from './pages/TablePlanner';
import Budget from './pages/Budget';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import GuestPortal from './pages/GuestPortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Routes>
              {/* Öffentliche Routen */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/guest-portal/:code" element={<GuestPortal />} />
              
              {/* Geschützte Routen */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/guests" element={<GuestManagement />} />
                <Route path="/tables" element={<TablePlanner />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Admin-Routen */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              
              {/* 404-Seite */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Backend

LemonWedding verwendet Supabase als Backend-as-a-Service (BaaS), das folgende Dienste bietet:

- **Authentifizierung**: Benutzerauthentifizierung und -autorisierung
- **Datenbank**: PostgreSQL-Datenbank
- **Speicher**: Dateispeicher für Bilder und Dokumente
- **Realtime**: Echtzeit-Updates über WebSockets
- **Edge Functions**: Serverlose Funktionen für benutzerdefinierte Logik

### Supabase-Client

Der Supabase-Client wird wie folgt initialisiert:

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Edge Functions

Edge Functions werden für serverseitige Logik verwendet, die nicht direkt in der Datenbank ausgeführt werden kann:

```typescript
// supabase/functions/create-stripe-checkout/index.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import Stripe from 'https://esm.sh/stripe@10.13.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-08-01',
});

serve(async (req) => {
  const { planId, userId, returnUrl } = await req.json();
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Benutzer abrufen
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  
  // Plan abrufen
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();
  
  if (planError) {
    return new Response(JSON.stringify({ error: 'Plan not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  
  // Stripe Checkout Session erstellen
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: plan.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
      planId,
    },
  });
  
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

## Datenbank

Die Datenbank basiert auf PostgreSQL und wird über Supabase verwaltet.

### Datenbankschema

Das Datenbankschema ist in SQL-Migrationen definiert:

```sql
-- supabase/migrations/20230101000000_initial_schema.sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE weddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending',
  dietary_restrictions TEXT,
  plus_one BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Weitere Tabellen...
```

### Row-Level Security (RLS)

Row-Level Security (RLS) wird verwendet, um den Datenzugriff zu beschränken:

```sql
-- supabase/migrations/20230101000001_security_policies.sql
-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Weddings RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weddings"
  ON weddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weddings"
  ON weddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weddings"
  ON weddings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weddings"
  ON weddings FOR DELETE
  USING (auth.uid() = user_id);

-- Weitere Policies...
```

### Realtime

Realtime wird für Echtzeit-Updates aktiviert:

```sql
-- supabase/migrations/20230101000002_realtime.sql
BEGIN;
  -- Enable realtime for tables
  ALTER PUBLICATION supabase_realtime ADD TABLE guests;
  ALTER PUBLICATION supabase_realtime ADD TABLE tables;
  ALTER PUBLICATION supabase_realtime ADD TABLE seatings;
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE budget_categories;
  ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
COMMIT;
```

### TypeScript-Typen generieren

Die TypeScript-Typen für die Datenbank werden mit der Supabase CLI generiert:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

## API-Referenz

### Supabase API

Die Supabase API wird über den Supabase-Client aufgerufen:

#### Authentifizierung

```typescript
// Registrierung
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'password',
});

// Anmeldung
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'password',
});

// Abmeldung
const { error } = await supabase.auth.signOut();

// Aktuellen Benutzer abrufen
const { data: { user } } = await supabase.auth.getUser();
```

#### Datenoperationen

```typescript
// Daten abrufen
const { data, error } = await supabase
  .from('guests')
  .select('*')
  .eq('wedding_id', weddingId);

// Daten einfügen
const { data, error } = await supabase
  .from('guests')
  .insert({
    wedding_id: weddingId,
    name: 'Max Mustermann',
    email: 'max@example.com',
    status: 'pending',
  });

// Daten aktualisieren
const { data, error } = await supabase
  .from('guests')
  .update({ status: 'confirmed' })
  .eq('id', guestId);

// Daten löschen
const { error } = await supabase
  .from('guests')
  .delete()
  .eq('id', guestId);
```

#### Speicheroperationen

```typescript
// Datei hochladen
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}.jpg`, file);

// Öffentliche URL abrufen
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}.jpg`);

// Datei löschen
const { error } = await supabase.storage
  .from('avatars')
  .remove([`${userId}.jpg`]);
```

#### Realtime-Abonnements

```typescript
// Realtime-Abonnement erstellen
const subscription = supabase
  .channel('guests')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'guests',
      filter: `wedding_id=eq.${weddingId}`,
    },
    (payload) => {
      console.log('Change received!', payload);
      // Aktualisiere den Zustand basierend auf dem Payload
    }
  )
  .subscribe();

// Abonnement beenden
subscription.unsubscribe();
```

### Edge Functions aufrufen

```typescript
// Edge Function aufrufen
const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
  body: {
    planId: 'plan_basic',
    userId: user.id,
    returnUrl: window.location.origin + '/dashboard',
  },
});

if (data?.url) {
  window.location.href = data.url;
}
```

## Authentifizierung

Die Authentifizierung wird über Supabase Auth verwaltet und um ein rollenbasiertes Berechtigungssystem erweitert.

### AuthContext

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

type Role = 'admin' | 'customer' | 'guest';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aktuellen Benutzer abrufen
    const getUser = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Benutzerrolle abrufen
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setRole(userRoles?.role || 'customer');
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Auf Authentifizierungsänderungen hören
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Benutzerrolle abrufen
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          setRole(userRoles?.role || 'customer');
        } else {
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Geschützte Routen

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  role?: 'admin' | 'customer' | 'guest';
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, role: userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

## Internationalisierung

Die Internationalisierung wird mit i18next implementiert.

### i18n-Konfiguration

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'fr', 'es'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Übersetzungsdateien

```json
// public/locales/de/common.json
{
  "app": {
    "name": "LemonWedding"
  },
  "navigation": {
    "home": "Startseite",
    "dashboard": "Dashboard",
    "guests": "Gäste",
    "tables": "Tischplan",
    "budget": "Budget",
    "tasks": "Aufgaben",
    "settings": "Einstellungen"
  },
  "auth": {
    "login": "Anmelden",
    "register": "Registrieren",
    "logout": "Abmelden",
    "email": "E-Mail",
    "password": "Passwort",
    "forgotPassword": "Passwort vergessen?"
  },
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "add": "Hinzufügen",
    "search": "Suchen",
    "filter": "Filtern",
    "loading": "Wird geladen...",
    "error": "Ein Fehler ist aufgetreten",
    "success": "Erfolgreich"
  }
}
```

### Verwendung in Komponenten

```typescript
// src/components/ui/Navigation.tsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navigation() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {t('app.name')}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('navigation.home')}
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    to="/guests"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {t('navigation.guests')}
                  </Link>
                  <Link
                    to="/tables"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {t('navigation.tables')}
                  </Link>
                  <Link
                    to="/budget"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {t('navigation.budget')}
                  </Link>
                  <Link
                    to="/tasks"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {t('navigation.tasks')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <button
                onClick={signOut}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                {t('auth.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  to="/register"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Testing

Die Anwendung verwendet Jest und React Testing Library für Tests.

### Komponententests

```typescript
// src/tests/ui/UIComponents.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Navigation from '../../components/ui/Navigation';
import AccessibilityControls from '../../components/ui/AccessibilityControls';

// Mock für useTheme Hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  }),
}));

// Mock für useResponsive Hook
jest.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    prefersReducedMotion: false,
    getResponsiveValue: jest.fn(),
    getResponsiveClasses: jest.fn(),
  }),
}));

describe('UI Components Tests', () => {
  // ThemeToggle Tests
  describe('ThemeToggle Component', () => {
    test('renders without crashing', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <ThemeToggle />
        </I18nextProvider>
      );
      
      expect(screen.getByText(/lightMode|darkMode|systemTheme/i)).toBeInTheDocument();
    });
  });
  
  // Navigation Tests
  describe('Navigation Component', () => {
    test('renders navigation links', () => {
      render(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Navigation />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/features/i)).toBeInTheDocument();
      expect(screen.getByText(/pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/contact/i)).toBeInTheDocument();
    });
  });
  
  // AccessibilityControls Tests
  describe('AccessibilityControls Component', () => {
    test('renders accessibility button', () => {
      render(
        <I18nextProvider i18n={i18n}>
          <AccessibilityControls />
        </I18nextProvider>
      );
      
      expect(screen.getByLabelText(/toggleMenu/i)).toBeInTheDocument();
    });
  });
});
```

### Integrationstests

```typescript
// src/tests/integration/Integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import PWASetup from '../../components/ui/PWASetup';

// Mock für Helmet
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));

// Mock für useTheme Hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    resolvedTheme: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  })),
}));

// Mock für useResponsive Hook
jest.mock('../../hooks/useResponsive', () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isSmallMobile: false,
    isLandscape: true,
    isPortrait: false,
    hasTouchScreen: false,
    prefersReducedMotion: false,
    getResponsiveValue: jest.fn((options) => options.default),
    getResponsiveClasses: jest.fn((base, responsive) => base),
  })),
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  ResponsiveGrid: ({ children }) => <div data-testid="responsive-grid">{children}</div>,
  ResponsiveText: ({ children }) => <div data-testid="responsive-text">{children}</div>,
}));

describe('Integration Tests', () => {
  // Theme Integration Tests
  describe('Theme Integration', () => {
    test('useTheme hook returns expected values', () => {
      const Component = () => {
        const theme = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme.theme}</div>
            <div data-testid="resolved-theme">{theme.resolvedTheme}</div>
            <button data-testid="toggle-theme" onClick={theme.toggleTheme}>Toggle</button>
          </div>
        );
      };
      
      render(<Component />);
      
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });
  });
  
  // Responsive Integration Tests
  describe('Responsive Integration', () => {
    test('useResponsive hook returns expected values', () => {
      const Component = () => {
        const responsive = useResponsive();
        return (
          <div>
            <div data-testid="is-mobile">{responsive.isMobile ? 'true' : 'false'}</div>
            <div data-testid="is-desktop">{responsive.isDesktop ? 'true' : 'false'}</div>
          </div>
        );
      };
      
      render(<Component />);
      
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    });
  });
});
```

### End-to-End-Tests

```typescript
// src/tests/e2e/EndToEnd.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { ErrorBoundary } from '../../utils/ErrorHandling';

// Test-Komponente, die einen Fehler auslöst
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Komponente funktioniert korrekt</div>;
};

// Test-Suite für End-to-End Tests
describe('End-to-End Tests', () => {
  // Test für Fehlerbehandlung
  test('ErrorBoundary fängt Fehler ab und zeigt Fallback-UI', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    expect(screen.getByText(/Ein Fehler ist aufgetreten/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Erneut versuchen/i })).toBeInTheDocument();
  });
  
  // Test für erfolgreiche Komponenten-Darstellung
  test('Komponente wird korrekt dargestellt, wenn kein Fehler auftritt', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Komponente funktioniert korrekt/i)).toBeInTheDocument();
  });
});
```

### Tests ausführen

```bash
# Alle Tests ausführen
npm run test

# Tests mit Watch-Modus ausführen
npm run test:watch

# Testabdeckung generieren
npm run test:coverage
```

## Deployment

### Vite-Konfiguration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LemonWedding',
        short_name: 'LemonWedding',
        description: 'Hochzeitsplanungs-App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### CI/CD-Konfiguration

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v2
        with:
          name: build
          path: dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment-Strategie

Die Anwendung wird mit einer Continuous Deployment-Strategie bereitgestellt:

1. **Development**: Automatisches Deployment bei jedem Push auf den `develop`-Branch.
2. **Staging**: Automatisches Deployment bei jedem Pull Request auf den `main`-Branch.
3. **Production**: Automatisches Deployment bei jedem Push auf den `main`-Branch.

### Umgebungskonfiguration

Die Umgebungskonfiguration erfolgt über Umgebungsvariablen:

```
# .env.development
VITE_SUPABASE_URL=https://your-dev-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-supabase-anon-key
VITE_STRIPE_PUBLIC_KEY=your-dev-stripe-public-key
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=development

# .env.production
VITE_SUPABASE_URL=https://your-prod-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-supabase-anon-key
VITE_STRIPE_PUBLIC_KEY=your-prod-stripe-public-key
VITE_API_URL=https://your-api-url.com
VITE_ENVIRONMENT=production
```

## Erweiterbarkeit

Die Anwendung ist so konzipiert, dass sie leicht erweitert werden kann.

### Neue Komponenten hinzufügen

1. Erstellen Sie eine neue Komponente im entsprechenden Verzeichnis:
   ```typescript
   // src/components/ui/NewComponent.tsx
   import React from 'react';
   
   interface NewComponentProps {
     title: string;
     children: React.ReactNode;
   }
   
   export default function NewComponent({ title, children }: NewComponentProps) {
     return (
       <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
         <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h2>
         <div className="mt-2">{children}</div>
       </div>
     );
   }
   ```

2. Exportieren Sie die Komponente in der entsprechenden `index.ts`-Datei:
   ```typescript
   // src/components/ui/index.ts
   export { default as Button } from './Button';
   export { default as Input } from './Input';
   export { default as NewComponent } from './NewComponent';
   ```

3. Verwenden Sie die Komponente in anderen Teilen der Anwendung:
   ```typescript
   import { NewComponent } from '../components/ui';
   
   function SomePage() {
     return (
       <div>
         <NewComponent title="Meine neue Komponente">
           <p>Inhalt der Komponente</p>
         </NewComponent>
       </div>
     );
   }
   ```

### Neue Seiten hinzufügen

1. Erstellen Sie eine neue Seite im `pages`-Verzeichnis:
   ```typescript
   // src/pages/NewPage.tsx
   import React from 'react';
   import { useTranslation } from 'react-i18next';
   import { Layout } from '../components/ui';
   
   export default function NewPage() {
     const { t } = useTranslation();
     
     return (
       <Layout title={t('newPage.title')}>
         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
           <div className="px-4 py-6 sm:px-0">
             <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
               {t('newPage.heading')}
             </h1>
             <p className="mt-4 text-gray-600 dark:text-gray-300">
               {t('newPage.description')}
             </p>
           </div>
         </div>
       </Layout>
     );
   }
   ```

2. Fügen Sie die Seite zur Routing-Konfiguration hinzu:
   ```typescript
   // src/App.tsx
   import NewPage from './pages/NewPage';
   
   function App() {
     return (
       <BrowserRouter>
         <AuthProvider>
           <ThemeProvider>
             <LanguageProvider>
               <Routes>
                 {/* Bestehende Routen */}
                 
                 {/* Neue Route */}
                 <Route path="/new-page" element={<NewPage />} />
               </Routes>
             </LanguageProvider>
           </ThemeProvider>
         </AuthProvider>
       </BrowserRouter>
     );
   }
   ```

3. Fügen Sie Übersetzungen für die neue Seite hinzu:
   ```json
   // public/locales/de/common.json
   {
     "newPage": {
       "title": "Neue Seite",
       "heading": "Willkommen auf der neuen Seite",
       "description": "Dies ist eine Beschreibung der neuen Seite."
     }
   }
   ```

### Neue API-Endpunkte hinzufügen

1. Erstellen Sie eine neue Edge-Funktion:
   ```typescript
   // supabase/functions/new-function/index.ts
   import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
   
   const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
   const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
   
   serve(async (req) => {
     const { param1, param2 } = await req.json();
     
     const supabase = createClient(supabaseUrl, supabaseAnonKey);
     
     // Implementieren Sie Ihre Logik hier
     
     return new Response(JSON.stringify({ result: 'success' }), {
       headers: { 'Content-Type': 'application/json' },
       status: 200,
     });
   });
   ```

2. Stellen Sie die Edge-Funktion bereit:
   ```bash
   supabase functions deploy new-function
   ```

3. Rufen Sie die Edge-Funktion auf:
   ```typescript
   // src/services/api.ts
   import { supabase } from './supabase';
   
   export async function callNewFunction(param1: string, param2: number) {
     const { data, error } = await supabase.functions.invoke('new-function', {
       body: { param1, param2 },
     });
     
     if (error) {
       throw new Error(error.message);
     }
     
     return data;
   }
   ```

## Best Practices

### Codequalität

- **ESLint und Prettier**: Verwenden Sie ESLint und Prettier, um konsistenten Code zu gewährleisten.
- **TypeScript**: Verwenden Sie strikte TypeScript-Typisierung für alle Komponenten und Funktionen.
- **Kommentare**: Dokumentieren Sie komplexe Logik und Funktionen.
- **Tests**: Schreiben Sie Tests für alle Komponenten und Funktionen.

### Performance

- **Memoization**: Verwenden Sie `useMemo` und `useCallback` für rechenintensive Operationen.
- **Code-Splitting**: Verwenden Sie dynamische Importe für große Komponenten.
- **Lazy Loading**: Laden Sie Komponenten und Ressourcen bei Bedarf.
- **Bildoptimierung**: Optimieren Sie Bilder für das Web.

### Sicherheit

- **Eingabevalidierung**: Validieren Sie alle Benutzereingaben.
- **XSS-Schutz**: Vermeiden Sie die direkte Einfügung von Benutzereingaben in den DOM.
- **CSRF-Schutz**: Verwenden Sie CSRF-Token für Formulare.
- **Authentifizierung**: Verwenden Sie sichere Authentifizierungsmethoden.

### Barrierefreiheit

- **Semantisches HTML**: Verwenden Sie semantische HTML-Elemente.
- **ARIA-Attribute**: Fügen Sie ARIA-Attribute hinzu, wo nötig.
- **Tastaturnavigation**: Stellen Sie sicher, dass alle Funktionen mit der Tastatur zugänglich sind.
- **Farbkontrast**: Stellen Sie sicher, dass der Farbkontrast den WCAG-Richtlinien entspricht.

## Bekannte Probleme

### Aktuelle Probleme

1. **IE11-Unterstützung**: Die Anwendung unterstützt Internet Explorer 11 nicht vollständig.
2. **Safari-Kompatibilität**: Einige CSS-Funktionen funktionieren in Safari nicht wie erwartet.
3. **Leistungsprobleme bei großen Gästelisten**: Bei mehr als 500 Gästen kann die Tischplanung langsam werden.

### Workarounds

1. **IE11-Unterstützung**: Verwenden Sie einen modernen Browser wie Chrome, Firefox oder Edge.
2. **Safari-Kompatibilität**: Verwenden Sie Polyfills für nicht unterstützte CSS-Funktionen.
3. **Leistungsprobleme bei großen Gästelisten**: Teilen Sie die Gästeliste in kleinere Gruppen auf.
