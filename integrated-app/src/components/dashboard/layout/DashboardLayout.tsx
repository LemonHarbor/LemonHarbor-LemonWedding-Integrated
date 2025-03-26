import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import { useTranslation } from "@/lib/useTranslation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isSettingsSection?: boolean;
}

const DashboardLayout = ({
  children,
  isSettingsSection = false,
}: DashboardLayoutProps) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState(
    isSettingsSection ? "Settings" : "Home",
  );

  const handleNavigation = (item: string) => {
    setActiveItem(item);
    // Additional navigation logic can be added here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeItem={activeItem} onItemClick={handleNavigation} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      <MobileNavigation
        activeItem={activeItem}
        onItemClick={handleNavigation}
        isSettingsSection={isSettingsSection}
      />
    </div>
  );
};

export default DashboardLayout;
