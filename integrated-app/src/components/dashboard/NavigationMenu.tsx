import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";
import {
  Home,
  Users,
  Calendar,
  Settings,
  PieChart,
  Paintbrush,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationMenuProps {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
}

/**
 * NavigationMenu component provides navigation links for the wedding planning application.
 * It can be rendered in desktop or mobile variants.
 */
export function NavigationMenu({
  variant = "desktop",
  onClose,
}: NavigationMenuProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isMobile = variant === "mobile";

  const navItems = [
    {
      name: t("navigation.dashboard") || "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: t("navigation.weddingDashboard") || "Wedding Dashboard",
      path: "/wedding-dashboard",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: t("navigation.guests") || "Guests",
      path: "/guests",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: t("navigation.budget") || "Budget",
      path: "/budget",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      name: t("navigation.designCustomizer") || "Design Customizer",
      path: "/design-customizer",
      icon: <Paintbrush className="h-5 w-5" />,
    },
    {
      name: t("navigation.settings") || "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Mobile menu toggle button
  const mobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMenu}
      className="md:hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );

  // Navigation items
  const renderNavItems = () => (
    <ul className={cn("space-y-1", isMobile ? "mt-4" : "space-y-1")}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-rose-100 text-rose-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100",
                isMobile ? "text-base py-3" : "text-sm",
              )}
              onClick={isMobile ? handleClose : undefined}
            >
              <span
                className={cn(
                  "mr-3",
                  isActive ? "text-rose-600" : "text-gray-500",
                )}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // Mobile navigation menu
  if (isMobile) {
    return (
      <div className="md:hidden">
        {mobileMenuButton}

        {/* Mobile menu overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleClose}
          ></div>
        )}

        {/* Mobile menu panel */}
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-rose-600">
                {t("appName") || "Wedding Planner"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="p-4">{renderNavItems()}</nav>
        </div>
      </div>
    );
  }

  // Desktop navigation menu
  return (
    <nav className="hidden md:block w-56 border-r h-screen sticky top-0 overflow-y-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-rose-600">
          {t("appName") || "Wedding Planner"}
        </h2>
      </div>
      {renderNavItems()}
    </nav>
  );
}

export default NavigationMenu;
