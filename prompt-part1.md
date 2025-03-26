# Aufgabe: Integration und Verbesserung zweier Hochzeits-App Repositories

## Ausgangssituation und Ziel

Ich habe zwei GitHub-Repositories für eine Hochzeitsplanungs-App:
- https://github.com/LemonHarbor/HochzeitsappReally
- https://github.com/LemonHarbor/LemonWedding

Deine Aufgabe ist es, diese Repositories zu analysieren, zu vergleichen und zu einer vollständig funktionierenden Web-App zusammenzuführen. LemonWedding ist bereits mit Supabase verbunden und soll als Basis-Repository dienen. Das Endergebnis soll eine vollständige, funktionsfähige No-Code-Webanwendung sein.

## Spezifikationen beider Apps

### LemonWedding Struktur:
```
graph TD
    A[User Logs In] --> B[Dashboard Home]
    
    %% Main Dashboard Navigation
    B --> C[View Wedding Countdown]
    B --> D[Check Progress Indicators]
    B --> E[View RSVP Statistics]
    B --> F[See Upcoming Tasks]
    B --> G[Access Main Features]
    
    %% Main Feature Navigation
    G --> H[Guest Management]
    G --> I[Table Planning]
    G --> J[Budget Tracking]
    G --> K[Language Settings]
    
    %% Guest Management Flow
    H --> H1[View Guest List]
    H1 --> H2[Add New Guest]
    H1 --> H3[Edit Guest Details]
    H1 --> H4[Delete Guest]
    H1 --> H5[Track RSVPs]
    H1 --> H6[Manage Dietary Restrictions]
    H1 --> H7[Import Contacts]
    H1 --> H8[Export Guest List]
    H5 --> H5a[View RSVP Status]
    H5 --> H5b[Send RSVP Reminders]
    
    %% Table Planning Flow
    I --> I1[View Table Layout]
    I1 --> I2[Add New Table]
    I1 --> I3[Change Table Shape]
    I1 --> I4[Remove Table]
    I1 --> I5[Drag & Drop Guests]
    I1 --> I6[Use AI Seating Assistant]
    I6 --> I6a[Review AI Suggestions]
    I6a --> I6b[Accept Suggestions]
    I6a --> I6c[Modify Suggestions]
    
    %% Budget Tracking Flow
    J --> J1[View Budget Overview]
    J1 --> J2[Add Budget Category]
    J1 --> J3[Set Budget Amounts]
    J1 --> J4[Record Expense]
    J1 --> J5[View Planned vs Actual]
    J5 --> J5a[See Visual Breakdown]
    J5 --> J5b[Export Budget Report]
    
    %% Language Settings Flow
    K --> K1{Select Language}
    K1 -->|German| K2[Apply German]
    K1 -->|English| K3[Apply English]
    K1 -->|French| K4[Apply French]
    K1 -->|Spanish| K5[Apply Spanish]
    K2 --> B
    K3 --> B
    K4 --> B
    K5 --> B
    
    %% Task Management
    F --> F1[View Task List]
    F1 --> F2[Add New Task]
    F1 --> F3[Mark Task Complete]
    F1 --> F4[Edit Task Details]
    F1 --> F5[Delete Task]
    
    %% Dashboard Updates
    C --> B
    D --> B
    E --> B
    F --> B
```

### HochzeitsappReally Struktur:
```
graph TD
    Start[User Opens Wedding Planner App] --> Auth{Authentication}
    Auth -->|New User| Register[Register Account]
    Auth -->|Existing User| Login[Login]
    Register --> RoleSelect[Select Role: Couple/Best Man/Maid of Honor/Guest]
    RoleSelect --> Dashboard
    Login --> Dashboard[Access Dashboard]
    
    subgraph Dashboard
      Header[Header: Dark Mode Toggle & Language Switcher DE/EN]
      NavMenu[Navigation Menu]
      Stats[Wedding Statistics Overview]
    end
    
    Dashboard --> GuestManagement[Guest Management]
    Dashboard --> TablePlanner[Table Planner]
    Dashboard --> Settings[Account Settings]
    
    subgraph GuestManagement
      ViewGuests[View Guest List]
      AddGuest[Add New Guest]
      EditGuest[Edit Guest Details]
      DeleteGuest[Remove Guest]
      CategorizeGuests[Categorize Guests: Family/Friends/Colleagues]
      TrackRSVP[Track RSVP Status]
      SendInvites[Send Digital Invites]
      ExportList[Export Guest List]
    end
    
    subgraph TablePlanner
      ViewTables[View Current Table Arrangement]
      AddTable[Add New Table]
      EditTable[Edit Table Properties]
      DeleteTable[Remove Table]
      ChangeShape[Change Table Shape: Round/Rectangle/Custom]
      AssignSeats[Assign Guests to Seats]
      DragDrop[Drag and Drop Guests Between Tables]
      AIOptimize[AI-Assisted Seating Optimization]
      SaveArrangement[Save Table Arrangement]
    end
    
    subgraph Settings
      ChangePassword[Change Password]
      UpdateProfile[Update Profile Information]
      ManagePermissions[Manage Role Permissions]
      NotificationPrefs[Set Notification Preferences]
    end
    
    GuestManagement --> WebSocketUpdate{Real-time Update}
    TablePlanner --> WebSocketUpdate
    WebSocketUpdate --> SyncDevices[Sync Changes Across All Devices]
    
    subgraph GuestAccess
      GuestLogin[Guest Login with Code]
      ViewInvite[View Digital Invitation]
      SubmitRSVP[Submit RSVP Response]
      DietaryRestrictions[Specify Dietary Restrictions]
      ViewSeating[View Assigned Seating]
    end
    
    Auth -->|Guest Access Code| GuestAccess
    
    subgraph RoleBasedPermissions
      CouplePerms[Couple: Full Access]
      HonorPerms[Best Man/Maid of Honor: Limited Edit Access]
      GuestPerms[Guest: View-Only Access]
    end
    
    Login --> RoleBasedPermissions
    RoleBasedPermissions --> Dashboard
    
    subgraph ErrorHandling
      ConnectionError[Handle Connection Issues]
      ValidationError[Form Validation Errors]
      PermissionDenied[Permission Denied Alerts]
      SyncError[Synchronization Errors]
    end
    
    WebSocketUpdate -->|Failure| ErrorHandling
    GuestManagement -->|Invalid Input| ErrorHandling
    TablePlanner -->|Invalid Action| ErrorHandling
```

## Zu integrierende Funktionen und Features

Nach der Analyse beider Apps sollen folgende Komponenten und Funktionen in die integrierte App übernommen werden:

### Aus beiden Apps:
1. **Gästemanagement**
   - Gästeliste verwalten (hinzufügen, bearbeiten, löschen)
   - RSVP-Tracking und Erinnerungen
   - Import/Export-Funktionen
   - Kategorisierung von Gästen (Familie/Freunde/Kollegen)

2. **Tischplanung**
   - Tischanordnung visualisieren
   - Verschiedene Tischformen (rund/rechteckig/benutzerdefiniert)
   - Drag & Drop Gästeplatzierung
   - KI-gestützter Sitzplatzassistent

### Spezifisch aus LemonWedding:
1. **Budgetverfolgung**
   - Übersicht über geplante vs. tatsächliche Ausgaben
   - Budgetkategorien hinzufügen
   - Ausgaben erfassen
   - Visuelle Aufbereitung und Export

2. **Aufgabenverwaltung**
   - Aufgabenliste anzeigen
   - Aufgaben hinzufügen/bearbeiten/löschen
   - Aufgaben als erledigt markieren

3. **Erweiterte Mehrsprachigkeit**
   - Unterstützung für Deutsch, Englisch, Französisch und Spanisch

### Spezifisch aus HochzeitsappReally:
1. **Rollenbasiertes Berechtigungssystem**
   - Unterschiedliche Zugriffsebenen für Brautpaar, Trauzeugen und Gäste
   - Berechtigungsverwaltung im Einstellungsbereich

2. **Echtzeit-Synchronisation**
   - WebSocket-basierte Updates für mehrere Geräte
   - Fehlerbehandlung für Synchronisationsprobleme

3. **Gästeportal**
   - Gästezugang mit eindeutigem Code
   - Digitale Einladungen
   - RSVP-Einreichung durch Gäste
   - Angabe von Ernährungseinschränkungen

4. **UI-Erweiterungen**
   - Dark Mode
   - Erweiterte Fehlerbehandlung

## Technische Details LemonWedding

LemonWedding ist ein modernes Frontend-Projekt mit folgendem Stack:
- React (JavaScript-Bibliothek)
- TypeScript (Statisch typisierte JavaScript-Erweiterung)
- Vite (Build-Tool und Dev-Server)

Das Projekt nutzt die offizielle Vite-Template-Konfiguration mit HMR (Hot Module Replacement) und ESLint-Regeln. Es verwendet eines der folgenden offiziellen Plugins:
- @vitejs/plugin-react (verwendet Babel für Fast Refresh)
- @vitejs/plugin-react-swc (verwendet SWC für Fast Refresh)

### Supabase-Integration

Das Projekt verwendet Supabase als Backend und hat bereits eine vollständige Datenbankstruktur implementiert.

#### Bestehende Datenbanktabellen:

1. **tasks**
   - Aufgabenverwaltung mit Prioritäten und Fälligkeitsdaten
   - Felder: id, user_id, title, due_date, priority ('high', 'medium', 'low'), completed, created_at, updated_at

2. **guests**
   - Gästeverwaltung
   - Felder: id, user_id, name, email, phone, rsvp_status ('confirmed', 'declined', 'pending'), dietary_restrictions, table_assignment, created_at, updated_at

3. **tables**
   - Tischverwaltung für die Sitzordnung
   - Felder: id, user_id, name, shape ('round', 'rectangle', 'oval'), capacity, created_at, updated_at

4. **guest_relationships**
   - Speichert Präferenzen und Konflikte zwischen Gästen
   - Felder: id, user_id, guest_id, related_guest_id, relationship_type ('preference', 'conflict'), created_at

5. **budget_categories**
   - Budgetkategorien für die Hochzeitsplanung
   - Felder: id, user_id, name, planned_amount, actual_amount, created_at, updated_at

#### Sicherheitsfeatures:

- Alle Tabellen haben Row-Level Security (RLS) aktiviert
- Policies für SELECT, INSERT, UPDATE und DELETE sind bereits definiert
- Jede Policy verwendet auth.uid() = user_id für Sicherheitsvalidierung

#### Echtzeit-Funktionalität:

- Alle Tabellen sind für Supabase Realtime aktiviert
- Dies ermöglicht Echtzeit-Updates über mehrere Geräte

#### Edge Functions:

Im Repository gibt es eine Supabase Edge Function (index.ts) für das Versenden von RSVP-Erinnerungen:
- Abfrage von Gästen mit ausstehenden RSVP-Status
- Simulation des E-Mail-Versands
- Protokollierung in einer email_logs-Tabelle

## Technische Anforderungen

1. **Basisinfrastruktur**
   - LemonWedding als Basis-Repository verwenden (React + TypeScript + Vite)
   - Supabase für Backend und Datenbank
   - Erweitertes Datenbankschema (siehe unten)
   - Rein browserbasierte Anwendung ohne native App-Installation

2. **Frontend**
   - Mobile-First-Ansatz als zentrale Designstrategie
   - Progressive Web App (PWA) mit Offline-Fähigkeiten
   - Optimierung für Touch-Geräte
   - Reaktives UI mit moderner Komponentenstruktur
   - Responsives Design für alle Geräte
   - Theme-Support (Light/Dark Mode)
   - Mehrsprachigkeit (DE, EN, FR, ES)

3. **Backend**
   - Authentifizierung mit Rollenkonzept über Supabase
   - CRUD-Operationen für alle Entitäten
   - Erweiterung der bestehenden Supabase Realtime-Funktionalität
   - Fehlerbehandlung und Validierung
