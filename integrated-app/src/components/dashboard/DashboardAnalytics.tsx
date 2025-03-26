import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  ChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  Wallet,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { budgetApi, guestsApi, tasksApi } from "@/lib/api";

interface DashboardAnalyticsProps {
  isLoading?: boolean;
}

const DashboardAnalytics = ({ isLoading = false }: DashboardAnalyticsProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(isLoading);
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Analytics data states
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [guestData, setGuestData] = useState<any>({
    total: 0,
    attending: 0,
    declined: 0,
    pending: 0,
  });
  const [taskData, setTaskData] = useState<any>({
    total: 0,
    completed: 0,
    upcoming: 0,
    overdue: 0,
  });
  const [planningProgress, setPlanningProgress] = useState(0);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch budget data
        const categories = await budgetApi.getBudgetCategories();
        setBudgetData(
          categories.map((cat) => ({
            name: cat.name,
            planned: cat.planned,
            actual: cat.actual,
          })),
        );

        // Calculate planning progress based on tasks
        const tasks = await tasksApi.getTasks();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;
        const upcomingTasks = tasks.filter(
          (task) => !task.completed && new Date(task.dueDate) > new Date(),
        ).length;
        const overdueTasks = tasks.filter(
          (task) => !task.completed && new Date(task.dueDate) < new Date(),
        ).length;

        setTaskData({
          total: totalTasks,
          completed: completedTasks,
          upcoming: upcomingTasks,
          overdue: overdueTasks,
        });

        setPlanningProgress(
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        );

        // Fetch guest data
        const guests = await guestsApi.getGuests();
        const attending = guests.filter(
          (guest) => guest.rsvpStatus === "confirmed",
        ).length;
        const declined = guests.filter(
          (guest) => guest.rsvpStatus === "declined",
        ).length;
        const pending = guests.filter(
          (guest) => guest.rsvpStatus === "pending",
        ).length;

        setGuestData({
          total: guests.length,
          attending,
          declined,
          pending,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate budget metrics
  const totalPlanned = budgetData.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = budgetData.reduce((sum, item) => sum + item.actual, 0);
  const budgetPercentage =
    totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const isOverBudget = totalActual > totalPlanned;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Chart colors
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
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("dashboard.analytics")}
          </h2>
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="overview">
              {t("dashboard.overview")}
            </TabsTrigger>
            <TabsTrigger value="budget">{t("dashboard.budget")}</TabsTrigger>
            <TabsTrigger value="guests">{t("dashboard.guests")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Planning Progress Card */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-gray-900">
                  {t("dashboard.planningProgress")}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-semibold text-gray-900">
                    {planningProgress}%
                  </div>
                  <div className="space-y-2">
                    <Progress value={planningProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {taskData.completed} {t("dashboard.tasksCompleted")}
                      </span>
                      <span>
                        {taskData.total} {t("dashboard.totalTasks")}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                        {taskData.upcoming} {t("dashboard.upcoming")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                        {taskData.overdue} {t("dashboard.overdue")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Status Card */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-gray-900">
                  {t("dashboard.budgetStatus")}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-semibold text-gray-900">
                    {formatCurrency(totalActual)}
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={budgetPercentage > 100 ? 100 : budgetPercentage}
                      className="h-2"
                      indicatorClassName={
                        isOverBudget ? "bg-red-500" : "bg-green-500"
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {budgetPercentage}% {t("dashboard.spent")}
                      </span>
                      <span>
                        {formatCurrency(totalPlanned)} {t("dashboard.total")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isOverBudget ? (
                      <div className="flex items-center text-red-500">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>
                          {formatCurrency(totalActual - totalPlanned)}{" "}
                          {t("dashboard.overBudget")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span>
                          {formatCurrency(totalPlanned - totalActual)}{" "}
                          {t("dashboard.remaining")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Statistics Card */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-gray-900">
                  {t("dashboard.guestStatistics")}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-semibold text-gray-900">
                    {guestData.total}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col">
                      <div className="text-xl font-semibold text-green-600">
                        {guestData.attending}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("dashboard.attending")}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xl font-semibold text-red-500">
                        {guestData.declined}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("dashboard.declined")}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xl font-semibold text-amber-500">
                        {guestData.pending}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("dashboard.pending")}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-l-full"
                      style={{
                        width: `${guestData.total > 0 ? (guestData.attending / guestData.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {guestData.total > 0
                      ? Math.round(
                          (guestData.attending / guestData.total) * 100,
                        )
                      : 0}
                    % {t("dashboard.responseRate")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4 mt-0">
          {/* Budget Analysis */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-900">
                  {t("dashboard.budgetBreakdown")}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChartType("pie")}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {budgetData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">
                      {t("dashboard.noBudgetData")}
                    </p>
                  </div>
                ) : chartType === "pie" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="actual"
                      >
                        {budgetData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${formatCurrency(value).substring(0, 3)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar
                        dataKey="planned"
                        name={t("dashboard.planned")}
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="actual"
                        name={t("dashboard.actual")}
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-900">
                {t("dashboard.topCategories")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {t("dashboard.noBudgetData")}
                  </p>
                ) : (
                  budgetData
                    .sort((a, b) => b.actual - a.actual)
                    .slice(0, 5)
                    .map((category, index) => {
                      const percentage =
                        category.planned > 0
                          ? Math.round(
                              (category.actual / category.planned) * 100,
                            )
                          : 0;
                      const isOverBudget = category.actual > category.planned;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {category.name}
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(category.actual)} /{" "}
                              {formatCurrency(category.planned)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
                              style={{
                                width: `${percentage > 100 ? 100 : percentage}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{percentage}%</span>
                            {isOverBudget && (
                              <span className="text-red-500">
                                +
                                {formatCurrency(
                                  category.actual - category.planned,
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4 mt-0">
          {/* Guest Analysis */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-900">
                {t("dashboard.rsvpAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {guestData.total === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">
                      {t("dashboard.noGuestData")}
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: t("dashboard.attending"),
                            value: guestData.attending,
                            color: "#22c55e",
                          },
                          {
                            name: t("dashboard.declined"),
                            value: guestData.declined,
                            color: "#ef4444",
                          },
                          {
                            name: t("dashboard.pending"),
                            value: guestData.pending,
                            color: "#f59e0b",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          {
                            name: t("dashboard.attending"),
                            value: guestData.attending,
                            color: "#22c55e",
                          },
                          {
                            name: t("dashboard.declined"),
                            value: guestData.declined,
                            color: "#ef4444",
                          },
                          {
                            name: t("dashboard.pending"),
                            value: guestData.pending,
                            color: "#f59e0b",
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {guestData.attending}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t("dashboard.attending")}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {guestData.declined}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t("dashboard.declined")}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {guestData.pending}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t("dashboard.pending")}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">
                  {t("dashboard.responseRate")}
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-green-500 h-2.5 rounded-l-full"
                    style={{
                      width: `${guestData.total > 0 ? ((guestData.attending + guestData.declined) / guestData.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {guestData.total > 0
                      ? Math.round(
                          ((guestData.attending + guestData.declined) /
                            guestData.total) *
                            100,
                        )
                      : 0}
                    % {t("dashboard.responded")}
                  </span>
                  <span>
                    {guestData.total} {t("dashboard.totalInvites")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAnalytics;
