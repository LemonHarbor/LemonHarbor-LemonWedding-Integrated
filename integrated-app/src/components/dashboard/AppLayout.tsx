import React, { ReactNode } from "react";
import NavigationMenu from "./NavigationMenu";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useTranslation } from "@/lib/useTranslation";
import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout component provides a consistent layout structure for the application
 * with navigation, header, and content areas.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <NavigationMenu variant="desktop" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Mobile Navigation */}
            <NavigationMenu variant="mobile" />

            {/* Search */}
            <div className="hidden md:flex relative w-full max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search.placeholder") || "Search..."}
                className="pl-10"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />

              <Button variant="ghost" size="icon" className="text-gray-500">
                <Bell className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-gray-500">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
          <div className="container mx-auto px-4">
            {t("footer.copyright") ||
              "© 2023 Wedding Planner. All rights reserved."}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;
