# Deployment-Anleitung für LemonWedding

Diese Anleitung beschreibt die Schritte zur Bereitstellung der LemonWedding-Anwendung in einer Produktionsumgebung.

## Voraussetzungen

- Node.js 16.x oder höher
- npm 8.x oder höher
- Git
- Supabase-Konto
- Vercel-Konto
- Stripe-Konto (für Zahlungsabwicklung)
- SendGrid-Konto (für E-Mail-Versand)

## Schritt 1: Repository klonen

```bash
git clone https://github.com/LemonHarbor/LemonWedding-Integrated.git
cd LemonWedding-Integrated
```

## Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

## Schritt 3: Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.production`-Datei mit den folgenden Variablen:

```
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
VITE_API_URL=https://your-api-url.com
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_MEASUREMENT_ID=your-ga-measurement-id
```

## Schritt 4: Supabase-Projekt einrichten

1. Erstellen Sie ein neues Supabase-Projekt
2. Führen Sie die SQL-Migrationen aus dem Ordner `database` aus
3. Konfigurieren Sie die Authentifizierung und Speicher-Buckets
4. Stellen Sie die Edge-Functions bereit

## Schritt 5: Stripe-Konto einrichten

1. Erstellen Sie Produkte und Preise für die Abonnementpläne
2. Konfigurieren Sie Webhooks für Supabase-Edge-Functions
3. Notieren Sie sich den öffentlichen Schlüssel für die Frontend-Konfiguration

## Schritt 6: Anwendung bauen

```bash
npm run build
```

## Schritt 7: Bereitstellung auf Vercel

### Option 1: Manuelle Bereitstellung

1. Installieren Sie die Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Melden Sie sich bei Vercel an:
   ```bash
   vercel login
   ```

3. Stellen Sie die Anwendung bereit:
   ```bash
   vercel --prod
   ```

### Option 2: Automatische Bereitstellung mit GitHub

1. Verbinden Sie Ihr GitHub-Repository mit Vercel
2. Konfigurieren Sie die Umgebungsvariablen in den Projekteinstellungen
3. Aktivieren Sie die automatische Bereitstellung für den `main`-Branch

## Schritt 8: Domain konfigurieren

1. Fügen Sie Ihre Domain in den Vercel-Projekteinstellungen hinzu
2. Konfigurieren Sie die DNS-Einstellungen gemäß den Anweisungen von Vercel
3. Warten Sie auf die DNS-Propagation und SSL-Zertifikatserstellung

## Schritt 9: Monitoring einrichten

1. Konfigurieren Sie Sentry für Fehlerüberwachung
2. Richten Sie Google Analytics für Nutzungsstatistiken ein
3. Konfigurieren Sie Uptime Robot für Verfügbarkeitsüberwachung

## Schritt 10: Backup-Strategie implementieren

1. Konfigurieren Sie automatische Backups für die Supabase-Datenbank
2. Richten Sie einen Prozess für regelmäßige Konfigurationsbackups ein
3. Dokumentieren Sie den Wiederherstellungsprozess

## Fehlerbehebung

### Problem: Anwendung lädt nicht
- Überprüfen Sie die Vercel-Logs auf Fehler
- Stellen Sie sicher, dass alle Umgebungsvariablen korrekt konfiguriert sind
- Überprüfen Sie die Netzwerkanfragen im Browser-Entwicklertool

### Problem: Supabase-Verbindung fehlgeschlagen
- Überprüfen Sie die Supabase-URL und den anonymen Schlüssel
- Stellen Sie sicher, dass die Supabase-Datenbank läuft
- Überprüfen Sie die CORS-Einstellungen in Supabase

### Problem: Stripe-Zahlungen funktionieren nicht
- Überprüfen Sie den Stripe-öffentlichen Schlüssel
- Stellen Sie sicher, dass die Stripe-Webhooks korrekt konfiguriert sind
- Überprüfen Sie die Stripe-Logs auf Fehler

## Nützliche Befehle

- Anwendung lokal starten: `npm run dev`
- Produktionsbuild erstellen: `npm run build`
- Produktionsbuild lokal testen: `npm run preview`
- Linting durchführen: `npm run lint`
- Tests ausführen: `npm run test`
