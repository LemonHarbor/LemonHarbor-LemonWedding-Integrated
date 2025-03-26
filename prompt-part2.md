4. **Datenbankschema**
   - Bestehende Tabellen (tasks, guests, tables, guest_relationships, budget_categories) beibehalten
   - Ergänzung um neue Tabellen (siehe unten)

## Implementierungsphasen

Bitte arbeite in folgenden Phasen:

1. **Analyse und Setup**
   - Repository-Struktur verstehen und optimieren
   - Fehlende Tabellen in Supabase erstellen (siehe unten)
   - Basisfunktionen und -komponenten identifizieren

2. **Kernfunktionen**
   - Authentifizierung mit Rollenkonzept erweitern
   - Dashboard mit grundlegenden Widgets
   - Gästemanagement-Modul optimieren
   - Tischplanung-Modul verbessern
   - Budget- und Aufgabenmodule optimieren

3. **Erweiterte Funktionen**
   - Echtzeit-Synchronisation verbessern
   - Gästeportal implementieren
   - Mehrsprachigkeit erweitern
   - Dark Mode implementieren

4. **UI/UX und Optimierung**
   - Einheitliches Design für alle Komponenten
   - Responsives Design
   - Performance-Optimierung
   - Fehlerbehandlungssystem

5. **Testing und Deployment**
   - Komponenten- und Integrationstests
   - Benutzerakzeptanztests
   - Deployment der App

## Benötigte Datenbankergänzungen

Basierend auf der Analyse beider Apps und der bestehenden Datenbankstruktur werden folgende Ergänzungen benötigt:

```sql
-- Benutzerrollen und Berechtigungen
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (name IN ('couple', 'best_man', 'maid_of_honor', 'guest')),
    permissions jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Benutzereinstellungen
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    language text DEFAULT 'de' CHECK (language IN ('de', 'en', 'fr', 'es')),
    dark_mode boolean DEFAULT false,
    notification_preferences jsonb DEFAULT '{}',
    wedding_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ausgaben-Tabelle für die Budget-Funktion
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    description text,
    date date NOT NULL,
    receipt_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Einladungs-Tabelle für die digitalen Einladungen
CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    access_code text UNIQUE NOT NULL,
    viewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Email-Logs Tabelle (falls nicht bereits vorhanden)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    email text NOT NULL,
    email_type text NOT NULL,
    sent_at timestamp with time zone DEFAULT now()
);
```

Die entsprechenden RLS-Policies und Realtime-Konfigurationen müssen für diese neuen Tabellen ebenfalls erstellt werden, ähnlich zu den bestehenden Policies:

```sql
-- Beispiel für user_roles Tabelle
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Realtime aktivieren
alter publication supabase_realtime add table user_roles;
alter publication supabase_realtime add table user_settings;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table invitations;
alter publication supabase_realtime add table email_logs;
```

## Weitere Hinweise

- Die App wurde ursprünglich mit tempolabs.ai erstellt
- Es soll eine vollständige No-Code-Lösung sein, die keine manuelle Programmierung durch den Endbenutzer erfordert
- Die endgültige App sollte einheitlich und intuitiv zu bedienen sein
- Alle Daten sollten in Echtzeit über mehrere Geräte synchronisiert werden
- Lege besonderen Wert auf die Sicherheit der Daten und die Einhaltung von Best Practices
- Das System soll komplett wartbar und testbar auch für Nicht-Programmierer sein
- Die App soll verkaufbar und monetarisierbar sein (z.B. durch Abonnement-Modelle oder Einmalzahlungen)
- **Alle Änderungen und Entwicklungen sollen regelmäßig in meinem GitHub-Account gespeichert werden**
- **Eine Demo der Kernfunktionen soll auf der Landing-Page implementiert werden, um potenzielle Kunden zu überzeugen**

## No-Code-Anforderungen

Ein wichtiger Aspekt dieses Projekts ist die Umsetzung als vollständige No-Code-Lösung:

1. **Administratorbereich**:
   - Erstellung eines Admin-Panels für Konfigurationsänderungen ohne Coding
   - Visuelle Editoren für alle anpassbaren Elemente
   - Einfache Formularbasierte Einstellungen

2. **Wartbarkeit**:
   - Klare Dokumentation für Nicht-Techniker
   - Einfache Backup- und Wiederherstellungsprozesse
   - Automatisierte Updates und Wartungsfunktionen

3. **Testbarkeit**:
   - Eingebaute Testumgebung
   - Vorschaumöglichkeiten für Änderungen
   - Einfache Rückgängig-Funktionen für versehentliche Änderungen

## Monetarisierungsstrategie

Implementiere eine flexible Monetarisierungsstrategie mit folgenden Elementen:

1. **Abonnement-Modelle**:
   - Verschiedene Preisstufen (Basic, Premium, Professional)
   - Unterschiedliche Funktionsumfänge je nach Stufe
   - Rabatte für jährliche Zahlungen

2. **Einmalzahlungen**:
   - Option für vollständigen Kauf der Software
   - Add-On-Pakete für spezielle Funktionen

3. **Branding und Customization**:
   - White-Label-Option für Hochzeitsplaner
   - Anpassbare Themes und Designs

4. **Zahlungsabwicklung**:
   - Integration mit gängigen Zahlungsanbietern
   - Automatisierte Rechnungsstellung

## Marketing-Strategie

Entwickle einen vollständigen Marketing-Plan für die Hochzeitsapp:

1. **Zielgruppenanalyse**:
   - Primäre Zielgruppe: Verlobte Paare
   - Sekundäre Zielgruppen: Hochzeitsplaner, Veranstaltungsorte

2. **Marketing-Kanäle**:
   - Social Media (Instagram, Pinterest, Facebook)
   - Hochzeitsmessen und Events
   - Partnerschaften mit Hochzeitsdienstleistern
   - Content-Marketing (Blog, Podcasts)

3. **Marketing-Material**:
   - Promo-Videos und Screenshots
   - Testimonials und Case Studies
   - Infografiken und Anleitungen

4. **Wachstumsstrategie**:
   - Freemium-Modell mit begrenzter Funktionalität
   - Empfehlungsprogramm
   - Saisonale Angebote

## Design Best Practices

Implementiere folgende Design-Prinzipien:

1. **Mobile-First Designphilosophie**:
   - Entwickle primär für mobile Geräte und skaliere dann hoch
   - Optimiere für Touch-Interaktionen und Gesten
   - Simplizität und Fokus auf wesentliche Funktionen
   - Beachte kleinere Bildschirmgrößen bei jeder Designentscheidung

2. **Progressive Web App (PWA)**:
   - Implementiere Service Worker für Offline-Funktionalität
   - App-Shell-Architektur für schnelles Laden
   - Web App Manifest für "Add to Home Screen"-Funktionalität
   - Push-Benachrichtigungen für wichtige Updates

3. **Konsistentes Designsystem**:
   - Einheitliche Farbpalette mit Primär-, Sekundär- und Akzentfarben
   - Konsistente Typografie mit maximal 2-3 Schriftarten
   - Wiederverwendbare UI-Komponenten
   - Touch-freundliche Bedienelemene (min. 44x44px Touchfläche)

4. **Barrierefreiheit**:
   - WCAG 2.1-konformes Design
   - Ausreichende Farbkontraste
   - Unterstützung für Screenreader
   - Tastaturnavigation

5. **Responsive Design**:
   - Adaptive Layouts für alle Bildschirmgrößen
   - Flexibles Grid-System
   - Optimierung für verschiedene Geräteorientierungen
   - Einheitliche Erfahrung auf allen Geräten

6. **User Experience**:
   - Intuitive Navigation mit minimalem Tippen/Klicken
   - Klare Hierarchie der Informationen
   - Fortschrittsanzeigen und Feedback
   - Anleitungen und Tooltips für neue Benutzer
   - Schnelle Ladezeiten und Performance-Optimierung

## Vorgehen

1. **Initial Review und Repository-Zugriff**:
   - Zugriff auf beide GitHub-Repositories einrichten
   - Direkt in den Repositories arbeiten
   - Detaillierte Analyse und Vergleich der Repositories durchführen
   - Stärken und Schwächen beider Implementierungen identifizieren
   - **Regelmäßige Zwischenspeicherung aller Änderungen in meinem GitHub-Account**

2. **Datenbankintegration**:
   - Erforderliche Tabellen in Supabase anlegen
   - RLS-Policies und Realtime-Konfiguration
   - Datenmodell für Monetarisierung vorbereiten

3. **Authentifizierung und Berechtigungen**:
   - Implementiere rollenbasiertes System
   - Einrichtung verschiedener Zugriffsebenen
   - Sichere Gastportale mit eindeutigen Zugangscodes

4. **Core Functionality**:
   - Implementiere alle Kernfunktionen basierend auf den Diagrammen
   - Kombiniere Best Practices aus beiden Repositories
   - No-Code-Konfigurations- und Anpassungsmöglichkeiten einbauen

5. **Frontend-Optimierung**:
   - UI/UX-Verbesserungen nach Design Best Practices
   - Responsives Design für alle Geräte
   - Mehrsprachigkeit und Lokalisierung
   - Dark Mode und Barrierefreiheit

6. **Monetarisierung und Marketing**:
   - Implementierung der Bezahlsysteme und Abo-Modelle
   - Erstellung von Marketing-Materialien
   - Exportfunktionen für Social Media Sharing
   - Analytics und Conversion-Tracking
   - **Entwicklung einer überzeugenden Landing-Page mit Demo der Kernfunktionen**

7. **Testing und Wartung**:
   - Umfassendes Testen mit Nicht-Programmierern
   - Erstellung benutzerfreundlicher Administrationsoberflächen
   - Automatisierte Backups und Wiederherstellungsoptionen
   - Dokumentation für Endbenutzer

8. **Deployment und Launch-Strategie**:
   - Stufenweiser Rollout-Plan
   - Beta-Testprogramm
   - Feedback-Einholung und Iteration
   - Vollständiger öffentlicher Launch

Bitte dokumentiere während der gesamten Entwicklung dein Vorgehen und erstelle eine Übersicht über die implementierten Funktionen. Nach Abschluss der Integration erstelle eine Anleitung zur Nutzung der App sowie ein Marketing-Kit mit Werbematerialien, Screenshots und Erklärvideos zur Nutzung der Funktionalitäten.