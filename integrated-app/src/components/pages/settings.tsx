import React from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import Sidebar from "../dashboard/layout/Sidebar";
import MobileNavigation from "../dashboard/layout/MobileNavigation";
import SettingsLayout from "../dashboard/settings/SettingsLayout";
import { useAuth } from "../../../supabase/auth";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { Settings, User, Bell, Home } from "lucide-react";

const SettingsPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("settings");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Custom navigation items for settings page
  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard" },
    { icon: <Settings size={20} />, label: "Settings", isActive: true },
  ];

  const handleNavItemClick = (label: string) => {
    if (label.toLowerCase() === "dashboard") {
      navigate("/dashboard");
    } else {
      setActiveSection(label.toLowerCase());
    }
  };

  if (authLoading) {
    return <LoadingScreen text="Loading settings..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <DashboardHeader
        coupleName={
          user?.user_metadata?.full_name && user?.user_metadata?.partner_name
            ? `${user.user_metadata.full_name} & ${user.user_metadata.partner_name}`
            : user?.user_metadata?.full_name
              ? `${user.user_metadata.full_name}'s Wedding`
              : "Wedding Settings"
        }
        weddingDate={
          user?.user_metadata?.wedding_date
            ? new Date(user.user_metadata.wedding_date).toLocaleDateString(
                undefined,
                { year: "numeric", month: "long", day: "numeric" },
              )
            : "Wedding Date"
        }
      />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] mt-16 pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar
            items={navItems}
            activeItem="Settings"
            onItemClick={handleNavItemClick}
          />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6">
            <SettingsLayout />
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

export default SettingsPage;
