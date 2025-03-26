# LemonWedding - Administratorhandbuch

## Inhaltsverzeichnis
1. [Einführung](#einführung)
2. [Installation und Setup](#installation-und-setup)
3. [Admin-Dashboard](#admin-dashboard)
4. [Benutzerverwaltung](#benutzerverwaltung)
5. [Instanzverwaltung](#instanzverwaltung)
6. [Abonnementverwaltung](#abonnementverwaltung)
7. [White-Label-Konfiguration](#white-label-konfiguration)
8. [Analytik und Berichte](#analytik-und-berichte)
9. [Systemeinstellungen](#systemeinstellungen)
10. [Fehlerbehandlung](#fehlerbehandlung)
11. [Backup und Wiederherstellung](#backup-und-wiederherstellung)
12. [Sicherheit](#sicherheit)
13. [Wartung und Updates](#wartung-und-updates)

## Einführung

Dieses Administratorhandbuch bietet eine umfassende Anleitung zur Verwaltung der LemonWedding-Plattform. Es richtet sich an Systemadministratoren und technische Mitarbeiter, die für die Konfiguration, Wartung und Überwachung der Anwendung verantwortlich sind.

### Über LemonWedding

LemonWedding ist eine umfassende Hochzeitsplanungs-App, die durch die Integration zweier bestehender Repositories (LemonWedding und HochzeitsappReally) entstanden ist. Die App bietet eine Vielzahl von Funktionen für Brautpaare zur Planung ihrer Hochzeit und ist als SaaS-Lösung konzipiert, die an mehrere Kunden verkauft werden kann.

### Administratorrollen

Es gibt zwei Haupttypen von Administratoren:
- **Systemadministratoren**: Haben vollständigen Zugriff auf alle Funktionen und Einstellungen.
- **Support-Administratoren**: Haben eingeschränkten Zugriff auf bestimmte Funktionen, um Kundenanfragen zu bearbeiten.

## Installation und Setup

### Systemanforderungen

- **Server**: 
  - Mindestens 2 CPU-Kerne
  - 4 GB RAM
  - 20 GB SSD-Speicher
- **Betriebssystem**: Ubuntu 20.04 LTS oder höher
- **Datenbank**: PostgreSQL 13 oder höher
- **Node.js**: Version 16 oder höher
- **Netzwerk**: Öffentliche IP-Adresse mit HTTPS-Unterstützung

### Installation

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
   Erstellen Sie eine `.env`-Datei basierend auf der `.env.example`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Konfigurieren Sie die folgenden Variablen:
   ```
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
   VITE_API_URL=https://your-api-url.com
   VITE_ENVIRONMENT=production
   ```

4. **Anwendung bauen**:
   ```bash
   npm run build
   ```

5. **Anwendung starten**:
   ```bash
   npm run start
   ```

### Supabase-Konfiguration

1. **Supabase-Projekt erstellen**:
   - Besuchen Sie [Supabase](https://supabase.com) und erstellen Sie ein neues Projekt.
   - Notieren Sie sich die Projekt-URL und den anonymen Schlüssel.

2. **Datenbank-Migrations ausführen**:
   - Navigieren Sie zum SQL-Editor in Ihrem Supabase-Projekt.
   - Führen Sie die SQL-Skripte aus dem Ordner `database` aus.

3. **Authentifizierung konfigurieren**:
   - Aktivieren Sie die E-Mail-Authentifizierung.
   - Konfigurieren Sie die E-Mail-Vorlagen für Bestätigungen und Passwort-Zurücksetzungen.
   - Setzen Sie die Site-URL auf Ihre Produktions-URL.

4. **Speicher-Buckets erstellen**:
   - Erstellen Sie die folgenden Buckets:
     - `avatars`: Für Benutzerprofilbilder
     - `wedding-photos`: Für Hochzeitsfotos
     - `receipts`: Für Belege
     - `white-label-logos`: Für White-Label-Logos

5. **Edge-Funktionen bereitstellen**:
   - Stellen Sie die Edge-Funktionen aus dem Ordner `supabase/functions` bereit.

### Stripe-Konfiguration

1. **Stripe-Konto erstellen**:
   - Besuchen Sie [Stripe](https://stripe.com) und erstellen Sie ein Konto.
   - Wechseln Sie in den Testmodus für die Entwicklung.

2. **Produkte und Preise erstellen**:
   - Erstellen Sie Produkte für die verschiedenen Abonnementpläne (Basic, Premium, Professional).
   - Erstellen Sie Preise für monatliche und jährliche Zahlungen.
   - Notieren Sie sich die Produkt- und Preis-IDs.

3. **Webhook konfigurieren**:
   - Erstellen Sie einen Webhook, der auf Ihre Supabase-Edge-Funktion zeigt.
   - Abonnieren Sie die folgenden Ereignisse:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

## Admin-Dashboard

Das Admin-Dashboard ist die zentrale Schnittstelle für die Verwaltung der LemonWedding-Plattform.

### Zugriff auf das Admin-Dashboard

1. Navigieren Sie zur LemonWedding-URL und fügen Sie `/admin` hinzu.
2. Melden Sie sich mit Ihren Administratoranmeldedaten an.
3. Bei der ersten Anmeldung werden Sie aufgefordert, Ihr Passwort zu ändern.

### Dashboard-Übersicht

Das Dashboard bietet einen Überblick über:
- Aktive Benutzer und Sitzungen
- Neue Registrierungen (täglich, wöchentlich, monatlich)
- Umsatzstatistiken
- Systemstatus und Warnungen
- Neueste Aktivitäten

### Navigation

Die Hauptnavigation umfasst:
- **Dashboard**: Übersicht und Statistiken
- **Benutzer**: Benutzerverwaltung
- **Instanzen**: Verwaltung von Hochzeitsinstanzen
- **Abonnements**: Abonnement- und Zahlungsverwaltung
- **White-Label**: White-Label-Konfigurationen
- **Analytik**: Detaillierte Berichte und Statistiken
- **Einstellungen**: Systemeinstellungen
- **Fehler**: Fehlerprotokolle und -verwaltung

## Benutzerverwaltung

Die Benutzerverwaltung ermöglicht die Verwaltung aller Benutzerkonten auf der Plattform.

### Benutzer anzeigen

1. Gehen Sie zu "Benutzer" im Admin-Dashboard.
2. Sehen Sie eine Liste aller Benutzer mit grundlegenden Informationen:
   - E-Mail-Adresse
   - Name
   - Registrierungsdatum
   - Letzter Login
   - Status (aktiv, inaktiv, gesperrt)
   - Rolle (Admin, Kunde, Gast)

### Benutzer filtern und suchen

1. Verwenden Sie die Suchleiste, um nach E-Mail oder Namen zu suchen.
2. Filtern Sie Benutzer nach:
   - Status
   - Rolle
   - Registrierungsdatum
   - Abonnementtyp

### Benutzer erstellen

1. Klicken Sie auf "Neuer Benutzer".
2. Geben Sie die folgenden Informationen ein:
   - E-Mail-Adresse
   - Name
   - Passwort (oder Option für automatisch generiertes Passwort)
   - Rolle
   - Abonnementplan (optional)
3. Klicken Sie auf "Erstellen".
4. Der Benutzer erhält eine E-Mail mit seinen Anmeldedaten.

### Benutzer bearbeiten

1. Klicken Sie auf einen Benutzer in der Liste.
2. Bearbeiten Sie die Benutzerinformationen:
   - Name
   - E-Mail-Adresse
   - Rolle
   - Status
3. Klicken Sie auf "Speichern".

### Benutzer löschen

1. Klicken Sie auf einen Benutzer in der Liste.
2. Klicken Sie auf "Löschen".
3. Bestätigen Sie die Löschung.
4. Wählen Sie, ob Sie auch alle zugehörigen Daten löschen möchten.

### Benutzerrollen verwalten

1. Gehen Sie zu "Einstellungen" > "Rollen".
2. Sehen Sie eine Liste aller verfügbaren Rollen.
3. Bearbeiten Sie die Berechtigungen für jede Rolle.
4. Erstellen Sie neue Rollen bei Bedarf.

## Instanzverwaltung

Die Instanzverwaltung ermöglicht die Verwaltung aller Hochzeitsinstanzen auf der Plattform.

### Instanzen anzeigen

1. Gehen Sie zu "Instanzen" im Admin-Dashboard.
2. Sehen Sie eine Liste aller Hochzeitsinstanzen mit grundlegenden Informationen:
   - Name
   - Besitzer
   - Erstellungsdatum
   - Status (aktiv, inaktiv, archiviert)
   - Domain (falls konfiguriert)

### Instanzen filtern und suchen

1. Verwenden Sie die Suchleiste, um nach Namen oder Besitzer zu suchen.
2. Filtern Sie Instanzen nach:
   - Status
   - Erstellungsdatum
   - Abonnementtyp

### Instanz erstellen

1. Klicken Sie auf "Neue Instanz".
2. Wählen Sie einen Benutzer als Besitzer.
3. Geben Sie einen Namen für die Instanz ein.
4. Wählen Sie einen Abonnementplan.
5. Konfigurieren Sie optional eine benutzerdefinierte Domain.
6. Klicken Sie auf "Erstellen".

### Instanz bearbeiten

1. Klicken Sie auf eine Instanz in der Liste.
2. Bearbeiten Sie die Instanzinformationen:
   - Name
   - Besitzer
   - Status
   - Domain
3. Klicken Sie auf "Speichern".

### Instanz löschen

1. Klicken Sie auf eine Instanz in der Liste.
2. Klicken Sie auf "Löschen".
3. Bestätigen Sie die Löschung.
4. Wählen Sie, ob Sie auch alle zugehörigen Daten löschen möchten.

### Domain-Konfiguration

1. Klicken Sie auf eine Instanz in der Liste.
2. Gehen Sie zum Tab "Domain".
3. Geben Sie die gewünschte Domain oder Subdomain ein.
4. Klicken Sie auf "Speichern".
5. Folgen Sie den Anweisungen zur DNS-Konfiguration.

## Abonnementverwaltung

Die Abonnementverwaltung ermöglicht die Verwaltung aller Abonnements und Zahlungen auf der Plattform.

### Abonnementpläne verwalten

1. Gehen Sie zu "Abonnements" > "Pläne" im Admin-Dashboard.
2. Sehen Sie eine Liste aller verfügbaren Abonnementpläne.
3. Bearbeiten Sie bestehende Pläne:
   - Name
   - Beschreibung
   - Preis
   - Funktionen
   - Limits
4. Erstellen Sie neue Pläne bei Bedarf.

### Benutzerabonnements verwalten

1. Gehen Sie zu "Abonnements" > "Benutzerabonnements".
2. Sehen Sie eine Liste aller aktiven Abonnements.
3. Filtern Sie nach Plan, Status oder Benutzer.
4. Klicken Sie auf ein Abonnement, um Details anzuzeigen:
   - Benutzer
   - Plan
   - Start- und Enddatum
   - Zahlungsstatus
   - Zahlungshistorie

### Abonnement ändern

1. Klicken Sie auf ein Abonnement in der Liste.
2. Klicken Sie auf "Abonnement ändern".
3. Wählen Sie einen neuen Plan.
4. Wählen Sie, ob die Änderung sofort oder zum nächsten Abrechnungszeitraum wirksam werden soll.
5. Klicken Sie auf "Speichern".

### Abonnement kündigen

1. Klicken Sie auf ein Abonnement in der Liste.
2. Klicken Sie auf "Kündigen".
3. Wählen Sie, ob die Kündigung sofort oder zum Ende des Abrechnungszeitraums wirksam werden soll.
4. Geben Sie einen Grund für die Kündigung an.
5. Klicken Sie auf "Bestätigen".

### Zahlungen anzeigen

1. Gehen Sie zu "Abonnements" > "Zahlungen".
2. Sehen Sie eine Liste aller Zahlungen mit Details:
   - Benutzer
   - Betrag
   - Datum
   - Status
   - Zahlungsmethode
3. Filtern Sie nach Datum, Status oder Benutzer.
4. Klicken Sie auf eine Zahlung, um Details anzuzeigen.

### Rechnungen generieren

1. Gehen Sie zu "Abonnements" > "Rechnungen".
2. Klicken Sie auf "Neue Rechnung".
3. Wählen Sie einen Benutzer.
4. Wählen Sie einen Abrechnungszeitraum.
5. Überprüfen Sie die Rechnungsdetails.
6. Klicken Sie auf "Generieren".
7. Die Rechnung wird automatisch per E-Mail an den Benutzer gesendet.

## White-Label-Konfiguration

Die White-Label-Konfiguration ermöglicht die Anpassung der Anwendung für Hochzeitsplaner und andere Geschäftskunden.

### White-Label-Konfigurationen anzeigen

1. Gehen Sie zu "White-Label" im Admin-Dashboard.
2. Sehen Sie eine Liste aller White-Label-Konfigurationen mit Details:
   - Unternehmen
   - Kontakt
   - Domain
   - Status

### White-Label-Konfiguration erstellen

1. Klicken Sie auf "Neue Konfiguration".
2. Wählen Sie einen Benutzer als Besitzer.
3. Geben Sie die Unternehmensinformationen ein:
   - Name
   - Logo
   - Primärfarbe
   - Sekundärfarbe
   - Kontakt-E-Mail
4. Konfigurieren Sie die Domain.
5. Klicken Sie auf "Erstellen".

### White-Label-Konfiguration bearbeiten

1. Klicken Sie auf eine Konfiguration in der Liste.
2. Bearbeiten Sie die Konfigurationsinformationen.
3. Klicken Sie auf "Speichern".

### White-Label-Domain konfigurieren

1. Klicken Sie auf eine Konfiguration in der Liste.
2. Gehen Sie zum Tab "Domain".
3. Geben Sie die gewünschte Domain ein.
4. Klicken Sie auf "Speichern".
5. Folgen Sie den Anweisungen zur DNS-Konfiguration.

### White-Label-Instanzen verwalten

1. Klicken Sie auf eine Konfiguration in der Liste.
2. Gehen Sie zum Tab "Instanzen".
3. Sehen Sie eine Liste aller Instanzen, die mit dieser Konfiguration verknüpft sind.
4. Erstellen Sie neue Instanzen oder verknüpfen Sie bestehende.

## Analytik und Berichte

Die Analytik und Berichte bieten Einblicke in die Nutzung und Leistung der Plattform.

### Dashboard-Analytik

Das Analytik-Dashboard zeigt:
- Benutzeraktivität (täglich, wöchentlich, monatlich)
- Neue Registrierungen
- Abonnementkonversionen
- Umsatz
- Aktive Instanzen
- Beliebteste Funktionen

### Benutzerbericht

1. Gehen Sie zu "Analytik" > "Benutzer".
2. Sehen Sie detaillierte Statistiken zu Benutzern:
   - Wachstum
   - Aktivität
   - Abmeldungen
   - Demografische Daten
3. Filtern Sie nach Zeitraum, Region oder Abonnementtyp.
4. Exportieren Sie den Bericht als CSV oder PDF.

### Umsatzbericht

1. Gehen Sie zu "Analytik" > "Umsatz".
2. Sehen Sie detaillierte Statistiken zu Umsätzen:
   - Gesamtumsatz
   - Umsatz nach Plan
   - Wiederkehrende vs. einmalige Zahlungen
   - Prognosen
3. Filtern Sie nach Zeitraum oder Abonnementtyp.
4. Exportieren Sie den Bericht als CSV oder PDF.

### Nutzungsbericht

1. Gehen Sie zu "Analytik" > "Nutzung".
2. Sehen Sie detaillierte Statistiken zur Nutzung:
   - Aktive Benutzer
   - Sitzungsdauer
   - Beliebteste Funktionen
   - Gerätenutzung
3. Filtern Sie nach Zeitraum oder Benutzergruppe.
4. Exportieren Sie den Bericht als CSV oder PDF.

### Benutzerdefinierte Berichte

1. Gehen Sie zu "Analytik" > "Benutzerdefinierte Berichte".
2. Klicken Sie auf "Neuer Bericht".
3. Wählen Sie die Datenquellen und Metriken.
4. Konfigurieren Sie Filter und Gruppierungen.
5. Wählen Sie die Visualisierungsart.
6. Speichern Sie den Bericht.
7. Planen Sie optional regelmäßige Berichte per E-Mail.

## Systemeinstellungen

Die Systemeinstellungen ermöglichen die Konfiguration der Plattform.

### Allgemeine Einstellungen

1. Gehen Sie zu "Einstellungen" > "Allgemein".
2. Konfigurieren Sie:
   - Anwendungsname
   - Logo
   - Favicon
   - Standardsprache
   - Zeitzone
   - Datumsformat

### E-Mail-Einstellungen

1. Gehen Sie zu "Einstellungen" > "E-Mail".
2. Konfigurieren Sie:
   - SMTP-Server
   - Absender-E-Mail
   - Absendername
   - E-Mail-Vorlagen

### Authentifizierungseinstellungen

1. Gehen Sie zu "Einstellungen" > "Authentifizierung".
2. Konfigurieren Sie:
   - Passwortrichtlinien
   - Zwei-Faktor-Authentifizierung
   - Social-Login-Provider
   - Session-Timeout

### Zahlungseinstellungen

1. Gehen Sie zu "Einstellungen" > "Zahlungen".
2. Konfigurieren Sie:
   - Stripe-API-Schlüssel
   - Währung
   - Steuereinstellungen
   - Zahlungsmethoden

### Speichereinstellungen

1. Gehen Sie zu "Einstellungen" > "Speicher".
2. Konfigurieren Sie:
   - Maximale Dateigröße
   - Erlaubte Dateitypen
   - Speicherlimits pro Benutzer

### API-Einstellungen

1. Gehen Sie zu "Einstellungen" > "API".
2. Verwalten Sie API-Schlüssel.
3. Konfigurieren Sie Rate-Limits.
4. Überwachen Sie API-Nutzung.

## Fehlerbehandlung

Die Fehlerbehandlung ermöglicht die Überwachung und Behebung von Fehlern in der Anwendung.

### Fehlerprotokolle anzeigen

1. Gehen Sie zu "Fehler" im Admin-Dashboard.
2. Sehen Sie eine Liste aller Fehler mit Details:
   - Fehlertyp
   - Nachricht
   - Zeitpunkt
   - Benutzer
   - Status (neu, in Bearbeitung, gelöst)
3. Filtern Sie nach Typ, Status oder Zeitraum.

### Fehler bearbeiten

1. Klicken Sie auf einen Fehler in der Liste.
2. Sehen Sie detaillierte Informationen:
   - Stack-Trace
   - Browserinformationen
   - Benutzeraktionen
3. Ändern Sie den Status des Fehlers.
4. Fügen Sie Kommentare hinzu.
5. Weisen Sie den Fehler einem Entwickler zu.

### Fehlerbenachrichtigungen konfigurieren

1. Gehen Sie zu "Fehler" > "Benachrichtigungen".
2. Konfigurieren Sie, wann und wie Sie über Fehler benachrichtigt werden möchten:
   - E-Mail
   - Slack
   - SMS
3. Legen Sie Schwellenwerte für Benachrichtigungen fest.

## Backup und Wiederherstellung

Die Backup- und Wiederherstellungsfunktionen ermöglichen die Sicherung und Wiederherstellung von Daten.

### Automatische Backups konfigurieren

1. Gehen Sie zu "Einstellungen" > "Backup".
2. Konfigurieren Sie:
   - Backup-Häufigkeit (täglich, wöchentlich, monatlich)
   - Aufbewahrungsdauer
   - Speicherort
3. Aktivieren Sie automatische Backups.

### Manuelles Backup erstellen

1. Gehen Sie zu "Einstellungen" > "Backup".
2. Klicken Sie auf "Backup erstellen".
3. Wählen Sie, was gesichert werden soll:
   - Datenbank
   - Dateien
   - Konfiguration
4. Klicken Sie auf "Starten".
5. Warten Sie, bis das Backup abgeschlossen ist.
6. Laden Sie das Backup herunter oder speichern Sie es am konfigurierten Speicherort.

### Backup wiederherstellen

1. Gehen Sie zu "Einstellungen" > "Backup".
2. Klicken Sie auf "Wiederherstellen".
3. Wählen Sie ein Backup aus der Liste oder laden Sie eine Backup-Datei hoch.
4. Wählen Sie, was wiederhergestellt werden soll:
   - Datenbank
   - Dateien
   - Konfiguration
5. Klicken Sie auf "Starten".
6. Warten Sie, bis die Wiederherstellung abgeschlossen ist.

## Sicherheit

Die Sicherheitseinstellungen ermöglichen die Konfiguration von Sicherheitsmaßnahmen.

### Sicherheitsübersicht

Die Sicherheitsübersicht zeigt:
- Aktuelle Sicherheitsbedrohungen
- Fehlgeschlagene Anmeldeversuche
- Verdächtige Aktivitäten
- Sicherheitsupdates

### Sicherheitseinstellungen

1. Gehen Sie zu "Einstellungen" > "Sicherheit".
2. Konfigurieren Sie:
   - Passwortrichtlinien
   - Zwei-Faktor-Authentifizierung
   - IP-Beschränkungen
   - Sitzungsverwaltung

### Sicherheitsaudits

1. Gehen Sie zu "Einstellungen" > "Sicherheit" > "Audits".
2. Sehen Sie eine Liste aller Sicherheitsaudits.
3. Planen Sie neue Audits.
4. Exportieren Sie Audit-Berichte.

### DSGVO-Compliance

1. Gehen Sie zu "Einstellungen" > "Sicherheit" > "DSGVO".
2. Konfigurieren Sie:
   - Datenschutzrichtlinien
   - Cookie-Banner
   - Einwilligungsverwaltung
   - Datenexport und -löschung

## Wartung und Updates

Die Wartungs- und Update-Funktionen ermöglichen die Aktualisierung und Wartung der Plattform.

### Systemstatus

Die Systemstatusseite zeigt:
- Server-Status
- Datenbank-Status
- Speicher-Status
- API-Status
- Externe Dienste-Status

### Wartungsmodus

1. Gehen Sie zu "Einstellungen" > "Wartung".
2. Aktivieren Sie den Wartungsmodus.
3. Konfigurieren Sie die Wartungsnachricht.
4. Legen Sie fest, wer während der Wartung Zugriff haben soll.
5. Planen Sie optional einen automatischen Start und ein Ende der Wartung.

### Updates

1. Gehen Sie zu "Einstellungen" > "Updates".
2. Sehen Sie verfügbare Updates.
3. Lesen Sie die Release Notes.
4. Erstellen Sie ein Backup vor dem Update.
5. Klicken Sie auf "Update installieren".
6. Warten Sie, bis das Update abgeschlossen ist.
7. Überprüfen Sie die Anwendung nach dem Update.

### Leistungsoptimierung

1. Gehen Sie zu "Einstellungen" > "Leistung".
2. Sehen Sie Leistungsmetriken:
   - Seitenladedauer
   - Datenbankabfragen
   - API-Antwortzeiten
3. Konfigurieren Sie Caching-Einstellungen.
4. Optimieren Sie Datenbankindizes.
5. Konfigurieren Sie CDN-Einstellungen.

---

Dieses Administratorhandbuch bietet einen umfassenden Überblick über die Verwaltung der LemonWedding-Plattform. Bei weiteren Fragen oder Problemen wenden Sie sich bitte an das Entwicklerteam.

© 2025 LemonWedding. Alle Rechte vorbehalten.
