import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  BarChart2,
  Users,
  Clock,
  Calendar,
  CheckSquare,
  Mail,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import WeddingCountdown from "./WeddingCountdown";
import UpcomingTasks from "./UpcomingTasks";
import RsvpStats from "./RsvpStats";
import ProgressIndicator from "./ProgressIndicator";

interface ProjectCardProps {
  title: string;
  progress: number;
  team: Array<{ name: string; avatar: string }>;
  dueDate: string;
}

interface DashboardGridProps {
  projects?: ProjectCardProps[];
  isLoading?: boolean;
  weddingDate?: Date;
  tasks?: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
    category?: string;
  }>;
  rsvpStats?: {
    attending: number;
    declined: number;
    pending: number;
    total: number;
  };
  planningProgress?: number;
}

const defaultProjects: ProjectCardProps[] = [
  {
    title: "Website Redesign",
    progress: 75,
    team: [
      {
        name: "Alice",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      {
        name: "Bob",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      {
        name: "Charlie",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      },
    ],
    dueDate: "2024-04-15",
  },
  {
    title: "Mobile App Development",
    progress: 45,
    team: [
      {
        name: "David",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
      {
        name: "Eve",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
      },
    ],
    dueDate: "2024-05-01",
  },
  {
    title: "Marketing Campaign",
    progress: 90,
    team: [
      {
        name: "Frank",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
      },
      {
        name: "Grace",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
      },
      {
        name: "Henry",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
      },
    ],
    dueDate: "2024-03-30",
  },
];

const defaultTasks = [
  {
    id: "1",
    title: "Book venue",
    dueDate: "2024-08-15",
    completed: true,
    category: "Venue",
  },
  {
    id: "2",
    title: "Send invitations",
    dueDate: "2024-09-01",
    completed: false,
    category: "Guests",
  },
  {
    id: "3",
    title: "Order flowers",
    dueDate: "2024-09-15",
    completed: false,
    category: "Decoration",
  },
  {
    id: "4",
    title: "Finalize menu",
    dueDate: "2024-08-30",
    completed: false,
    category: "Catering",
  },
];

const defaultRsvpStats = {
  attending: 45,
  declined: 12,
  pending: 68,
  total: 125,
};

const ProjectCard = ({ title, progress, team, dueDate }: ProjectCardProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-900">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
          <BarChart2 className="h-4 w-4 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-900">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-gray-100 rounded-full"
              style={
                {
                  backgroundColor: "rgb(243, 244, 246)",
                } as React.CSSProperties
              }
            />
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Due {dueDate}</span>
            </div>
            <div className="flex -space-x-2">
              {team.map((member, i) => (
                <Avatar
                  key={i}
                  className="h-7 w-7 border-2 border-white shadow-sm"
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardSummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-900">
          {title}
        </CardTitle>
        <div
          className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-gray-900">{value}</div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const DashboardGrid = ({
  projects = defaultProjects,
  isLoading = false,
  weddingDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days from now
  tasks = defaultTasks,
  rsvpStats = defaultRsvpStats,
  planningProgress = 65,
}: DashboardGridProps) => {
  const [loading, setLoading] = useState(isLoading);

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (loading) {
    return (
      <div className="p-6 h-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm h-[220px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-blue-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Loading dashboard data...
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {/* Wedding Countdown - Takes full width on mobile, half on medium, and 1/4 on large screens */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
          <WeddingCountdown weddingDate={weddingDate} />
        </div>

        {/* Planning Progress - Takes full width on mobile, half on medium, and 1/4 on large screens */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <ProgressIndicator progress={planningProgress} />
        </div>

        {/* RSVP Stats - Takes full width on mobile, half on medium, and 1/4 on large screens */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <RsvpStats stats={rsvpStats} />
        </div>

        {/* Upcoming Tasks - Takes full width on mobile, half on medium, and 1/2 on large screens */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <UpcomingTasks tasks={tasks} />
        </div>

        {/* Summary Cards - Each takes full width on mobile, half on medium, and 1/4 on large screens */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <DashboardSummaryCard
            title="Total Guests"
            value={rsvpStats.total}
            description="Invited guests"
            icon={Users}
            iconColor="text-purple-500"
            iconBgColor="bg-purple-50"
          />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <DashboardSummaryCard
            title="Upcoming Tasks"
            value={tasks.filter((t) => !t.completed).length}
            description="Tasks to complete"
            icon={CheckSquare}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-50"
          />
        </div>

        {/* Project Cards - Each takes full width on mobile, half on medium, and 1/3 on large screens */}
        {projects.map((project, index) => (
          <div
            key={index}
            className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1"
          >
            <ProjectCard {...project} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;
