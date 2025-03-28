import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Übersetzungen
const resources = {
  de: {
    translation: {
      common: {
        loading: 'Laden',
        error: 'Fehler',
        save: 'Speichern',
        cancel: 'Abbrechen',
        edit: 'Bearbeiten',
        delete: 'Löschen',
        actions: 'Aktionen',
        search: 'Suchen',
        filter: 'Filtern',
        sort: 'Sortieren',
        noResults: 'Keine Ergebnisse gefunden',
        confirm: 'Bestätigen',
        back: 'Zurück',
        next: 'Weiter',
        submit: 'Absenden'
      },
      auth: {
        login: 'Anmelden',
        register: 'Registrieren',
        logout: 'Abmelden',
        email: 'E-Mail',
        password: 'Passwort',
        forgotPassword: 'Passwort vergessen?',
        resetPassword: 'Passwort zurücksetzen',
        confirmPassword: 'Passwort bestätigen',
        name: 'Name',
        loginSuccess: 'Erfolgreich angemeldet',
        registerSuccess: 'Erfolgreich registriert',
        logoutSuccess: 'Erfolgreich abgemeldet',
        passwordResetSuccess: 'Passwort erfolgreich zurückgesetzt',
        passwordResetEmailSent: 'E-Mail zum Zurücksetzen des Passworts wurde gesendet',
        invalidCredentials: 'Ungültige Anmeldedaten',
        passwordMismatch: 'Passwörter stimmen nicht überein',
        emailAlreadyInUse: 'E-Mail wird bereits verwendet',
        weakPassword: 'Passwort ist zu schwach',
        invalidEmail: 'Ungültige E-Mail-Adresse'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Willkommen',
        overview: 'Übersicht',
        statistics: 'Statistiken',
        recentActivity: 'Letzte Aktivitäten',
        upcomingTasks: 'Anstehende Aufgaben',
        countdown: 'Countdown',
        daysLeft: 'Tage bis zur Hochzeit',
        progress: 'Fortschritt',
        rsvpStats: 'RSVP-Statistiken',
        confirmed: 'Bestätigt',
        declined: 'Abgelehnt',
        pending: 'Ausstehend',
        totalGuests: 'Gesamtzahl der Gäste',
        budgetOverview: 'Budget-Übersicht',
        planned: 'Geplant',
        actual: 'Tatsächlich',
        remaining: 'Verbleibend'
      },
      guestManagement: {
        title: 'Gästeverwaltung',
        addGuest: 'Gast hinzufügen',
        editGuest: 'Gast bearbeiten',
        deleteGuest: 'Gast löschen',
        importGuests: 'Gäste importieren',
        exportGuests: 'Gäste exportieren',
        sendReminders: 'Erinnerungen senden',
        name: 'Name',
        email: 'E-Mail',
        phone: 'Telefon',
        rsvpStatus: 'RSVP-Status',
        dietaryRestrictions: 'Ernährungseinschränkungen',
        tableAssignment: 'Tischzuweisung',
        category: 'Kategorie',
        confirmed: 'Bestätigt',
        declined: 'Abgelehnt',
        pending: 'Ausstehend',
        family: 'Familie',
        friends: 'Freunde',
        colleagues: 'Kollegen',
        searchPlaceholder: 'Nach Namen, E-Mail oder Telefon suchen',
        allStatuses: 'Alle Status',
        allCategories: 'Alle Kategorien',
        statistics: 'Statistiken',
        relationships: 'Beziehungen',
        confirmDelete: 'Sind Sie sicher, dass Sie diesen Gast löschen möchten?',
        import: 'Importieren',
        export: 'Exportieren'
      },
      tablePlanner: {
        title: 'Tischplanung',
        addTable: 'Tisch hinzufügen',
        editTable: 'Tisch bearbeiten',
        deleteTable: 'Tisch löschen',
        tableName: 'Tischname',
        tableShape: 'Tischform',
        tableCapacity: 'Kapazität',
        round: 'Rund',
        rectangle: 'Rechteckig',
        oval: 'Oval',
        assignGuests: 'Gäste zuweisen',
        unassignedGuests: 'Nicht zugewiesene Gäste',
        aiAssistant: 'KI-Assistent',
        optimizeSeating: 'Sitzordnung optimieren',
        applyOptimization: 'Optimierung anwenden',
        cancelOptimization: 'Optimierung abbrechen',
        optimizationInProgress: 'Optimierung läuft...',
        optimizationComplete: 'Optimierung abgeschlossen',
        optimizationFailed: 'Optimierung fehlgeschlagen',
        guestPool: 'Gästepool',
        confirmDelete: 'Sind Sie sicher, dass Sie diesen Tisch löschen möchten?',
        saveArrangement: 'Anordnung speichern',
        loadArrangement: 'Anordnung laden',
        printLayout: 'Layout drucken'
      },
      budgetTracker: {
        title: 'Budgetverfolgung',
        addCategory: 'Kategorie hinzufügen',
        editCategory: 'Kategorie bearbeiten',
        deleteCategory: 'Kategorie löschen',
        addExpense: 'Ausgabe hinzufügen',
        editExpense: 'Ausgabe bearbeiten',
        deleteExpense: 'Ausgabe löschen',
        categoryName: 'Kategoriename',
        plannedAmount: 'Geplanter Betrag',
        actualAmount: 'Tatsächlicher Betrag',
        description: 'Beschreibung',
        date: 'Datum',
        amount: 'Betrag',
        category: 'Kategorie',
        receipt: 'Beleg',
        uploadReceipt: 'Beleg hochladen',
        viewReceipt: 'Beleg anzeigen',
        plannedBudget: 'Geplantes Budget',
        actualExpenses: 'Tatsächliche Ausgaben',
        remaining: 'Verbleibend',
        overBudget: 'Über Budget',
        underBudget: 'Unter Budget',
        exportReport: 'Bericht exportieren',
        confirmDelete: 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
        enterCategoryName: 'Kategoriename eingeben',
        enterPlannedAmount: 'Geplanten Betrag eingeben',
        enterDescription: 'Beschreibung eingeben',
        enterAmount: 'Betrag eingeben',
        enterCategoryId: 'Kategorie-ID eingeben',
        expensesFor: 'Ausgaben für',
        allExpenses: 'Alle Ausgaben',
        categories: 'Kategorien'
      },
      taskBoard: {
        title: 'Aufgabenverwaltung',
        addTask: 'Aufgabe hinzufügen',
        editTask: 'Aufgabe bearbeiten',
        deleteTask: 'Aufgabe löschen',
        taskTitle: 'Aufgabentitel',
        dueDate: 'Fälligkeitsdatum',
        priority: 'Priorität',
        completed: 'Erledigt',
        markComplete: 'Als erledigt markieren',
        markIncomplete: 'Als unerledigt markieren',
        high: 'Hoch',
        medium: 'Mittel',
        low: 'Niedrig',
        allTasks: 'Alle Aufgaben',
        completedTasks: 'Erledigte Aufgaben',
        pendingTasks: 'Ausstehende Aufgaben',
        sortByDueDate: 'Nach Fälligkeitsdatum sortieren',
        sortByPriority: 'Nach Priorität sortieren',
        sortByCreatedAt: 'Nach Erstellungsdatum sortieren',
        confirmDelete: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
        noTasks: 'Keine Aufgaben gefunden',
        totalTasks: 'Gesamtzahl der Aufgaben',
        enterTaskTitle: 'Aufgabentitel eingeben',
        enterDueDate: 'Fälligkeitsdatum eingeben (JJJJ-MM-TT)',
        enterPriority: 'Priorität eingeben (high, medium, low)'
      },
      settings: {
        title: 'Einstellungen',
        account: 'Konto',
        profile: 'Profil',
        security: 'Sicherheit',
        notifications: 'Benachrichtigungen',
        language: 'Sprache',
        theme: 'Design',
        darkMode: 'Dunkelmodus',
        lightMode: 'Hellmodus',
        updateProfile: 'Profil aktualisieren',
        changePassword: 'Passwort ändern',
        notificationPreferences: 'Benachrichtigungseinstellungen',
        emailNotifications: 'E-Mail-Benachrichtigungen',
        pushNotifications: 'Push-Benachrichtigungen',
        saveChanges: 'Änderungen speichern',
        german: 'Deutsch',
        english: 'Englisch',
        french: 'Französisch',
        spanish: 'Spanisch',
        weddingDate: 'Hochzeitsdatum',
        enterWeddingDate: 'Hochzeitsdatum eingeben'
      },
      guestPortal: {
        title: 'Gästeportal',
        invitation: 'Einladung',
        weddingInvitation: 'Hochzeitseinladung',
        hello: 'Hallo',
        invitationText: 'Wir laden Sie herzlich zu unserer Hochzeit ein!',
        rsvpQuestion: 'Werden Sie teilnehmen?',
        confirm: 'Ja, ich nehme teil',
        decline: 'Nein, ich kann leider nicht teilnehmen',
        dietaryRestrictions: 'Haben Sie Ernährungseinschränkungen?',
        dietaryRestrictionsPlaceholder: 'Bitte geben Sie Ihre Ernährungseinschränkungen an (z.B. vegetarisch, vegan, Allergien)',
        submit: 'Absenden',
        thankYou: 'Vielen Dank!',
        confirmedMessage: 'Wir freuen uns darauf, Sie bei unserer Hochzeit zu sehen.',
        declinedMessage: 'Wir bedauern, dass Sie nicht teilnehmen können. Vielen Dank für Ihre Antwort.',
        accessCode: 'Zugangscode',
        noAccessCode: 'Kein Zugangscode angegeben',
        invalidAccessCode: 'Ungültiger Zugangscode',
        error: 'Fehler',
        notFound: 'Nicht gefunden'
      },
      guestInvitation: {
        title: 'Wir heiraten!',
        subtitle: 'Sie sind herzlich eingeladen',
        hello: 'Liebe(r)',
        invitationText: 'Wir freuen uns, Sie zu unserer Hochzeit einzuladen. Bitte teilen Sie uns mit, ob Sie teilnehmen können.',
        dateAndTime: 'Datum & Uhrzeit',
        date: 'Samstag, 15. August 2025',
        time: '14:00 Uhr',
        location: 'Ort',
        venue: 'Schloss Schönbrunn',
        address: 'Schönbrunner Schloßstraße 47, 1130 Wien',
        rsvpButton: 'RSVP - Jetzt antworten',
        additionalInfo: 'Dresscode: Formelle Kleidung',
        contactInfo: 'Bei Fragen kontaktieren Sie uns bitte unter: hochzeit@example.com'
      },
      guestRSVP: {
        title: 'RSVP',
        subtitle: 'Bitte teilen Sie uns mit, ob Sie teilnehmen können',
        hello: 'Hallo',
        pleaseRespond: 'Bitte antworten Sie bis zum 15. Juli 2025',
        willYouAttend: 'Werden Sie an unserer Hochzeit teilnehmen?',
        yes: 'Ja, ich nehme teil',
        no: 'Nein, ich kann leider nicht teilnehmen',
        dietaryRestrictions: 'Haben Sie Ernährungseinschränkungen?',
        dietaryRestrictionsPlaceholder: 'Bitte geben Sie Ihre Ernährungseinschränkungen an (z.B. vegetarisch, vegan, Allergien)',
        submit: 'Antwort senden',
        thankYou: 'Vielen Dank für Ihre Antwort!',
        confirmedMessage: 'Wir freuen uns darauf, Sie bei unserer Hochzeit zu sehen.',
        declinedMessage: 'Wir bedauern, dass Sie nicht teilnehmen können. Vielen Dank für Ihre Antwort.',
        backToInvitation: 'Zurück zur Einladung'
      },
      admin: {
        title: 'Admin-Dashboard',
        users: 'Benutzer',
        sales: 'Verkäufe',
        subscriptions: 'Abonnements',
        analytics: 'Analysen',
        settings: 'Einstellungen',
        createUser: 'Benutzer erstellen',
        editUser: 'Benutzer bearbeiten',
        deleteUser: 'Benutzer löschen',
        userManagement: 'Benutzerverwaltung',
        roleManagement: 'Rollenverwaltung',
        subscriptionPlans: 'Abonnementpläne',
        paymentHistory: 'Zahlungsverlauf',
        systemSettings: 'Systemeinstellungen',
        emailTemplates: 'E-Mail-Vorlagen',
        customization: 'Anpassung',
        whiteLabel: 'White-Label',
        apiKeys: 'API-Schlüssel',
        documentation: 'Dokumentation',
        support: 'Support'
      }
    }
  },
  en: {
    translation: {
      common: {
        loading: 'Loading',
        error: 'Error',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        actions: 'Actions',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        noResults: 'No results found',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        submit: 'Submit'
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        resetPassword: 'Reset password',
        confirmPassword: 'Confirm password',
        name: 'Name',
        loginSuccess: 'Successfully logged in',
        registerSuccess: 'Successfully registered',
        logoutSuccess: 'Successfully logged out',
        passwordResetSuccess: 'Password successfully reset',
        passwordResetEmailSent: 'Password reset email has been sent',
        invalidCredentials: 'Invalid credentials',
        passwordMismatch: 'Passwords do not match',
        emailAlreadyInUse: 'Email is already in use',
        weakPassword: 'Password is too weak',
        invalidEmail: 'Invalid email address'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        overview: 'Overview',
        statistics: 'Statistics',
        recentActivity: 'Recent Activity',
        upcomingTasks: 'Upcoming Tasks',
        countdown: 'Countdown',
        daysLeft: 'Days until wedding',
        progress: 'Progress',
        rsvpStats: 'RSVP Statistics',
        confirmed: 'Confirmed',
        declined: 'Declined',
        pending: 'Pending',
        totalGuests: 'Total Guests',
        budgetOverview: 'Budget Overview',
        planned: 'Planned',
        actual: 'Actual',
        remaining: 'Remaining'
      },
      guestManagement: {
        title: 'Guest Management',
        addGuest: 'Add Guest',
        editGuest: 'Edit Guest',
        deleteGuest: 'Delete Guest',
        importGuests: 'Import Guests',
        exportGuests: 'Export Guests',
        sendReminders: 'Send Reminders',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        rsvpStatus: 'RSVP Status',
        dietaryRestrictions: 'Dietary Restrictions',
        tableAssignment: 'Table Assignment',
        category: 'Category',
        confirmed: 'Confirmed',
        declined: 'Declined',
        pending: 'Pending',
        family: 'Family',
        friends: 'Friends',
        colleagues: 'Colleagues',
        searchPlaceholder: 'Search by name, email, or phone',
        allStatuses: 'All Statuses',
        allCategories: 'All Categories',
        statistics: 'Statistics',
        relationships: 'Relationships',
        confirmDelete: 'Are you sure you want to delete this guest?',
        import: 'Import',
        export: 'Export'
      },
      tablePlanner: {
        title: 'Table Planner',
        addTable: 'Add Table',
        editTable: 'Edit Table',
        deleteTable: 'Delete Table',
        tableName: 'Table Name',
        tableShape: 'Table Shape',
        tableCapacity: 'Capacity',
        round: 'Round',
        rectangle: 'Rectangle',
        oval: 'Oval',
        assignGuests: 'Assign Guests',
        unassignedGuests: 'Unassigned Guests',
        aiAssistant: 'AI Assistant',
        optimizeSeating: 'Optimize Seating',
        applyOptimization: 'Apply Optimization',
        cancelOptimization: 'Cancel Optimization',
        optimizationInProgress: 'Optimization in progress...',
        optimizationComplete: 'Optimization complete',
        optimizationFailed: 'Optimization failed',
        guestPool: 'Guest Pool',
        confirmDelete: 'Are you sure you want to delete this table?',
        saveArrangement: 'Save Arrangement',
        loadArrangement: 'Load Arrangement',
        printLayout: 'Print Layout'
      },
      budgetTracker: {
        title: 'Budget Tracker',
        addCategory: 'Add Category',
        editCategory: 'Edit Category',
        deleteCategory: 'Delete Category',
        addExpense: 'Add Expense',
        editExpense: 'Edit Expense',
        deleteExpense: 'Delete Expense',
        categoryName: 'Category Name',
        plannedAmount: 'Planned Amount',
        actualAmount: 'Actual Amount',
        description: 'Description',
        date: 'Date',
        amount: 'Amount',
        category: 'Category',
        receipt: 'Receipt',
        uploadReceipt: 'Upload Receipt',
        viewReceipt: 'View Receipt',
        plannedBudget: 'Planned Budget',
        actualExpenses: 'Actual Expenses',
        remaining: 'Remaining',
        overBudget: 'Over Budget',
        underBudget: 'Under Budget',
        exportReport: 'Export Report',
        confirmDelete: 'Are you sure you want to delete this item?',
        enterCategoryName: 'Enter category name',
        enterPlannedAmount: 'Enter planned amount',
        enterDescription: 'Enter description',
        enterAmount: 'Enter amount',
        enterCategoryId: 'Enter category ID',
        expensesFor: 'Expenses for',
        allExpenses: 'All Expenses',
        categories: 'Categories'
      },
      taskBoard: {
        title: 'Task Board',
        addTask: 'Add Task',
        editTask: 'Edit Task',
        deleteTask: 'Delete Task',
        taskTitle: 'Task Title',
        dueDate: 'Due Date',
        priority: 'Priority',
        completed: 'Completed',
        markComplete: 'Mark as Complete',
        markIncomplete: 'Mark as Incomplete',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        allTasks: 'All Tasks',
        completedTasks: 'Completed Tasks',
        pendingTasks: 'Pending Tasks',
        sortByDueDate: 'Sort by Due Date',
        sortByPriority: 'Sort by Priority',
        sortByCreatedAt: 'Sort by Created Date',
        confirmDelete: 'Are you sure you want to delete this task?',
        noTasks: 'No tasks found',
        totalTasks: 'Total Tasks',
        enterTaskTitle: 'Enter task title',
        enterDueDate: 'Enter due date (YYYY-MM-DD)',
        enterPriority: 'Enter priority (high, medium, low)'
      },
      settings: {
        title: 'Settings',
        account: 'Account',
        profile: 'Profile',
        security: 'Security',
        notifications: 'Notifications',
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        updateProfile: 'Update Profile',
        changePassword: 'Change Password',
        notificationPreferences: 'Notification Preferences',
        emailNotifications: 'Email Notifications',
        pushNotifications: 'Push Notifications',
        saveChanges: 'Save Changes',
        german: 'German',
        english: 'English',
        french: 'French',
        spanish: 'Spanish',
        weddingDate: 'Wedding Date',
        enterWeddingDate: 'Enter wedding date'
      },
      guestPortal: {
        title: 'Guest Portal',
        invitation: 'Invitation',
        weddingInvitation: 'Wedding Invitation',
        hello: 'Hello',
        invitationText: 'We cordially invite you to our wedding!',
        rsvpQuestion: 'Will you attend?',
        confirm: 'Yes, I will attend',
        decline: 'No, I cannot attend',
        dietaryRestrictions: 'Do you have any dietary restrictions?',
        dietaryRestrictionsPlaceholder: 'Please specify your dietary restrictions (e.g., vegetarian, vegan, allergies)',
        submit: 'Submit',
        thankYou: 'Thank you!',
        confirmedMessage: 'We look forward to seeing you at our wedding.',
        declinedMessage: 'We regret that you cannot attend. Thank you for your response.',
        accessCode: 'Access Code',
        noAccessCode: 'No access code provided',
        invalidAccessCode: 'Invalid access code',
        error: 'Error',
        notFound: 'Not Found'
      },
      guestInvitation: {
        title: 'We\'re Getting Married!',
        subtitle: 'You are cordially invited',
        hello: 'Dear',
        invitationText: 'We are delighted to invite you to our wedding. Please let us know if you can attend.',
        dateAndTime: 'Date & Time',
        date: 'Saturday, August 15, 2025',
        time: '2:00 PM',
        location: 'Location',
        venue: 'Schönbrunn Palace',
        address: 'Schönbrunner Schloßstraße 47, 1130 Vienna',
        rsvpButton: 'RSVP - Respond Now',
        additionalInfo: 'Dress Code: Formal Attire',
        contactInfo: 'For any questions, please contact us at: wedding@example.com'
      },
      guestRSVP: {
        title: 'RSVP',
        subtitle: 'Please let us know if you can attend',
        hello: 'Hello',
        pleaseRespond: 'Please respond by July 15, 2025',
        willYouAttend: 'Will you attend our wedding?',
        yes: 'Yes, I will attend',
        no: 'No, I cannot attend',
        dietaryRestrictions: 'Do you have any dietary restrictions?',
        dietaryRestrictionsPlaceholder: 'Please specify your dietary restrictions (e.g., vegetarian, vegan, allergies)',
        submit: 'Send Response',
        thankYou: 'Thank you for your response!',
        confirmedMessage: 'We look forward to seeing you at our wedding.',
        declinedMessage: 'We regret that you cannot attend. Thank you for your response.',
        backToInvitation: 'Back to Invitation'
      },
      admin: {
        title: 'Admin Dashboard',
        users: 'Users',
        sales: 'Sales',
        subscriptions: 'Subscriptions',
        analytics: 'Analytics',
        settings: 'Settings',
        createUser: 'Create User',
        editUser: 'Edit User',
        deleteUser: 'Delete User',
        userManagement: 'User Management',
        roleManagement: 'Role Management',
        subscriptionPlans: 'Subscription Plans',
        paymentHistory: 'Payment History',
        systemSettings: 'System Settings',
        emailTemplates: 'Email Templates',
        customization: 'Customization',
        whiteLabel: 'White Label',
        apiKeys: 'API Keys',
        documentation: 'Documentation',
        support: 'Support'
      }
    }
  },
  fr: {
    translation: {
      common: {
        loading: 'Chargement',
        error: 'Erreur',
        save: 'Enregistrer',
        cancel: 'Annuler',
        edit: 'Modifier',
        delete: 'Supprimer',
        actions: 'Actions',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        noResults: 'Aucun résultat trouvé',
        confirm: 'Confirmer',
        back: 'Retour',
        next: 'Suivant',
        submit: 'Soumettre'
      },
      // Weitere Übersetzungen für Französisch...
    }
  },
  es: {
    translation: {
      common: {
        loading: 'Cargando',
        error: 'Error',
        save: 'Guardar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Eliminar',
        actions: 'Acciones',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        noResults: 'No se encontraron resultados',
        confirm: 'Confirmar',
        back: 'Atrás',
        next: 'Siguiente',
        submit: 'Enviar'
      },
      // Weitere Übersetzungen für Spanisch...
    }
  }
};

// i18n initialisieren
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'fr', 'es'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
