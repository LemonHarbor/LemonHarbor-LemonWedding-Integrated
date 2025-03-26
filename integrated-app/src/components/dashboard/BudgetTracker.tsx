import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Plus,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Trash2,
  Edit,
  Save,
  X,
  Receipt,
  Calendar,
  FileText,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { exportToCSV, formatBudgetDataForExport } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { budgetApi, BudgetCategory, Expense } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function BudgetTracker() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    [],
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    planned: 0,
    actual: 0,
  });
  const [newExpense, setNewExpense] = useState({
    categoryId: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null,
  );
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch budget categories and expenses from the database
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        const [categories, expenseData] = await Promise.all([
          budgetApi.getBudgetCategories(),
          budgetApi.getExpenses(),
        ]);
        setBudgetCategories(categories);
        setExpenses(expenseData);
      } catch (error) {
        console.error("Error fetching budget data:", error);
        toast({
          title: "Error",
          description: "Failed to load budget data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [toast]);

  const totalPlanned = budgetCategories.reduce(
    (sum, category) => sum + category.planned,
    0,
  );
  const totalActual = budgetCategories.reduce(
    (sum, category) => sum + category.actual,
    0,
  );
  const percentSpent = Math.round((totalActual / totalPlanned) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE").format(date);
  };

  // Chart data preparation
  const pieChartData = budgetCategories.map((category) => ({
    name: category.name,
    value: category.actual,
  }));

  const barChartData = budgetCategories.map((category) => ({
    name: category.name,
    planned: category.planned,
    actual: category.actual,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
    "#D0ED57",
    "#FFC658",
    "#FF6B6B",
    "#6B66FF",
    "#FF66D9",
    "#66FFB2",
  ];

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Handle printing the budget report
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Wedding Budget Report",
    onAfterPrint: () => {
      toast({
        title: "Success",
        description: "Budget report printed successfully",
      });
    },
  });

  // Export budget data as CSV
  const handleExportCSV = () => {
    try {
      const { categories, expenses: formattedExpenses } =
        formatBudgetDataForExport(budgetCategories, expenses, formatCurrency);

      // Export categories
      exportToCSV(categories, "wedding_budget_categories");

      toast({
        title: "Success",
        description: "Budget categories exported as CSV",
      });
    } catch (error) {
      console.error("Error exporting budget data:", error);
      toast({
        title: "Error",
        description: "Failed to export budget data",
        variant: "destructive",
      });
    }
  };

  // Export expenses as CSV
  const handleExportExpensesCSV = () => {
    try {
      const { expenses: formattedExpenses } = formatBudgetDataForExport(
        budgetCategories,
        expenses,
        formatCurrency,
      );

      // Export expenses
      exportToCSV(formattedExpenses, "wedding_expenses");

      toast({
        title: "Success",
        description: "Expenses exported as CSV",
      });
    } catch (error) {
      console.error("Error exporting expense data:", error);
      toast({
        title: "Error",
        description: "Failed to export expense data",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new expense
  const handleAddExpense = async () => {
    try {
      if (!newExpense.categoryId) {
        toast({
          title: "Error",
          description: "Please select a category",
          variant: "destructive",
        });
        return;
      }

      if (newExpense.amount <= 0) {
        toast({
          title: "Error",
          description: "Amount must be greater than zero",
          variant: "destructive",
        });
        return;
      }

      const result = await budgetApi.createExpense({
        categoryId: newExpense.categoryId,
        amount: newExpense.amount,
        date: newExpense.date,
        notes: newExpense.notes,
      });

      if (result) {
        // Update expenses list
        setExpenses([result, ...expenses]);

        // Update the category's actual amount
        const updatedCategories = budgetCategories.map((cat) => {
          if (cat.id === newExpense.categoryId) {
            return {
              ...cat,
              actual: cat.actual + newExpense.amount,
            };
          }
          return cat;
        });
        setBudgetCategories(updatedCategories);

        // Reset form and close dialog
        setNewExpense({
          categoryId: "",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setIsAddExpenseDialogOpen(false);
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (expense: Expense) => {
    try {
      const success = await budgetApi.deleteExpense(
        expense.id,
        expense.categoryId,
        expense.amount,
      );

      if (success) {
        // Remove expense from list
        setExpenses(expenses.filter((exp) => exp.id !== expense.id));

        // Update the category's actual amount
        const updatedCategories = budgetCategories.map((cat) => {
          if (cat.id === expense.categoryId) {
            return {
              ...cat,
              actual: Math.max(0, cat.actual - expense.amount),
            };
          }
          return cat;
        });
        setBudgetCategories(updatedCategories);

        toast({
          title: "Success",
          description: "Expense deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new budget category
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive",
        });
        return;
      }

      const result = await budgetApi.createBudgetCategory({
        name: newCategory.name,
        planned: newCategory.planned,
        actual: newCategory.actual,
      });

      if (result) {
        setBudgetCategories([...budgetCategories, result]);
        setNewCategory({ name: "", planned: 0, actual: 0 });
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "Budget category added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding budget category:", error);
      toast({
        title: "Error",
        description: "Failed to add budget category",
        variant: "destructive",
      });
    }
  };

  // Handle updating a budget category
  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory) return;

      const result = await budgetApi.updateBudgetCategory(editingCategory);

      if (result) {
        setBudgetCategories(
          budgetCategories.map((cat) => (cat.id === result.id ? result : cat)),
        );
        setEditingCategory(null);
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Budget category updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating budget category:", error);
      toast({
        title: "Error",
        description: "Failed to update budget category",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a budget category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const success = await budgetApi.deleteBudgetCategory(categoryId);

      if (success) {
        setBudgetCategories(
          budgetCategories.filter((cat) => cat.id !== categoryId),
        );
        toast({
          title: "Success",
          description: "Budget category deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting budget category:", error);
      toast({
        title: "Error",
        description: "Failed to delete budget category",
        variant: "destructive",
      });
    }
  };

  // State for mobile view controls
  const [showExpensesTable, setShowExpensesTable] = useState(true);
  const [showCategoriesTable, setShowCategoriesTable] = useState(true);

  return (
    <div ref={printRef} className="max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h3 className="text-lg font-medium">Wedding Budget</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex space-x-1">
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center"
              onClick={() => setChartType("pie")}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              className="flex items-center justify-center"
              onClick={() => setChartType("bar")}
            >
              <BarChartIcon className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
              >
                <Download className="mr-1 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Budget as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExpensesCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Expenses as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Budget Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="flex items-center justify-center bg-green-600 hover:bg-green-700"
            onClick={() => setIsAddExpenseDialogOpen(true)}
          >
            <Receipt className="mr-1 h-4 w-4" />
            Add Expense
          </Button>
          <Button
            size="sm"
            className="flex items-center justify-center bg-green-600 hover:bg-green-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Budget Summary */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
              <div className="w-full sm:w-auto">
                <h4 className="font-medium">Total Budget</h4>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatCurrency(totalPlanned)}
                </p>
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
                <h4 className="font-medium">Spent So Far</h4>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">
                  {formatCurrency(totalActual)}
                </p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span
                  className={
                    percentSpent > 100 ? "text-red-500" : "text-green-600"
                  }
                >
                  {percentSpent}%
                </span>
              </div>
              <Progress
                value={percentSpent > 100 ? 100 : percentSpent}
                className="h-2"
                indicatorClassName={
                  percentSpent > 100 ? "bg-red-500" : "bg-green-500"
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 gap-1">
              <span>
                Remaining: {formatCurrency(totalPlanned - totalActual)}
              </span>
              {percentSpent > 100 && (
                <span className="text-red-500">
                  Over budget by {formatCurrency(totalActual - totalPlanned)}
                </span>
              )}
            </div>

            {/* Visual Chart */}
            <div className="mt-6 h-64 sm:h-72">
              <h4 className="font-medium mb-2">Expense Visualization</h4>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // On small screens, show shorter labels
                        const displayName =
                          window.innerWidth < 640 && name.length > 10
                            ? `${name.substring(0, 8)}...`
                            : name;
                        return `${displayName}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      wrapperStyle={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                      }}
                    />
                    <Legend
                      layout={
                        window.innerWidth < 640 ? "vertical" : "horizontal"
                      }
                      verticalAlign={
                        window.innerWidth < 640 ? "bottom" : "bottom"
                      }
                      align="center"
                      wrapperStyle={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                      }}
                    />
                  </PieChart>
                ) : (
                  <BarChart
                    data={barChartData}
                    margin={
                      window.innerWidth < 640
                        ? { top: 5, right: 10, left: 0, bottom: 60 }
                        : { top: 5, right: 30, left: 20, bottom: 60 }
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                      height={60}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${formatCurrency(value).substring(0, 3)}k`
                      }
                      tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                      width={window.innerWidth < 640 ? 30 : 40}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      wrapperStyle={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                      }}
                    />
                    <Bar dataKey="planned" name="Planned" fill="#8884d8" />
                    <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Breakdown */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h4 className="font-medium mb-4">Budget Breakdown</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {budgetCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {category.name}
                    </span>
                    <span className="flex items-center flex-shrink-0 ml-2">
                      <span
                        className={
                          category.actual > category.planned
                            ? "text-red-500"
                            : "text-green-600"
                        }
                      >
                        {formatCurrency(category.actual)}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">
                        / {formatCurrency(category.planned)}
                      </span>
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                          {Math.round(
                            (category.actual / category.planned) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div
                        style={{
                          width: `${Math.min(Math.round((category.actual / category.planned) * 100), 100)}%`,
                        }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${category.actual > category.planned ? "bg-red-500" : "bg-green-500"}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Toggle Controls */}
      <div className="lg:hidden flex space-x-2 mb-4">
        <Button
          variant={showExpensesTable ? "default" : "outline"}
          size="sm"
          onClick={() => setShowExpensesTable(!showExpensesTable)}
        >
          {showExpensesTable ? "Hide" : "Show"} Expenses
        </Button>
        <Button
          variant={showCategoriesTable ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCategoriesTable(!showCategoriesTable)}
        >
          {showCategoriesTable ? "Hide" : "Show"} Categories
        </Button>
      </div>

      {/* Expenses Table */}
      {(showExpensesTable || window.innerWidth >= 1024) && (
        <Card className="mt-2 sm:mt-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 sm:p-6 pb-2">
              <h4 className="font-medium mb-2">Recent Expenses</h4>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Notes
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading expenses...
                      </TableCell>
                    </TableRow>
                  ) : expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No expenses recorded yet. Add your first expense to
                        track your spending.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.slice(0, 10).map((expense) => {
                      const category = budgetCategories.find(
                        (c) => c.id === expense.categoryId,
                      );
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell className="max-w-[80px] sm:max-w-[120px] truncate">
                            {category?.name || "Unknown Category"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                            {expense.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteExpense(expense)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      {(showCategoriesTable || window.innerWidth >= 1024) && (
        <Card className="mt-4 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Difference
                    </TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading budget data...
                      </TableCell>
                    </TableRow>
                  ) : budgetCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No budget categories found. Add your first category to
                        get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgetCategories.map((category) => {
                      const difference = category.planned - category.actual;
                      const status = difference >= 0 ? "Under" : "Over";

                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium max-w-[80px] sm:max-w-[120px] truncate">
                            {category.name}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatCurrency(category.planned)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatCurrency(category.actual)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap hidden sm:table-cell">
                            {formatCurrency(Math.abs(difference))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${status === "Under" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1 sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Category Name
              </Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planned" className="text-right">
                Planned Amount
              </Label>
              <Input
                id="planned"
                type="number"
                value={newCategory.planned}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    planned: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actual" className="text-right">
                Actual Amount
              </Label>
              <Input
                id="actual"
                type="number"
                value={newCategory.actual}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    actual: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Category Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-planned" className="text-right">
                  Planned Amount
                </Label>
                <Input
                  id="edit-planned"
                  type="number"
                  value={editingCategory.planned}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      planned: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-actual" className="text-right">
                  Actual Amount
                </Label>
                <Input
                  id="edit-actual"
                  type="number"
                  value={editingCategory.actual}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      actual: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog
        open={isAddExpenseDialogOpen}
        onOpenChange={setIsAddExpenseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <select
                id="category"
                value={newExpense.categoryId}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, categoryId: e.target.value })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {budgetCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                  className="w-full pl-10"
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <textarea
                id="notes"
                value={newExpense.notes}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, notes: e.target.value })
                }
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional notes about this expense"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddExpenseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
