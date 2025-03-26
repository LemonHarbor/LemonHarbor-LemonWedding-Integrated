import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/useTranslation";
import { Paintbrush, Save, RotateCcw, Check, Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  enableAnimations: boolean;
  darkMode: boolean;
  highContrast: boolean;
}

interface ThemeCustomizerProps {
  onApplyTheme?: (settings: ThemeSettings) => void;
  initialSettings?: Partial<ThemeSettings>;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  primaryColor: "#e11d48", // rose-600
  secondaryColor: "#3b82f6", // blue-500
  accentColor: "#10b981", // emerald-500
  fontFamily: "Inter",
  borderRadius: "medium",
  enableAnimations: true,
  darkMode: false,
  highContrast: false,
};

const COLOR_OPTIONS = [
  { name: "Rose", value: "#e11d48" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
];

const FONT_OPTIONS = [
  { name: "Inter", value: "Inter" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Playfair Display", value: "Playfair Display" },
];

const BORDER_RADIUS_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Small", value: "small" },
  { name: "Medium", value: "medium" },
  { name: "Large", value: "large" },
];

/**
 * ColorPicker component for selecting colors
 */
const ColorPicker = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { name: string; value: string }[];
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${value === option.value ? "border-gray-900 ring-2 ring-black ring-opacity-10" : "border-gray-200"}`}
                style={{ backgroundColor: option.value }}
                onClick={() => onChange(option.value)}
                aria-label={option.name}
              >
                {value === option.value && (
                  <Check className="h-4 w-4 text-white mx-auto" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{option.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

/**
 * SelectOption component for selecting from a dropdown
 */
const SelectOption = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { name: string; value: string }[];
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * ToggleOption component for boolean settings
 */
const ToggleOption = ({
  label,
  checked,
  onChange,
  badge,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badge?: { text: string; variant?: "default" | "outline" };
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Label className="text-sm">{label}</Label>
        {badge && (
          <Badge variant={badge.variant || "outline"} className="ml-2 text-xs">
            {badge.text}
          </Badge>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
};

/**
 * ThemeCustomizer component allows users to customize the visual appearance
 * of the wedding planning application.
 */
export function ThemeCustomizer({
  onApplyTheme,
  initialSettings,
}: ThemeCustomizerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    // Merge default settings with initial settings if provided
    return { ...DEFAULT_SETTINGS, ...initialSettings };
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("themeSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings === "object" && parsedSettings !== null) {
          setSettings((prev) => ({ ...prev, ...parsedSettings }));
        }
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    }
  }, []);

  // Update a single setting with type safety
  const updateSetting = useCallback(
    <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        setHasChanges(true);
        return newSettings;
      });
    },
    [],
  );

  // Apply theme settings to the document
  const applyThemeToDocument = useCallback((themeSettings: ThemeSettings) => {
    const root = document.documentElement;

    // Apply colors
    root.style.setProperty("--primary-color", themeSettings.primaryColor);
    root.style.setProperty("--secondary-color", themeSettings.secondaryColor);
    root.style.setProperty("--accent-color", themeSettings.accentColor);

    // Apply font family
    root.style.setProperty("--font-family", themeSettings.fontFamily);

    // Apply border radius
    let borderRadiusValue = "0.5rem";
    switch (themeSettings.borderRadius) {
      case "none":
        borderRadiusValue = "0";
        break;
      case "small":
        borderRadiusValue = "0.25rem";
        break;
      case "medium":
        borderRadiusValue = "0.5rem";
        break;
      case "large":
        borderRadiusValue = "1rem";
        break;
    }
    root.style.setProperty("--border-radius", borderRadiusValue);

    // Apply dark mode
    if (themeSettings.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Apply high contrast
    if (themeSettings.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    // Apply animations
    if (!themeSettings.enableAnimations) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem("themeSettings", JSON.stringify(settings));

      // Apply theme settings
      applyThemeToDocument(settings);

      // Call the callback if provided
      if (onApplyTheme) {
        onApplyTheme(settings);
      }

      setHasChanges(false);

      toast({
        title: t("common.success"),
        description:
          t("settings.themeSettingsSaved") ||
          "Theme settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving theme settings:", error);
      toast({
        title: t("common.error"),
        description:
          t("settings.errorSavingSettings") || "Error saving theme settings",
        variant: "destructive",
      });
    }
  }, [settings, onApplyTheme, applyThemeToDocument, t, toast]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);

    toast({
      title: t("common.info"),
      description: t("settings.settingsReset") || "Settings reset to defaults",
    });
  }, [t, toast]);

  // Preview the current theme settings
  const previewTheme = useCallback(() => {
    applyThemeToDocument(settings);

    toast({
      title: t("common.info") || "Info",
      description: t("settings.themePreview") || "Theme preview applied",
    });
  }, [settings, applyThemeToDocument, t, toast]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Paintbrush
            className="h-5 w-5 text-rose-500 mr-2"
            aria-hidden="true"
          />
          {t("settings.themeCustomization") || "Theme Customization"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Color Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center">
              <Palette className="h-4 w-4 mr-1 text-gray-500" />
              {t("settings.colorSettings") || "Color Settings"}
            </h3>

            <div className="space-y-4">
              <ColorPicker
                label={t("settings.primaryColor") || "Primary Color"}
                value={settings.primaryColor}
                onChange={(value) => updateSetting("primaryColor", value)}
                options={COLOR_OPTIONS}
              />

              <ColorPicker
                label={t("settings.secondaryColor") || "Secondary Color"}
                value={settings.secondaryColor}
                onChange={(value) => updateSetting("secondaryColor", value)}
                options={COLOR_OPTIONS}
              />

              <ColorPicker
                label={t("settings.accentColor") || "Accent Color"}
                value={settings.accentColor}
                onChange={(value) => updateSetting("accentColor", value)}
                options={COLOR_OPTIONS}
              />
            </div>
          </div>

          <Separator />

          {/* Typography Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              {t("settings.typographySettings") || "Typography Settings"}
            </h3>

            <SelectOption
              label={t("settings.fontFamily") || "Font Family"}
              value={settings.fontFamily}
              onChange={(value) => updateSetting("fontFamily", value)}
              options={FONT_OPTIONS}
            />
          </div>

          <Separator />

          {/* Interface Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              {t("settings.interfaceSettings") || "Interface Settings"}
            </h3>

            <SelectOption
              label={t("settings.borderRadius") || "Border Radius"}
              value={settings.borderRadius}
              onChange={(value) => updateSetting("borderRadius", value)}
              options={BORDER_RADIUS_OPTIONS}
            />

            <ToggleOption
              label={t("settings.enableAnimations") || "Enable Animations"}
              checked={settings.enableAnimations}
              onChange={(checked) => updateSetting("enableAnimations", checked)}
            />

            <ToggleOption
              label={t("settings.darkMode") || "Dark Mode"}
              checked={settings.darkMode}
              onChange={(checked) => updateSetting("darkMode", checked)}
              badge={{ text: t("common.beta") || "Beta", variant: "outline" }}
            />

            <ToggleOption
              label={t("settings.highContrast") || "High Contrast"}
              checked={settings.highContrast}
              onChange={(checked) => updateSetting("highContrast", checked)}
              badge={{
                text: t("common.accessibility") || "Accessibility",
                variant: "outline",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previewTheme}
              className="flex items-center"
              aria-label={t("common.preview") || "Preview"}
            >
              <Palette className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("common.preview") || "Preview"}
            </Button>

            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="flex items-center"
                aria-label={t("common.reset") || "Reset"}
              >
                <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                {t("common.reset") || "Reset"}
              </Button>

              <Button
                size="sm"
                onClick={saveSettings}
                disabled={!hasChanges}
                className="flex items-center bg-rose-600 hover:bg-rose-700"
                aria-label={t("common.save") || "Save"}
              >
                <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                {t("common.save") || "Save"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ThemeCustomizer;
