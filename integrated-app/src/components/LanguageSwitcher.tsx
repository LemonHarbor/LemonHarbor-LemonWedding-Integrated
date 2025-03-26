import { LanguageCode, languageNames, useLanguageStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";

export interface LanguageSwitcherProps {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "secondary"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  onLanguageChange?: (language: LanguageCode) => void;
}

// Export as both default and named export for compatibility
export function LanguageSwitcher({
  variant = "outline",
  size = "default",
  showLabel = true,
  showIcon = true,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  iconClassName = "",
  labelClassName = "",
  align = "end",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn("flex items-center gap-2", buttonClassName)}
            aria-label="Select language"
          >
            {showIcon && (
              <Globe
                className={cn("h-4 w-4", iconClassName)}
                aria-hidden="true"
              />
            )}
            {showLabel && (
              <span className={cn(labelClassName)}>
                {languageNames[language]}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn("min-w-[8rem]", dropdownClassName)}
        >
          {Object.entries(languageNames).map(([code, name]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code as LanguageCode)}
              className={cn(
                "cursor-pointer",
                language === code ? "bg-accent font-medium" : "",
              )}
            >
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Also export as default for backward compatibility
export default LanguageSwitcher;
