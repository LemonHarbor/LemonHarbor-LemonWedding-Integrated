import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ChevronDown, Globe, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../../supabase/auth";
import { LanguageCode, languageNames, useLanguageStore } from "@/lib/i18n";
import { useTranslation } from "@/lib/useTranslation";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  coupleName?: string;
  weddingDate?: string;
  onLanguageChange?: (language: LanguageCode) => void;
}

export default function DashboardHeader({
  coupleName = "Emma & Noah",
  weddingDate = "July 15, 2023",
  onLanguageChange,
}: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  // Get language display code (uppercase)
  const displayLanguage = language.toUpperCase();

  // Language options with flags
  const languageOptions = [
    { code: "en" as LanguageCode, name: "English", flag: "🇬🇧" },
    { code: "de" as LanguageCode, name: "Deutsch", flag: "🇩🇪" },
    { code: "fr" as LanguageCode, name: "Français", flag: "🇫🇷" },
    { code: "es" as LanguageCode, name: "Español", flag: "🇪🇸" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-rose-700">{coupleName}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{weddingDate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enhanced Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="mr-1">
                    {languageOptions.find((l) => l.code === language)?.flag}{" "}
                    {displayLanguage}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {t("common.selectLanguage") || "Select Language"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.code}
                    className={`cursor-pointer flex items-center ${option.code === language ? "bg-gray-100" : ""}`}
                    onClick={() => handleLanguageChange(option.code)}
                  >
                    <span className="mr-2 text-base">{option.flag}</span>
                    <span>{option.name}</span>
                    {option.code === language && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 hover:cursor-pointer">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt={user?.email || ""}
                  />
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  {t("common.profileSettings") || "Profile Settings"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => signOut()}
                >
                  {t("common.logOut") || "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
