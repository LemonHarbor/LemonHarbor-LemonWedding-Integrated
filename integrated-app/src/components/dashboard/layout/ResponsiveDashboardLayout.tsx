import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { useTranslation } from "@/lib/useTranslation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
  isSettingsSection?: boolean;
  title?: string;
}

const ResponsiveDashboardLayout = ({
  children,
  isSettingsSection = false,
  title,
}: ResponsiveDashboardLayoutProps) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState(
    isSettingsSection ? "Settings" : "Home",
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNavigation = (item: string) => {
    setActiveItem(item);
    setIsMobileSidebarOpen(false);
    // Additional navigation logic can be added here
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Always visible on md and larger screens */}
      <Sidebar activeItem={activeItem} onItemClick={handleNavigation} />

      {/* Mobile Sidebar - Conditionally visible */}
      {isMobileView && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-[280px] h-full bg-white shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("weddingPlanner")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileSidebar}
                className="text-gray-500"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)]">
              <Sidebar activeItem={activeItem} onItemClick={handleNavigation} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobileView && (
          <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="md:hidden text-gray-500"
            >
              <Menu size={24} />
            </Button>
            <h1 className="text-xl font-semibold text-center flex-1">
              {title || t(activeItem.toLowerCase())}
            </h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeItem={activeItem}
        onItemClick={handleNavigation}
        isSettingsSection={isSettingsSection}
      />
    </div>
  );
};

export default ResponsiveDashboardLayout;
