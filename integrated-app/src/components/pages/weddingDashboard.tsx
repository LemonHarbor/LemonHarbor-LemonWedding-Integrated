import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import MobileNavigation from "../dashboard/layout/MobileNavigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MainDashboard from "../dashboard/MainDashboard";
import BudgetTracker from "../dashboard/BudgetTracker";
import TablePlanner from "../dashboard/TablePlanner";
import GuestManagement from "../dashboard/GuestManagement";
import GuestRelationshipManager from "../dashboard/GuestRelationshipManager";
import DashboardHeader from "../dashboard/DashboardHeader";
import UpcomingTasks from "../dashboard/UpcomingTasks";
import { useAuth } from "../../../supabase/auth";
import { useLanguageStore } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { CalendarHeart, Users2, SquareMenu, Wallet, Clock } from "lucide-react";

const WeddingDashboard = () => {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const { language } = useLanguageStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Custom navigation items for wedding dashboard
  const navItems = [
    {
      icon: <CalendarHeart size={20} />,
      label: "Overview",
      isActive: activeSection === "overview",
    },
    {
      icon: <Users2 size={20} />,
      label: "Guests",
      isActive: activeSection === "guests",
    },
    {
      icon: <SquareMenu size={20} />,
      label: "Tables",
      isActive: activeSection === "tables",
    },
    {
      icon: <Wallet size={20} />,
      label: "Budget",
      isActive: activeSection === "budget",
    },
    {
      icon: <Clock size={20} />,
      label: "Tasks",
      isActive: activeSection === "tasks",
    },
  ];

  const handleNavItemClick = (label: string) => {
    if (label === "Settings") {
      navigate("/settings");
    } else {
      setActiveSection(label.toLowerCase());
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "guests":
        return (
          <div className="space-y-6">
            <GuestManagement />
            <GuestRelationshipManager />
          </div>
        );
      case "tables":
        return <TablePlanner />;
      case "budget":
        return <BudgetTracker />;
      case "tasks":
        return (
          <div className="max-w-4xl mx-auto">
            <UpcomingTasks />
          </div>
        );
      case "overview":
      default:
        return (
          <MainDashboard
            weddingDate={new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)}
            coupleName={
              user?.user_metadata?.full_name
                ? `${user.user_metadata.full_name}'s Wedding`
                : "Emma & Noah"
            }
          />
        );
    }
  };

  if (initialLoading) {
    return <LoadingScreen text="Loading your wedding dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <DashboardHeader
        coupleName={
          user?.user_metadata?.full_name
            ? `${user.user_metadata.full_name}'s Wedding`
            : "Emma & Noah"
        }
        weddingDate="July 15, 2023"
      />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] mt-16 pb-16 md:pb-0">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sidebar
            items={navItems}
            activeItem={
              activeSection.charAt(0).toUpperCase() + activeSection.slice(1)
            }
            onItemClick={handleNavItemClick}
          />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-4 pb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
          </div>
          <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
            {renderContent()}
          </div>
        </main>
        {/* Mobile bottom navigation */}
        <MobileNavigation
          activeSection={activeSection}
          onItemClick={handleNavItemClick}
        />
      </div>
    </div>
  );
};

export default WeddingDashboard;
