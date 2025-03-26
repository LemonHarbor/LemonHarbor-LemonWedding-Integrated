import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Filter,
  Tag,
  Home,
  Utensils,
  Palette,
  Shirt,
  Camera,
  Music,
  Car,
  Building,
  Plane,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { tasksApi, Task } from "@/lib/api";
import { useTranslation } from "@/lib/useTranslation";
import { useLanguageStore } from "@/lib/i18n";

interface UpcomingTasksProps {
  tasks?: Task[];
}

export default function UpcomingTasks({
  tasks: initialTasks,
}: UpcomingTasksProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    category: "general",
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
      setLoading(false);
    } else {
      fetchTasks();
    }
  }, [initialTasks]);

  // Fallback to mock data if API call fails or during development
  const useMockData =
    process.env.NODE_ENV === "development" || tasks.length === 0;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await tasksApi.getTasks();
      if (fetchedTasks.length > 0) {
        setTasks(fetchedTasks);
      } else if (process.env.NODE_ENV === "development") {
        // Use mock data in development if no tasks are returned
        setTasks(tasksApi.getMockTasks());
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: t("common.error"),
        description: "Failed to load tasks. Using sample data instead.",
        variant: "destructive",
      });
      // Fallback to mock data on error
      setTasks(tasksApi.getMockTasks());
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "venue":
        return <Home className="h-3 w-3" />;
      case "catering":
        return <Utensils className="h-3 w-3" />;
      case "decoration":
        return <Palette className="h-3 w-3" />;
      case "attire":
        return <Shirt className="h-3 w-3" />;
      case "photography":
        return <Camera className="h-3 w-3" />;
      case "music":
        return <Music className="h-3 w-3" />;
      case "transportation":
        return <Car className="h-3 w-3" />;
      case "accommodation":
        return <Building className="h-3 w-3" />;
      case "honeymoon":
        return <Plane className="h-3 w-3" />;
      case "other":
        return <MoreHorizontal className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "venue":
        return "bg-blue-100 text-blue-800";
      case "catering":
        return "bg-orange-100 text-orange-800";
      case "decoration":
        return "bg-pink-100 text-pink-800";
      case "attire":
        return "bg-indigo-100 text-indigo-800";
      case "photography":
        return "bg-purple-100 text-purple-800";
      case "music":
        return "bg-teal-100 text-teal-800";
      case "transportation":
        return "bg-cyan-100 text-cyan-800";
      case "accommodation":
        return "bg-emerald-100 text-emerald-800";
      case "honeymoon":
        return "bg-violet-100 text-violet-800";
      case "other":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use the current language for date formatting
    const locale =
      language === "en"
        ? "en-US"
        : language === "de"
          ? "de-DE"
          : language === "fr"
            ? "fr-FR"
            : language === "es"
              ? "es-ES"
              : "en-US";
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;

    try {
      const taskToAdd = {
        title: newTask.title,
        dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
        priority: newTask.priority as "high" | "medium" | "low",
        completed: false,
      };

      const addedTask = await tasksApi.createTask(taskToAdd);
      if (addedTask) {
        setTasks([...tasks, addedTask]);
        toast({
          title: t("common.success"),
          description: "Task added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: t("common.error"),
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNewTask({
        title: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
        category: "general",
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditTask = async () => {
    if (!currentTask) return;

    try {
      const updatedTask = await tasksApi.updateTask(currentTask);
      if (updatedTask) {
        setTasks(
          tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        );
        toast({
          title: t("common.success"),
          description: "Task updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: t("common.error"),
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditDialogOpen(false);
      setCurrentTask(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    try {
      const success = await tasksApi.deleteTask(currentTask.id);
      if (success) {
        setTasks(tasks.filter((task) => task.id !== currentTask.id));
        toast({
          title: t("common.success"),
          description: "Task deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: t("common.error"),
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentTask(null);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    try {
      const result = await tasksApi.updateTask(updatedTask);
      if (result) {
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task)),
        );
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast({
        title: t("common.error"),
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Filter tasks based on selected category
  const filteredTasks = tasks.filter((task) =>
    categoryFilter ? task.category === categoryFilter : true,
  );

  return (
    <>
      <Card className="bg-white border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="flex items-center text-purple-800 text-base sm:text-lg font-medium">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            {t("dashboard.upcoming")}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 ${categoryFilter ? "bg-purple-50 border-purple-200" : ""}`}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {categoryFilter
                    ? getCategoryLabel(categoryFilter)
                    : "All Categories"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    <Tag className="h-4 w-4 mr-2" />
                    <span>All Categories</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("general")}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    <span>General</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("venue")}>
                    <Home className="h-4 w-4 mr-2" />
                    <span>Venue</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("catering")}
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    <span>Catering</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("decoration")}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    <span>Decoration</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("attire")}>
                    <Shirt className="h-4 w-4 mr-2" />
                    <span>Attire</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("photography")}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span>Photography</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("music")}>
                    <Music className="h-4 w-4 mr-2" />
                    <span>Music</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("transportation")}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    <span>Transportation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("accommodation")}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    <span>Accommodation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCategoryFilter("honeymoon")}
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    <span>Honeymoon</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("other")}>
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    <span>Other</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 text-purple-600" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredTasks
                  .filter((task) => !task.completed)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg hover:bg-gray-50 gap-2 sm:gap-0"
                    >
                      <div className="flex items-center">
                        <button
                          className="mr-2 text-gray-400 hover:text-green-500 transition-colors"
                          onClick={() => handleToggleComplete(task.id)}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-700">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-7 sm:ml-0">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)} flex items-center gap-1`}
                          >
                            {getCategoryIcon(task.category)}
                            <span className="hidden sm:inline">
                              {getCategoryLabel(task.category)}
                            </span>
                          </Badge>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        <button
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          onClick={() => openEditDialog(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => openDeleteDialog(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {filteredTasks.filter((task) => !task.completed).length ===
                  0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No upcoming tasks. Add a new task to get started!
                  </div>
                )}
              </div>

              {filteredTasks.filter((task) => task.completed).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    {t("dashboard.completed")}
                  </h3>
                  <div className="space-y-2">
                    {filteredTasks
                      .filter((task) => task.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg hover:bg-gray-50 opacity-70 gap-2 sm:gap-0"
                        >
                          <div className="flex items-center">
                            <button
                              className="mr-2 text-green-500 hover:text-gray-400 transition-colors"
                              onClick={() => handleToggleComplete(task.id)}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-gray-500 line-through">
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 ml-7 sm:ml-0">
                            <button
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => openDeleteDialog(task)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full sm:w-auto"
                  onClick={fetchTasks}
                >
                  Refresh {t("dashboard.tasks")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("common.add")} {t("dashboard.tasks")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    priority: value as "high" | "medium" | "low",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newTask.category}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    category: value as Task["category"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="decoration">Decoration</SelectItem>
                  <SelectItem value="attire">Attire</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="honeymoon">Honeymoon</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title}>
              {t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("common.edit")} {t("dashboard.tasks")}
            </DialogTitle>
          </DialogHeader>
          {currentTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={currentTask.title}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={currentTask.dueDate}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={currentTask.priority}
                  onValueChange={(value) =>
                    setCurrentTask({
                      ...currentTask,
                      priority: value as "high" | "medium" | "low",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={currentTask.category}
                  onValueChange={(value) =>
                    setCurrentTask({
                      ...currentTask,
                      category: value as Task["category"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="attire">Attire</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="transportation">
                      Transportation
                    </SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditTask}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("common.delete")} {t("dashboard.tasks")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this task?</p>
            {currentTask && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{currentTask.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Due: {formatDate(currentTask.dueDate)} • Priority:{" "}
                  {currentTask.priority} • Category:{" "}
                  {getCategoryLabel(currentTask.category)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
