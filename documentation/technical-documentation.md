# LemonWedding - Integrierte Hochzeitsplanungs-App

## Technische Dokumentation

### Inhaltsverzeichnis
1. [Einführung](#einführung)
2. [Systemarchitektur](#systemarchitektur)
3. [Datenbankstruktur](#datenbankstruktur)
4. [Kernfunktionen](#kernfunktionen)
5. [Erweiterte Funktionen](#erweiterte-funktionen)
6. [Admin-Dashboard](#admin-dashboard)
7. [Monetarisierungsstrategie](#monetarisierungsstrategie)
8. [UI/UX-Optimierung](#uiux-optimierung)
9. [Fehlerbehandlung](#fehlerbehandlung)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Wartung und Support](#wartung-und-support)

## Einführung

LemonWedding ist eine umfassende Hochzeitsplanungs-App, die durch die Integration zweier bestehender Repositories (LemonWedding und HochzeitsappReally) entstanden ist. Die App bietet eine Vielzahl von Funktionen für Brautpaare zur Planung ihrer Hochzeit, darunter Gästemanagement, Tischplanung, Budget- und Aufgabenverwaltung, sowie ein Gästeportal für die Gäste.

Die Anwendung wurde als No-Code-Webanwendung konzipiert, die einfach anpassbar und erweiterbar ist. Sie basiert auf React mit TypeScript und Vite als Frontend und Supabase als Backend.

### Projektziele
- Integration der besten Funktionen aus beiden Repositories
- Implementierung eines rollenbasierten Berechtigungssystems
- Erweiterung um ein Admin-Dashboard für den Weiterverkauf an mehrere Brautpaare
- Optimierung der Benutzeroberfläche für alle Geräte
- Implementierung einer Monetarisierungsstrategie

## Systemarchitektur

### Technologie-Stack
- **Frontend**: React 18 mit TypeScript, Vite als Build-Tool
- **UI-Framework**: Tailwind CSS für responsives Design
- **Backend**: Supabase (PostgreSQL-Datenbank, Authentifizierung, Speicher)
- **Echtzeit-Kommunikation**: Supabase Realtime für WebSocket-Verbindungen
- **Internationalisierung**: i18next für Mehrsprachigkeit (DE, EN, FR, ES)
- **Zahlungsabwicklung**: Stripe für Abonnements und Einmalzahlungen
- **PWA**: Service Worker für Offline-Funktionalität und Installation

### Architekturdiagramm

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

### Komponenten-Struktur

Die Anwendung ist in folgende Hauptkomponenten unterteilt:

- **src/components/**: UI-Komponenten
  - **ui/**: Wiederverwendbare UI-Elemente
  - **dashboard/**: Dashboard-spezifische Komponenten
  - **guest-area/**: Komponenten für das Gästeportal
  - **admin/**: Admin-Dashboard-Komponenten
  - **payment/**: Zahlungskomponenten
- **src/hooks/**: Benutzerdefinierte React Hooks
- **src/context/**: React Context Provider
- **src/pages/**: Seitenkomponenten
- **src/utils/**: Hilfsfunktionen
- **src/i18n/**: Internationalisierungsdateien
- **src/tests/**: Testdateien
- **public/**: Statische Assets

## Datenbankstruktur

Die Datenbank basiert auf PostgreSQL und wird über Supabase verwaltet. Die Haupttabellen sind:

### Haupttabellen

- **users**: Benutzerinformationen (von Supabase Auth verwaltet)
- **profiles**: Erweiterte Benutzerprofile
- **weddings**: Hochzeitsinstanzen
- **guests**: Gästeinformationen
- **tables**: Tischinformationen
- **seatings**: Sitzplatzinformationen
- **tasks**: Aufgaben
- **budget_categories**: Budgetkategorien
- **expenses**: Ausgaben
- **invitations**: Einladungen mit Zugangscodes

### Zusätzliche Tabellen

- **roles**: Benutzerrollen (admin, customer, guest)
- **user_roles**: Zuordnung von Benutzern zu Rollen
- **user_settings**: Benutzereinstellungen (Sprache, Theme, etc.)
- **subscriptions**: Benutzerabonnements
- **subscription_plans**: Verfügbare Abonnementpläne
- **payments**: Zahlungsinformationen
- **white_label_configs**: White-Label-Konfigurationen
- **error_logs**: Fehlerprotokolle

### Beziehungsdiagramm

```
users 1--* user_roles *--1 roles
users 1--1 profiles
users 1--* weddings
users 1--* subscriptions *--1 subscription_plans
users 1--* payments
users 1--* white_label_configs
weddings 1--* guests
weddings 1--* tables
weddings 1--* tasks
weddings 1--* budget_categories
budget_categories 1--* expenses
guests *--* tables (über seatings)
guests 1--1 invitations
```

### Row-Level Security (RLS)

Alle Tabellen sind mit Row-Level Security (RLS) Policies geschützt, um sicherzustellen, dass Benutzer nur auf ihre eigenen Daten zugreifen können. Administratoren haben erweiterte Zugriffsrechte.

## Kernfunktionen

### Authentifizierung mit Rollenkonzept

Die Authentifizierung wird über Supabase Auth verwaltet und um ein rollenbasiertes Berechtigungssystem erweitert. Es gibt drei Hauptrollen:

- **Admin**: Vollständiger Zugriff auf alle Funktionen und Daten
- **Customer**: Zugriff auf eigene Hochzeitsinstanz und zugehörige Daten
- **Guest**: Eingeschränkter Zugriff auf das Gästeportal

Die Implementierung erfolgt über den `AuthContext`, der den Authentifizierungsstatus und die Benutzerrolle verwaltet.

### Gästemanagement

Das Gästemanagement ermöglicht die Verwaltung der Hochzeitsgäste mit folgenden Funktionen:

- Hinzufügen, Bearbeiten und Löschen von Gästen
- Kategorisierung von Gästen (Familie, Freunde, Kollegen, etc.)
- RSVP-Tracking und automatische Erinnerungen
- Import/Export von Gästelisten (CSV, Excel)
- Erfassung von Ernährungseinschränkungen und Allergien
- Verwaltung von Plus-Ones

Die Implementierung erfolgt in der `GuestManagementIntegrated`-Komponente.

### Tischplanung

Die Tischplanung ermöglicht die visuelle Planung der Sitzordnung mit folgenden Funktionen:

- Drag & Drop Gästeplatzierung
- Verschiedene Tischformen (rund, rechteckig, oval)
- Automatische Berechnung der optimalen Sitzordnung
- KI-gestützter Sitzplatzassistent
- Speichern und Laden verschiedener Tischplan-Varianten

Die Implementierung erfolgt in der `EnhancedTablePlanner`-Komponente.

### Budget- und Aufgabenmanagement

Das Budget- und Aufgabenmanagement ermöglicht die Verwaltung des Hochzeitsbudgets und der Aufgaben:

#### Budget-Tracker
- Übersicht über geplante vs. tatsächliche Ausgaben
- Budgetkategorien hinzufügen und verwalten
- Ausgaben erfassen und kategorisieren
- Visuelle Aufbereitung und Export

Die Implementierung erfolgt in der `BudgetTrackerEnhanced`-Komponente.

#### Aufgaben-Board
- Kanban-Board für Aufgaben
- Aufgaben erstellen, bearbeiten und löschen
- Aufgaben kategorisieren und mit Fälligkeitsdaten versehen
- Erinnerungen für anstehende Aufgaben

Die Implementierung erfolgt in der `TaskBoardEnhanced`-Komponente.

## Erweiterte Funktionen

### Echtzeit-Synchronisation

Die Echtzeit-Synchronisation wird über Supabase Realtime implementiert und ermöglicht die sofortige Aktualisierung der Daten auf allen verbundenen Geräten. Dies ist besonders wichtig für die kollaborative Planung und das Gästeportal.

### Gästeportal

Das Gästeportal ermöglicht den Gästen den Zugriff auf Hochzeitsinformationen und die Verwaltung ihrer RSVP-Antworten:

- Gästezugang mit eindeutigem Code
- Digitale Einladungen mit personalisierten Informationen
- RSVP-Einreichung durch Gäste
- Angabe von Ernährungseinschränkungen und Allergien
- Informationen zu Veranstaltungsort, Unterkunft, etc.

Die Implementierung erfolgt in den Komponenten `GuestPortal`, `GuestInvitation` und `GuestRSVP`.

### Mehrsprachigkeit

Die Anwendung unterstützt vier Sprachen:
- Deutsch (DE)
- Englisch (EN)
- Französisch (FR)
- Spanisch (ES)

Die Implementierung erfolgt über i18next und ist in der `i18n.ts`-Datei konfiguriert.

### Dark Mode

Der Dark Mode ermöglicht die Anpassung der Benutzeroberfläche an die Präferenzen des Benutzers:

- Light Mode (hell)
- Dark Mode (dunkel)
- System-Theme (basierend auf den Systemeinstellungen)

Die Implementierung erfolgt über den `useTheme`-Hook und die `ThemeToggle`-Komponente.

### Fehlerbehandlung

Das Fehlerbehandlungssystem ermöglicht die Erfassung, Protokollierung und Verwaltung von Fehlern:

- ErrorBoundary-Komponente für React-Fehler
- Globaler Fehlerhandler für unerwartete Fehler
- Fehlerprotokollierung in der Datenbank
- Admin-Interface zur Fehlerverwaltung

Die Implementierung erfolgt in der `ErrorHandling.tsx`-Datei.

## Admin-Dashboard

Das Admin-Dashboard ermöglicht die Verwaltung der Anwendung und ihrer Benutzer:

### Benutzerverwaltung

- Benutzer erstellen, bearbeiten und löschen
- Benutzerrollen zuweisen
- Benutzerstatistiken einsehen

Die Implementierung erfolgt in der `UserManagement`-Komponente.

### Instanzverwaltung

- Hochzeitsinstanzen erstellen, bearbeiten und löschen
- Instanzstatus verwalten
- Domains und Subdomains konfigurieren

Die Implementierung erfolgt in der `InstanceManagement`-Komponente.

### Abonnementverwaltung

- Abonnementpläne erstellen, bearbeiten und löschen
- Benutzerabonnements verwalten
- Zahlungsstatus überwachen

Die Implementierung erfolgt in der `SubscriptionPlans`-Komponente (Admin-Version).

### Analytik

- Benutzerstatistiken
- Umsatzstatistiken
- Nutzungsstatistiken

Die Implementierung erfolgt in der `Analytics`-Komponente.

## Monetarisierungsstrategie

Die Monetarisierungsstrategie umfasst verschiedene Einnahmequellen:

### Abonnement-Modelle

- **Basic**: Grundlegende Funktionen für kleine Hochzeiten
- **Premium**: Erweiterte Funktionen für mittlere Hochzeiten
- **Professional**: Alle Funktionen für große Hochzeiten

Die Implementierung erfolgt in der `SubscriptionPlans`-Komponente.

### Einmalzahlungen

- Einmalige Zahlungen für bestimmte Funktionen oder Erweiterungen
- Unterstützung für verschiedene Zahlungsmethoden (Kreditkarte, PayPal, Banküberweisung)

Die Implementierung erfolgt in der `OneTimePayment`-Komponente.

### White-Label-Option

- Anpassung der Anwendung für Hochzeitsplaner
- Eigenes Branding (Logo, Farben, Domain)
- Verwaltung mehrerer Hochzeiten

Die Implementierung erfolgt in der `WhiteLabel`-Komponente.

### Zahlungsabwicklung

Die Zahlungsabwicklung erfolgt über Stripe und unterstützt:
- Kreditkartenzahlungen
- PayPal
- SEPA-Lastschrift
- Sofortüberweisung

## UI/UX-Optimierung

### Mobile-First Design

Die Anwendung wurde nach dem Mobile-First-Prinzip entwickelt, um eine optimale Nutzung auf allen Geräten zu gewährleisten. Die Implementierung erfolgt über Tailwind CSS und den `useResponsive`-Hook.

### Progressive Web App (PWA)

Die Anwendung ist als Progressive Web App (PWA) implementiert, was folgende Vorteile bietet:
- Installation auf dem Homescreen
- Offline-Funktionalität
- Push-Benachrichtigungen
- Hintergrund-Synchronisation

Die Implementierung erfolgt über die `PWASetup`-Komponente, `manifest.json` und `service-worker.js`.

### Barrierefreiheit

Die Anwendung erfüllt die WCAG 2.1 Richtlinien für Barrierefreiheit:
- Semantisches HTML
- Tastaturnavigation
- Screenreader-Unterstützung
- Ausreichende Farbkontraste
- Anpassbare Schriftgrößen

Die Implementierung erfolgt über die `AccessibilityControls`-Komponente.

### Responsives Design

Das responsive Design passt sich automatisch an verschiedene Bildschirmgrößen an:
- Mobile (< 640px)
- Tablet (640px - 1023px)
- Desktop (1024px - 1279px)
- Large Desktop (≥ 1280px)

Die Implementierung erfolgt über Tailwind CSS und die `ResponsiveContainer`, `ResponsiveGrid` und `ResponsiveText`-Komponenten.

### Navigation

Die Navigation ist benutzerfreundlich und intuitiv gestaltet:
- Desktop: Horizontale Navigationsleiste
- Mobile: Hamburger-Menü mit Dropdown
- Aktive Seite wird hervorgehoben
- Schnellzugriff auf wichtige Funktionen

Die Implementierung erfolgt in der `Navigation`-Komponente.

## Fehlerbehandlung

### ErrorBoundary

Die `ErrorBoundary`-Komponente fängt Fehler in React-Komponenten ab und zeigt eine Fallback-UI an, um zu verhindern, dass die gesamte Anwendung abstürzt.

### Globaler Fehlerhandler

Der globale Fehlerhandler fängt unerwartete Fehler ab, die außerhalb von React-Komponenten auftreten, und protokolliert sie.

### Fehlerprotokollierung

Alle Fehler werden in der Datenbank protokolliert, um eine spätere Analyse und Behebung zu ermöglichen.

### Fehlerverwaltung

Die `ErrorManagement`-Komponente ermöglicht Administratoren die Verwaltung von Fehlern:
- Anzeigen von Fehlerprotokollen
- Markieren von Fehlern als gelöst
- Filtern und Sortieren von Fehlern

## Testing

### Komponententests

Die Komponententests überprüfen die korrekte Funktionsweise einzelner Komponenten:
- UI-Komponenten (ThemeToggle, Navigation, AccessibilityControls)
- Kernfunktionen (Gästemanagement, Tischplanung, Budget-Tracker, Aufgabenverwaltung)
- Gästeportal (Zugangscode, Einladung, RSVP)
- Zahlungsfunktionen (Abonnements, Einmalzahlungen, White-Label)
- Admin-Dashboard (Benutzerverwaltung, Instanzverwaltung, Analytik)

### Integrationstests

Die Integrationstests überprüfen das Zusammenspiel verschiedener Komponenten:
- Theme-Integration
- Responsive Design
- PWA-Funktionalität
- Mehrsprachigkeit

### End-to-End-Tests

Die End-to-End-Tests simulieren vollständige Benutzerszenarien:
- Fehlerbehandlung
- Formularvalidierung
- Sprachänderung

### Automatisierte Tests

Die automatisierten Tests werden mit Jest und React Testing Library durchgeführt und sind in der CI/CD-Pipeline integriert.

## Deployment

### Deployment-Strategie

Die Deployment-Strategie umfasst:
- Kontinuierliche Integration und Deployment (CI/CD)
- Stufenweiser Rollout (Development, Staging, Production)
- Automatisierte Tests vor dem Deployment
- Rollback-Mechanismen bei Fehlern

### Infrastruktur

Die Anwendung wird auf folgender Infrastruktur bereitgestellt:
- Frontend: Vercel oder Netlify
- Backend: Supabase
- Datenbank: PostgreSQL (Supabase)
- Speicher: Supabase Storage
- CDN: Cloudflare

### Umgebungskonfiguration

Die Umgebungskonfiguration erfolgt über Umgebungsvariablen:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_STRIPE_PUBLIC_KEY
- VITE_API_URL
- VITE_ENVIRONMENT (development, staging, production)

### Monitoring

Das Monitoring erfolgt über:
- Supabase Monitoring
- Sentry für Fehlerüberwachung
- Google Analytics für Nutzungsstatistiken

## Wartung und Support

### Automatisierte Backups

Die Datenbank wird täglich automatisch gesichert, und die Backups werden 30 Tage lang aufbewahrt.

### Wiederherstellungsoptionen

Im Falle eines Datenverlusts können die Daten aus den Backups wiederhergestellt werden.

### Support-Prozesse

Der Support erfolgt über:
- E-Mail-Support
- In-App-Hilfe
- FAQ-Bereich
- Dokumentation für Endbenutzer

### Updates und Wartung

Die Anwendung wird regelmäßig aktualisiert, um:
- Sicherheitslücken zu schließen
- Neue Funktionen hinzuzufügen
- Leistung zu verbessern
- Fehler zu beheben
