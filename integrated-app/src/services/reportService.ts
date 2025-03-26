import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

// Generate and export budget report data
export const generateBudgetReport = async () => {
  try {
    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (expensesError) throw expensesError;

    // Fetch budget categories
    const { data: categories, error: categoriesError } = await supabase
      .from("budget_categories")
      .select("*");

    if (categoriesError) throw categoriesError;

    // Calculate total budget and spent
    const totalBudget = categories.reduce(
      (sum, category) => sum + category.amount,
      0,
    );
    const totalSpent = expenses
      .filter((expense) => expense.status !== "cancelled")
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate spending by category
    const spendingByCategory = {};
    expenses
      .filter((expense) => expense.status !== "cancelled")
      .forEach((expense) => {
        if (!spendingByCategory[expense.category]) {
          spendingByCategory[expense.category] = 0;
        }
        spendingByCategory[expense.category] += expense.amount;
      });

    // Calculate monthly spending
    const monthlySpending = {};
    expenses
      .filter((expense) => expense.status !== "cancelled")
      .forEach((expense) => {
        const date = new Date(expense.date);
        const monthYear = format(date, "MMM yyyy");

        if (!monthlySpending[monthYear]) {
          monthlySpending[monthYear] = 0;
        }
        monthlySpending[monthYear] += expense.amount;
      });

    // Return the report data
    return {
      generatedAt: new Date().toISOString(),
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      percentageUsed: Math.round((totalSpent / totalBudget) * 100),
      categories: categories.map((category) => ({
        name: category.name,
        allocated: category.amount,
        spent: spendingByCategory[category.name] || 0,
        remaining: category.amount - (spendingByCategory[category.name] || 0),
        percentageUsed:
          category.amount > 0
            ? Math.round(
                ((spendingByCategory[category.name] || 0) / category.amount) *
                  100,
              )
            : 0,
      })),
      expenses: expenses.map((expense) => ({
        id: expense.id,
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        status: expense.status,
        vendor: expense.vendor,
        notes: expense.notes,
      })),
      spendingByCategory,
      monthlySpending,
    };
  } catch (error) {
    console.error("Error generating budget report:", error);
    throw error;
  }
};

// Export budget report as CSV
export const exportBudgetReportCSV = async () => {
  try {
    const reportData = await generateBudgetReport();

    // Create CSV content
    const headers = [
      "Date",
      "Expense",
      "Category",
      "Amount",
      "Status",
      "Vendor",
      "Notes",
    ];

    const csvContent = [
      headers.join(","),
      ...reportData.expenses.map((expense) =>
        [
          expense.date,
          `"${expense.name.replace(/"/g, '""')}"`,
          expense.category,
          expense.amount,
          expense.status,
          expense.vendor ? `"${expense.vendor.replace(/"/g, '""')}"` : "",
          expense.notes ? `"${expense.notes.replace(/"/g, '""')}"` : "",
        ].join(","),
      ),
    ].join("\n");

    return {
      filename: `wedding_budget_report_${format(new Date(), "yyyy-MM-dd")}.csv`,
      content: csvContent,
    };
  } catch (error) {
    console.error("Error exporting budget report as CSV:", error);
    throw error;
  }
};

// Export budget report as PDF (placeholder - would require PDF generation library)
export const exportBudgetReportPDF = async () => {
  try {
    const reportData = await generateBudgetReport();

    // In a real implementation, you would use a PDF generation library
    // For now, we'll just return the data that would be used to generate the PDF

    return {
      filename: `wedding_budget_report_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      data: reportData,
    };
  } catch (error) {
    console.error("Error exporting budget report as PDF:", error);
    throw error;
  }
};
