import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, CheckCircle2, Clock, Tag } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  category?: string;
  dueDate?: Date;
  assignee?: {
    name: string;
    avatar: string;
  };
}

interface TaskBoardProps {
  tasks?: Task[];
  onTaskMove?: (taskId: string, newStatus: Task["status"]) => void;
  onTaskClick?: (task: Task) => void;
  onTaskAdd?: (task: Omit<Task, "id">) => void;
  onTaskUpdate?: (task: Task) => void;
  isLoading?: boolean;
}

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Design System Updates",
    description: "Update component library with new design tokens",
    status: "todo",
    category: "Design",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignee: {
      name: "Alice Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
  },
  {
    id: "2",
    title: "API Integration",
    description: "Integrate new backend endpoints",
    status: "in-progress",
    category: "Development",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    assignee: {
      name: "Bob Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    },
  },
  {
    id: "3",
    title: "User Testing",
    description: "Conduct user testing sessions",
    status: "done",
    category: "Research",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    assignee: {
      name: "Carol Williams",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    },
  },
  {
    id: "4",
    title: "Venue Booking",
    description: "Confirm venue booking and details",
    status: "todo",
    category: "Venue",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    assignee: {
      name: "David Brown",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
  },
  {
    id: "5",
    title: "Catering Selection",
    description: "Choose menu and confirm with caterer",
    status: "in-progress",
    category: "Food",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    assignee: {
      name: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
  },
];

const categories = [
  "Venue",
  "Food",
  "Decoration",
  "Attire",
  "Photography",
  "Music",
  "Invitations",
  "Transportation",
  "Accommodation",
  "Other",
];

const TaskBoard = ({
  tasks = defaultTasks,
  onTaskMove = () => {},
  onTaskClick = () => {},
  onTaskAdd = () => {},
  onTaskUpdate = () => {},
  isLoading = false,
}: TaskBoardProps) => {
  const [loading, setLoading] = useState(isLoading);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    status: "todo",
    category: "Other",
  });
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "bg-gray-50",
      borderColor: "border-gray-200",
      iconColor: "text-gray-400",
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "bg-blue-50",
      borderColor: "border-blue-100",
      iconColor: "text-blue-400",
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-50",
      borderColor: "border-green-100",
      iconColor: "text-green-400",
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onTaskMove(taskId, status);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetailDialog(true);
  };

  const handleAddTask = () => {
    onTaskAdd({
      ...newTask,
      dueDate: date,
    });
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      category: "Other",
    });
    setDate(undefined);
    setShowAddTaskDialog(false);
  };

  const handleUpdateTask = () => {
    if (selectedTask) {
      onTaskUpdate(selectedTask);
      setShowTaskDetailDialog(false);
      setSelectedTask(null);
    }
  };

  const getCategoryColor = (category?: string) => {
    const categoryColors: Record<string, string> = {
      Venue: "bg-purple-100 text-purple-800",
      Food: "bg-orange-100 text-orange-800",
      Decoration: "bg-pink-100 text-pink-800",
      Attire: "bg-indigo-100 text-indigo-800",
      Photography: "bg-cyan-100 text-cyan-800",
      Music: "bg-yellow-100 text-yellow-800",
      Invitations: "bg-lime-100 text-lime-800",
      Transportation: "bg-sky-100 text-sky-800",
      Accommodation: "bg-amber-100 text-amber-800",
      Other: "bg-gray-100 text-gray-800",
      Design: "bg-teal-100 text-teal-800",
      Development: "bg-blue-100 text-blue-800",
      Research: "bg-violet-100 text-violet-800",
    };

    return category
      ? categoryColors[category] || "bg-gray-100 text-gray-800"
      : "bg-gray-100 text-gray-800";
  };

  const getDueDateColor = (dueDate?: Date) => {
    if (!dueDate) return "text-gray-500";

    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-500"; // Overdue
    if (diffDays <= 3) return "text-orange-500"; // Due soon
    return "text-green-500"; // Due later
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Task Board</h2>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors opacity-50 cursor-not-allowed">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-4 border ${column.borderColor}`}
            >
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${column.iconColor}`}
                ></span>
                {column.title}
              </h3>
              <div className="space-y-3 flex flex-col items-center justify-center min-h-[200px]">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-3">
                  Loading tasks...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/90 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Task Board
        </h2>
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="title"
                  className="text-right font-medium text-sm"
                >
                  Title
                </label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Task title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="description"
                  className="text-right font-medium text-sm"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="category"
                  className="text-right font-medium text-sm"
                >
                  Category
                </label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="dueDate"
                  className="text-right font-medium text-sm"
                >
                  Due Date
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddTask}
                disabled={!newTask.title}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100%-4rem)]">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} rounded-xl p-4 border ${column.borderColor}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task["status"])}
          >
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span
                className={`h-2 w-2 rounded-full mr-2 ${column.iconColor}`}
              ></span>
              {column.title}
              <span className="ml-2 text-xs font-normal text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
                {tasks.filter((task) => task.status === column.id).length}
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {tasks
                .filter((task) => task.status === column.id)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, task.id)}
                    onClick={() => handleTaskClick(task)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 rounded-xl border-0 bg-white shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.category && (
                          <div
                            className={`text-xs px-2 py-1 rounded-full flex items-center ${getCategoryColor(task.category)}`}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {task.category}
                          </div>
                        )}
                        {task.dueDate && (
                          <div
                            className={`text-xs px-2 py-1 rounded-full bg-gray-100 flex items-center ${getDueDateColor(task.dueDate)}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {format(task.dueDate, "MMM d")}
                          </div>
                        )}
                      </div>
                      {task.assignee && (
                        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-7 h-7 rounded-full mr-2 border border-white shadow-sm"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Dialog */}
      <Dialog
        open={showTaskDetailDialog}
        onOpenChange={setShowTaskDetailDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="detail-title"
                  className="text-right font-medium text-sm"
                >
                  Title
                </label>
                <Input
                  id="detail-title"
                  value={selectedTask.title}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="detail-description"
                  className="text-right font-medium text-sm"
                >
                  Description
                </label>
                <Textarea
                  id="detail-description"
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="detail-status"
                  className="text-right font-medium text-sm"
                >
                  Status
                </label>
                <Select
                  value={selectedTask.status}
                  onValueChange={(value: Task["status"]) =>
                    setSelectedTask({ ...selectedTask, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="detail-category"
                  className="text-right font-medium text-sm"
                >
                  Category
                </label>
                <Select
                  value={selectedTask.category}
                  onValueChange={(value) =>
                    setSelectedTask({ ...selectedTask, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="detail-dueDate"
                  className="text-right font-medium text-sm"
                >
                  Due Date
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedTask.dueDate ? (
                          format(selectedTask.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedTask.dueDate}
                        onSelect={(date) =>
                          setSelectedTask({ ...selectedTask, dueDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateTask}>
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
