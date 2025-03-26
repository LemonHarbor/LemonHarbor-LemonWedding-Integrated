/**
 * Utility functions for exporting data in various formats
 */

// Export data as CSV
export const exportToCSV = (data: any[], filename: string) => {
  // Convert data to CSV format
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle strings with commas by wrapping in quotes
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(","));
  }

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format budget data for export
export const formatBudgetDataForExport = (
  categories: any[],
  expenses: any[],
  formatCurrency: (amount: number) => string,
) => {
  // Format categories for export
  const categoriesForExport = categories.map((category) => ({
    Category: category.name,
    "Planned Amount": formatCurrency(category.planned),
    "Actual Amount": formatCurrency(category.actual),
    Remaining: formatCurrency(category.planned - category.actual),
    Status:
      category.planned >= category.actual ? "Under budget" : "Over budget",
  }));

  // Format expenses for export with category names
  const expensesForExport = expenses.map((expense) => {
    const category = categories.find((c) => c.id === expense.categoryId);
    return {
      Date: new Date(expense.date).toLocaleDateString(),
      Category: category?.name || "Unknown",
      Amount: formatCurrency(expense.amount),
      Notes: expense.notes || "",
    };
  });

  return {
    categories: categoriesForExport,
    expenses: expensesForExport,
    summary: [
      {
        "Total Budget": formatCurrency(
          categories.reduce((sum, cat) => sum + cat.planned, 0),
        ),
        "Total Spent": formatCurrency(
          categories.reduce((sum, cat) => sum + cat.actual, 0),
        ),
        Remaining: formatCurrency(
          categories.reduce((sum, cat) => sum + cat.planned, 0) -
            categories.reduce((sum, cat) => sum + cat.actual, 0),
        ),
      },
    ],
  };
};

// Format and export table assignments
export const exportTableAssignments = (tables: any[], guests: any[]) => {
  // Create a flattened list of all guest assignments
  const tableAssignments = [];

  for (const table of tables) {
    for (const guestId of table.guests) {
      const guest = guests.find((g) => g.id === guestId);
      if (guest) {
        tableAssignments.push({
          "Guest Name": guest.name,
          "Table Name": table.name,
          "Table Shape": getTableShapeFormatted(table.shape),
          "Dietary Restrictions": guest.dietaryRestrictions || "-",
          Email: guest.email || "-",
          Phone: guest.phone || "-",
        });
      }
    }
  }

  // Sort by table name and then by guest name
  tableAssignments.sort((a, b) => {
    if (a["Table Name"] === b["Table Name"]) {
      return a["Guest Name"].localeCompare(b["Guest Name"]);
    }
    return a["Table Name"].localeCompare(b["Table Name"]);
  });

  // Export as CSV
  exportToCSV(tableAssignments, "wedding_table_assignments");
};

// Helper function to format table shape
const getTableShapeFormatted = (shape: string): string => {
  switch (shape) {
    case "round":
      return "Round";
    case "rectangle":
      return "Rectangle";
    case "oval":
      return "Oval";
    default:
      return "Unknown";
  }
};
