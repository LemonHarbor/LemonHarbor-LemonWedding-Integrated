import React from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarHeart,
  Users2,
  SquareMenu,
  Wallet,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface MobileNavigationProps {
  activeItem?: string;
  onItemClick?: (label: string) => void;
  isSettingsSection?: boolean;
}

const MobileNavigation = ({
  activeItem = "Home",
  onItemClick = () => {},
  isSettingsSection = false,
}: MobileNavigationProps) => {
  const { t } = useTranslation();

  const dashboardNavItems = [
    {
      icon: <CalendarHeart size={20} />,
      label: "Overview",
      translationKey: "overview",
      isActive: activeItem === "Overview",
    },
    {
      icon: <Users2 size={20} />,
      label: "Guests",
      translationKey: "guests",
      isActive: activeItem === "Guests",
    },
    {
      icon: <SquareMenu size={20} />,
      label: "Tables",
      translationKey: "tables",
      isActive: activeItem === "Tables",
    },
    {
      icon: <Wallet size={20} />,
      label: "Budget",
      translationKey: "budget",
      isActive: activeItem === "Budget",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      translationKey: "settings",
      isActive: activeItem === "Settings",
    },
  ];

  const settingsNavItems = [
    {
      icon: <CalendarHeart size={20} />,
      label: "Dashboard",
      translationKey: "dashboard",
      isActive: false,
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      translationKey: "settings",
      isActive: true,
    },
  ];

  const navItems = isSettingsSection ? settingsNavItems : dashboardNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Button
            key={item.translationKey}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center justify-center p-1 h-auto min-w-[60px] ${
              item.isActive ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => onItemClick(item.label)}
            aria-label={t(item.translationKey)}
          >
            <span
              className={`${item.isActive ? "text-blue-600" : "text-gray-500"}`}
            >
              {item.icon}
            </span>
            <span className="text-xs mt-1">{t(item.translationKey)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
