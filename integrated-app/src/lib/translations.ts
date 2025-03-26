import { LanguageCode } from "./i18n";

export type TranslationKey =
  | "dashboard.title"
  | "dashboard.countdown"
  | "dashboard.days"
  | "dashboard.hours"
  | "dashboard.minutes"
  | "dashboard.seconds"
  | "dashboard.progress"
  | "dashboard.complete"
  | "dashboard.rsvp"
  | "dashboard.attending"
  | "dashboard.declined"
  | "dashboard.pending"
  | "dashboard.tasks"
  | "dashboard.upcoming"
  | "dashboard.overdue"
  | "dashboard.completed"
  | "dashboard.categories"
  | "dashboard.filter"
  | "dashboard.sendReminders"
  | "dashboard.remindersSent"
  | "dashboard.remindersSentDesc"
  | "dashboard.noRemindersSent"
  | "dashboard.guestManagement"
  | "dashboard.tablePlanning"
  | "dashboard.budgetTracking"
  | "dashboard.tablePlanner.title"
  | "dashboard.tablePlanner.addTable"
  | "dashboard.tablePlanner.removeTable"
  | "dashboard.tablePlanner.tableShape"
  | "dashboard.tablePlanner.round"
  | "dashboard.tablePlanner.rectangular"
  | "dashboard.tablePlanner.oval"
  | "dashboard.tablePlanner.capacity"
  | "dashboard.tablePlanner.tableName"
  | "dashboard.tablePlanner.assignGuests"
  | "dashboard.tablePlanner.unassignedGuests"
  | "dashboard.tablePlanner.saveLayout"
  | "dashboard.tablePlanner.aiAssistant"
  | "dashboard.tablePlanner.generateSeating"
  | "dashboard.tablePlanner.reviewSuggestions"
  | "dashboard.tablePlanner.acceptSuggestions"
  | "dashboard.tablePlanner.modifySuggestions"
  | "dashboard.tablePlanner.printLayout"
  | "dashboard.guestList.name"
  | "dashboard.guestList.email"
  | "dashboard.guestList.phone"
  | "dashboard.guestList.rsvpStatus"
  | "dashboard.guestList.dietaryRestrictions"
  | "dashboard.guestList.tableAssignment"
  | "dashboard.guestList.addGuest"
  | "dashboard.guestList.importGuests"
  | "dashboard.guestList.exportGuests"
  | "dashboard.guestList.filterGuests"
  | "dashboard.guestList.searchGuests"
  | "dashboard.guestList.printList"
  | "dashboard.budget.overview"
  | "dashboard.budget.category"
  | "dashboard.budget.planned"
  | "dashboard.budget.actual"
  | "dashboard.budget.remaining"
  | "dashboard.budget.addCategory"
  | "dashboard.budget.addExpense"
  | "dashboard.budget.date"
  | "dashboard.budget.amount"
  | "dashboard.budget.description"
  | "dashboard.budget.vendor"
  | "dashboard.budget.exportReport"
  | "common.save"
  | "common.cancel"
  | "common.edit"
  | "common.delete"
  | "common.add"
  | "common.search"
  | "common.filter"
  | "common.sort"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.confirm"
  | "common.back"
  | "common.next"
  | "common.finish"
  | "common.close";

type Translations = {
  [key in LanguageCode]: {
    [key in TranslationKey]: string;
  };
};

export const translations: Translations = {
  en: {
    "dashboard.title": "Wedding Dashboard",
    "dashboard.countdown": "Wedding Countdown",
    "dashboard.days": "Days",
    "dashboard.hours": "Hours",
    "dashboard.minutes": "Minutes",
    "dashboard.seconds": "Seconds",
    "dashboard.progress": "Planning Progress",
    "dashboard.complete": "Complete",
    "dashboard.rsvp": "RSVP Statistics",
    "dashboard.attending": "Attending",
    "dashboard.declined": "Declined",
    "dashboard.pending": "Pending",
    "dashboard.tasks": "Tasks",
    "dashboard.upcoming": "Upcoming",
    "dashboard.overdue": "Overdue",
    "dashboard.completed": "Completed",
    "dashboard.categories": "Categories",
    "dashboard.filter": "Filter by Category",
    "dashboard.sendReminders": "Send Reminders",
    "dashboard.remindersSent": "Reminders Sent",
    "dashboard.remindersSentDesc":
      "Guests have been notified about your wedding invitation",
    "dashboard.noRemindersSent": "No reminders were sent",
    "dashboard.guestManagement": "Guest Management",
    "dashboard.tablePlanning": "Table Planning",
    "dashboard.budgetTracking": "Budget Tracking",
    "dashboard.tablePlanner.title": "Table Planner",
    "dashboard.tablePlanner.addTable": "Add Table",
    "dashboard.tablePlanner.removeTable": "Remove Table",
    "dashboard.tablePlanner.tableShape": "Table Shape",
    "dashboard.tablePlanner.round": "Round",
    "dashboard.tablePlanner.rectangular": "Rectangular",
    "dashboard.tablePlanner.oval": "Oval",
    "dashboard.tablePlanner.capacity": "Capacity",
    "dashboard.tablePlanner.tableName": "Table Name",
    "dashboard.tablePlanner.assignGuests": "Assign Guests",
    "dashboard.tablePlanner.unassignedGuests": "Unassigned Guests",
    "dashboard.tablePlanner.saveLayout": "Save Layout",
    "dashboard.tablePlanner.aiAssistant": "AI Seating Assistant",
    "dashboard.tablePlanner.generateSeating": "Generate Seating Plan",
    "dashboard.tablePlanner.reviewSuggestions": "Review Suggestions",
    "dashboard.tablePlanner.acceptSuggestions": "Accept Suggestions",
    "dashboard.tablePlanner.modifySuggestions": "Modify Suggestions",
    "dashboard.tablePlanner.printLayout": "Print Layout",
    "dashboard.guestList.name": "Name",
    "dashboard.guestList.email": "Email",
    "dashboard.guestList.phone": "Phone",
    "dashboard.guestList.rsvpStatus": "RSVP Status",
    "dashboard.guestList.dietaryRestrictions": "Dietary Restrictions",
    "dashboard.guestList.tableAssignment": "Table Assignment",
    "dashboard.guestList.addGuest": "Add Guest",
    "dashboard.guestList.importGuests": "Import Guests",
    "dashboard.guestList.exportGuests": "Export Guest List",
    "dashboard.guestList.filterGuests": "Filter Guests",
    "dashboard.guestList.searchGuests": "Search Guests",
    "dashboard.guestList.printList": "Print Guest List",
    "dashboard.budget.overview": "Budget Overview",
    "dashboard.budget.category": "Category",
    "dashboard.budget.planned": "Planned",
    "dashboard.budget.actual": "Actual",
    "dashboard.budget.remaining": "Remaining",
    "dashboard.budget.addCategory": "Add Category",
    "dashboard.budget.addExpense": "Add Expense",
    "dashboard.budget.date": "Date",
    "dashboard.budget.amount": "Amount",
    "dashboard.budget.description": "Description",
    "dashboard.budget.vendor": "Vendor",
    "dashboard.budget.exportReport": "Export Budget Report",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.finish": "Finish",
    "common.close": "Close",
  },
  de: {
    "dashboard.title": "Hochzeits-Dashboard",
    "dashboard.countdown": "Hochzeitscountdown",
    "dashboard.days": "Tage",
    "dashboard.hours": "Stunden",
    "dashboard.minutes": "Minuten",
    "dashboard.seconds": "Sekunden",
    "dashboard.progress": "Planungsfortschritt",
    "dashboard.complete": "Abgeschlossen",
    "dashboard.rsvp": "RSVP-Statistiken",
    "dashboard.attending": "Teilnehmend",
    "dashboard.declined": "Abgelehnt",
    "dashboard.pending": "Ausstehend",
    "dashboard.tasks": "Aufgaben",
    "dashboard.upcoming": "Bevorstehend",
    "dashboard.overdue": "Überfällig",
    "dashboard.completed": "Abgeschlossen",
    "dashboard.categories": "Kategorien",
    "dashboard.filter": "Nach Kategorie filtern",
    "dashboard.sendReminders": "Erinnerungen senden",
    "dashboard.remindersSent": "Erinnerungen gesendet",
    "dashboard.remindersSentDesc":
      "Gäste wurden über Ihre Hochzeitseinladung informiert",
    "dashboard.noRemindersSent": "Keine Erinnerungen gesendet",
    "dashboard.guestManagement": "Gästeverwaltung",
    "dashboard.tablePlanning": "Tischplanung",
    "dashboard.budgetTracking": "Budgetverfolgung",
    "dashboard.tablePlanner.title": "Tischplaner",
    "dashboard.tablePlanner.addTable": "Tisch hinzufügen",
    "dashboard.tablePlanner.removeTable": "Tisch entfernen",
    "dashboard.tablePlanner.tableShape": "Tischform",
    "dashboard.tablePlanner.round": "Rund",
    "dashboard.tablePlanner.rectangular": "Rechteckig",
    "dashboard.tablePlanner.oval": "Oval",
    "dashboard.tablePlanner.capacity": "Kapazität",
    "dashboard.tablePlanner.tableName": "Tischname",
    "dashboard.tablePlanner.assignGuests": "Gäste zuweisen",
    "dashboard.tablePlanner.unassignedGuests": "Nicht zugewiesene Gäste",
    "dashboard.tablePlanner.saveLayout": "Layout speichern",
    "dashboard.tablePlanner.aiAssistant": "KI-Sitzplatzassistent",
    "dashboard.tablePlanner.generateSeating": "Sitzplan generieren",
    "dashboard.tablePlanner.reviewSuggestions": "Vorschläge überprüfen",
    "dashboard.tablePlanner.acceptSuggestions": "Vorschläge akzeptieren",
    "dashboard.tablePlanner.modifySuggestions": "Vorschläge ändern",
    "dashboard.tablePlanner.printLayout": "Layout drucken",
    "dashboard.guestList.name": "Name",
    "dashboard.guestList.email": "E-Mail",
    "dashboard.guestList.phone": "Telefon",
    "dashboard.guestList.rsvpStatus": "RSVP-Status",
    "dashboard.guestList.dietaryRestrictions": "Ernährungseinschränkungen",
    "dashboard.guestList.tableAssignment": "Tischzuweisung",
    "dashboard.guestList.addGuest": "Gast hinzufügen",
    "dashboard.guestList.importGuests": "Gäste importieren",
    "dashboard.guestList.exportGuests": "Gästeliste exportieren",
    "dashboard.guestList.filterGuests": "Gäste filtern",
    "dashboard.guestList.searchGuests": "Gäste suchen",
    "dashboard.guestList.printList": "Gästeliste drucken",
    "dashboard.budget.overview": "Budgetübersicht",
    "dashboard.budget.category": "Kategorie",
    "dashboard.budget.planned": "Geplant",
    "dashboard.budget.actual": "Tatsächlich",
    "dashboard.budget.remaining": "Verbleibend",
    "dashboard.budget.addCategory": "Kategorie hinzufügen",
    "dashboard.budget.addExpense": "Ausgabe hinzufügen",
    "dashboard.budget.date": "Datum",
    "dashboard.budget.amount": "Betrag",
    "dashboard.budget.description": "Beschreibung",
    "dashboard.budget.vendor": "Anbieter",
    "dashboard.budget.exportReport": "Budgetbericht exportieren",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.edit": "Bearbeiten",
    "common.delete": "Löschen",
    "common.add": "Hinzufügen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.sort": "Sortieren",
    "common.loading": "Wird geladen...",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.confirm": "Bestätigen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.finish": "Fertigstellen",
    "common.close": "Schließen",
  },
  fr: {
    "dashboard.title": "Tableau de Bord de Mariage",
    "dashboard.countdown": "Compte à Rebours du Mariage",
    "dashboard.days": "Jours",
    "dashboard.hours": "Heures",
    "dashboard.minutes": "Minutes",
    "dashboard.seconds": "Secondes",
    "dashboard.progress": "Progression de la Planification",
    "dashboard.complete": "Terminé",
    "dashboard.rsvp": "Statistiques RSVP",
    "dashboard.attending": "Présent",
    "dashboard.declined": "Refusé",
    "dashboard.pending": "En attente",
    "dashboard.tasks": "Tâches",
    "dashboard.upcoming": "À venir",
    "dashboard.overdue": "En retard",
    "dashboard.completed": "Terminé",
    "dashboard.categories": "Catégories",
    "dashboard.filter": "Filtrer par catégorie",
    "dashboard.sendReminders": "Envoyer des Rappels",
    "dashboard.remindersSent": "Rappels envoyés",
    "dashboard.remindersSentDesc":
      "Les invités ont été informés de votre invitation de mariage",
    "dashboard.noRemindersSent": "Aucun rappel envoyé",
    "dashboard.guestManagement": "Gestion des Invités",
    "dashboard.tablePlanning": "Planification des Tables",
    "dashboard.budgetTracking": "Suivi du Budget",
    "dashboard.tablePlanner.title": "Planificateur de Tables",
    "dashboard.tablePlanner.addTable": "Ajouter une Table",
    "dashboard.tablePlanner.removeTable": "Supprimer la Table",
    "dashboard.tablePlanner.tableShape": "Forme de la Table",
    "dashboard.tablePlanner.round": "Ronde",
    "dashboard.tablePlanner.rectangular": "Rectangulaire",
    "dashboard.tablePlanner.oval": "Ovale",
    "dashboard.tablePlanner.capacity": "Capacité",
    "dashboard.tablePlanner.tableName": "Nom de la Table",
    "dashboard.tablePlanner.assignGuests": "Assigner des Invités",
    "dashboard.tablePlanner.unassignedGuests": "Invités Non Assignés",
    "dashboard.tablePlanner.saveLayout": "Enregistrer la Disposition",
    "dashboard.tablePlanner.aiAssistant": "Assistant IA de Placement",
    "dashboard.tablePlanner.generateSeating": "Générer un Plan de Table",
    "dashboard.tablePlanner.reviewSuggestions": "Examiner les Suggestions",
    "dashboard.tablePlanner.acceptSuggestions": "Accepter les Suggestions",
    "dashboard.tablePlanner.modifySuggestions": "Modifier les Suggestions",
    "dashboard.tablePlanner.printLayout": "Imprimer la Disposition",
    "dashboard.guestList.name": "Nom",
    "dashboard.guestList.email": "Email",
    "dashboard.guestList.phone": "Téléphone",
    "dashboard.guestList.rsvpStatus": "Statut RSVP",
    "dashboard.guestList.dietaryRestrictions": "Restrictions Alimentaires",
    "dashboard.guestList.tableAssignment": "Attribution de Table",
    "dashboard.guestList.addGuest": "Ajouter un Invité",
    "dashboard.guestList.importGuests": "Importer des Invités",
    "dashboard.guestList.exportGuests": "Exporter la Liste d'Invités",
    "dashboard.guestList.filterGuests": "Filtrer les Invités",
    "dashboard.guestList.searchGuests": "Rechercher des Invités",
    "dashboard.guestList.printList": "Imprimer la Liste d'Invités",
    "dashboard.budget.overview": "Aperçu du Budget",
    "dashboard.budget.category": "Catégorie",
    "dashboard.budget.planned": "Prévu",
    "dashboard.budget.actual": "Réel",
    "dashboard.budget.remaining": "Restant",
    "dashboard.budget.addCategory": "Ajouter une Catégorie",
    "dashboard.budget.addExpense": "Ajouter une Dépense",
    "dashboard.budget.date": "Date",
    "dashboard.budget.amount": "Montant",
    "dashboard.budget.description": "Description",
    "dashboard.budget.vendor": "Fournisseur",
    "dashboard.budget.exportReport": "Exporter le Rapport de Budget",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.sort": "Trier",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.confirm": "Confirmer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.finish": "Terminer",
    "common.close": "Fermer",
  },
  es: {
    "dashboard.title": "Panel de Control de Boda",
    "dashboard.countdown": "Cuenta Regresiva para la Boda",
    "dashboard.days": "Días",
    "dashboard.hours": "Horas",
    "dashboard.minutes": "Minutos",
    "dashboard.seconds": "Segundos",
    "dashboard.progress": "Progreso de Planificación",
    "dashboard.complete": "Completado",
    "dashboard.rsvp": "Estadísticas de RSVP",
    "dashboard.attending": "Asistirá",
    "dashboard.declined": "Rechazado",
    "dashboard.pending": "Pendiente",
    "dashboard.tasks": "Tareas",
    "dashboard.upcoming": "Próximas",
    "dashboard.overdue": "Atrasadas",
    "dashboard.completed": "Completadas",
    "dashboard.categories": "Categorías",
    "dashboard.filter": "Filtrar por categoría",
    "dashboard.sendReminders": "Enviar Recordatorios",
    "dashboard.remindersSent": "Recordatorios enviados",
    "dashboard.remindersSentDesc":
      "Los invitados han sido notificados sobre tu invitación de boda",
    "dashboard.noRemindersSent": "No se enviaron recordatorios",
    "dashboard.guestManagement": "Gestión de Invitados",
    "dashboard.tablePlanning": "Planificación de Mesas",
    "dashboard.budgetTracking": "Seguimiento de Presupuesto",
    "dashboard.tablePlanner.title": "Planificador de Mesas",
    "dashboard.tablePlanner.addTable": "Añadir Mesa",
    "dashboard.tablePlanner.removeTable": "Eliminar Mesa",
    "dashboard.tablePlanner.tableShape": "Forma de la Mesa",
    "dashboard.tablePlanner.round": "Redonda",
    "dashboard.tablePlanner.rectangular": "Rectangular",
    "dashboard.tablePlanner.oval": "Ovalada",
    "dashboard.tablePlanner.capacity": "Capacidad",
    "dashboard.tablePlanner.tableName": "Nombre de la Mesa",
    "dashboard.tablePlanner.assignGuests": "Asignar Invitados",
    "dashboard.tablePlanner.unassignedGuests": "Invitados Sin Asignar",
    "dashboard.tablePlanner.saveLayout": "Guardar Distribución",
    "dashboard.tablePlanner.aiAssistant": "Asistente IA de Asientos",
    "dashboard.tablePlanner.generateSeating": "Generar Plan de Asientos",
    "dashboard.tablePlanner.reviewSuggestions": "Revisar Sugerencias",
    "dashboard.tablePlanner.acceptSuggestions": "Aceptar Sugerencias",
    "dashboard.tablePlanner.modifySuggestions": "Modificar Sugerencias",
    "dashboard.tablePlanner.printLayout": "Imprimir Distribución",
    "dashboard.guestList.name": "Nombre",
    "dashboard.guestList.email": "Correo Electrónico",
    "dashboard.guestList.phone": "Teléfono",
    "dashboard.guestList.rsvpStatus": "Estado de RSVP",
    "dashboard.guestList.dietaryRestrictions": "Restricciones Alimentarias",
    "dashboard.guestList.tableAssignment": "Asignación de Mesa",
    "dashboard.guestList.addGuest": "Añadir Invitado",
    "dashboard.guestList.importGuests": "Importar Invitados",
    "dashboard.guestList.exportGuests": "Exportar Lista de Invitados",
    "dashboard.guestList.filterGuests": "Filtrar Invitados",
    "dashboard.guestList.searchGuests": "Buscar Invitados",
    "dashboard.guestList.printList": "Imprimir Lista de Invitados",
    "dashboard.budget.overview": "Resumen de Presupuesto",
    "dashboard.budget.category": "Categoría",
    "dashboard.budget.planned": "Planificado",
    "dashboard.budget.actual": "Real",
    "dashboard.budget.remaining": "Restante",
    "dashboard.budget.addCategory": "Añadir Categoría",
    "dashboard.budget.addExpense": "Añadir Gasto",
    "dashboard.budget.date": "Fecha",
    "dashboard.budget.amount": "Importe",
    "dashboard.budget.description": "Descripción",
    "dashboard.budget.vendor": "Proveedor",
    "dashboard.budget.exportReport": "Exportar Informe de Presupuesto",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.add": "Añadir",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.sort": "Ordenar",
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.confirm": "Confirmar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.finish": "Finalizar",
    "common.close": "Cerrar",
  },
};

export function getTranslation(
  language: LanguageCode,
  key: TranslationKey,
): string {
  return translations[language][key] || key;
}
