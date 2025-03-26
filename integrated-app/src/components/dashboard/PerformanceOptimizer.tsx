import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/useTranslation";
import { Zap, Info, Save, RotateCcw, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PerformanceSettings {
  enablePagination: boolean;
  itemsPerPage: number;
  enableLazyLoading: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableDataCompression: boolean;
  enableImageOptimization: boolean;
}

interface PerformanceOptimizerProps {
  onApplySettings?: (settings: PerformanceSettings) => void;
  initialSettings?: Partial<PerformanceSettings>;
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  enablePagination: true,
  itemsPerPage: 10,
  enableLazyLoading: true,
  enableCaching: true,
  cacheTimeout: 5, // minutes
  enableDataCompression: false,
  enableImageOptimization: true,
};

// Extracted components for better modularity
interface SettingToggleProps {
  title: string;
  tooltip: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  badge?: {
    text: string;
    variant?: "default" | "outline";
    className?: string;
  };
}

const SettingToggle = memo(
  ({ title, tooltip, isChecked, onToggle, badge }: SettingToggleProps) => {
    const { t } = useTranslation();

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-sm font-medium">{title}</h3>
          {badge && (
            <Badge
              variant={badge.variant || "outline"}
              className={
                badge.className || "ml-2 text-xs bg-yellow-50 text-yellow-800"
              }
            >
              {badge.text}
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="h-4 w-4 text-gray-400 ml-1 cursor-help"
                  aria-label={t("common.moreInfo")}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          checked={isChecked}
          onCheckedChange={onToggle}
          aria-label={title}
        />
      </div>
    );
  },
);
SettingToggle.displayName = "SettingToggle";

interface SelectOptionProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: Array<{ value: number; label: string }>;
}

const SelectOption = memo(
  ({ id, label, value, onChange, options }: SelectOptionProps) => (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
);
SelectOption.displayName = "SelectOption";

/**
 * PerformanceOptimizer component allows users to configure performance settings
 * for the application to optimize for their specific needs and device capabilities.
 */
export function PerformanceOptimizer({
  onApplySettings,
  initialSettings,
}: PerformanceOptimizerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PerformanceSettings>(() => {
    // Merge default settings with initial settings if provided
    return { ...DEFAULT_SETTINGS, ...initialSettings };
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("performanceSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Validate parsed settings to ensure they match expected structure
          if (typeof parsedSettings === "object" && parsedSettings !== null) {
            // Merge with defaults to ensure all properties exist
            setSettings((prev) => ({ ...prev, ...parsedSettings }));
          }
        }
      } catch (error) {
        console.error("Error loading performance settings:", error);
        setError(t("settings.errorLoadingSettings"));
      }
    };

    loadSettings();
  }, [t]);

  // Update a single setting with type safety
  const updateSetting = useCallback(
    <K extends keyof PerformanceSettings>(
      key: K,
      value: PerformanceSettings[K],
    ) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        setHasChanges(true);
        return newSettings;
      });
      setError(null); // Clear any previous errors when settings change
    },
    [],
  );

  // Save settings with error handling
  const saveSettings = useCallback(() => {
    try {
      // Validate settings before saving
      if (settings.itemsPerPage <= 0) {
        throw new Error(t("settings.invalidItemsPerPage"));
      }

      if (settings.cacheTimeout <= 0) {
        throw new Error(t("settings.invalidCacheTimeout"));
      }

      // Save to localStorage
      localStorage.setItem("performanceSettings", JSON.stringify(settings));

      // Apply settings if callback provided
      if (onApplySettings) {
        onApplySettings(settings);
      }

      setHasChanges(false);
      setError(null);

      toast({
        title: t("common.success"),
        description: t("settings.performanceSettingsSaved"),
      });
    } catch (error) {
      console.error("Error saving performance settings:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("settings.errorSavingSettings"),
      );

      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.errorSavingSettings"),
        variant: "destructive",
      });
    }
  }, [settings, onApplySettings, t, toast]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    setError(null);

    toast({
      title: t("common.info"),
      description: t("settings.settingsReset"),
    });
  }, [t, toast]);

  // Generate options for select inputs
  const itemsPerPageOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

  const cacheTimeoutOptions = [
    { value: 1, label: `1 ${t("common.minute")}` },
    { value: 5, label: `5 ${t("common.minutes")}` },
    { value: 15, label: `15 ${t("common.minutes")}` },
    { value: 30, label: `30 ${t("common.minutes")}` },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 text-yellow-500 mr-2" aria-hidden="true" />
          {t("settings.performanceOptimization")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Pagination Settings */}
          <div className="space-y-3">
            <SettingToggle
              title={t("settings.pagination")}
              tooltip={t("settings.paginationTooltip")}
              isChecked={settings.enablePagination}
              onToggle={(checked) => updateSetting("enablePagination", checked)}
            />

            {settings.enablePagination && (
              <div className="pl-4 border-l-2 border-gray-100">
                <SelectOption
                  id="itemsPerPage"
                  label={t("settings.itemsPerPage")}
                  value={settings.itemsPerPage}
                  onChange={(value) => updateSetting("itemsPerPage", value)}
                  options={itemsPerPageOptions}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Lazy Loading */}
          <SettingToggle
            title={t("settings.lazyLoading")}
            tooltip={t("settings.lazyLoadingTooltip")}
            isChecked={settings.enableLazyLoading}
            onToggle={(checked) => updateSetting("enableLazyLoading", checked)}
          />

          <Separator />

          {/* Caching */}
          <div className="space-y-3">
            <SettingToggle
              title={t("settings.caching")}
              tooltip={t("settings.cachingTooltip")}
              isChecked={settings.enableCaching}
              onToggle={(checked) => updateSetting("enableCaching", checked)}
            />

            {settings.enableCaching && (
              <div className="pl-4 border-l-2 border-gray-100">
                <SelectOption
                  id="cacheTimeout"
                  label={t("settings.cacheTimeout")}
                  value={settings.cacheTimeout}
                  onChange={(value) => updateSetting("cacheTimeout", value)}
                  options={cacheTimeoutOptions}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Data Compression */}
          <SettingToggle
            title={t("settings.dataCompression")}
            tooltip={t("settings.dataCompressionTooltip")}
            isChecked={settings.enableDataCompression}
            onToggle={(checked) =>
              updateSetting("enableDataCompression", checked)
            }
            badge={{ text: t("common.experimental") }}
          />

          <Separator />

          {/* Image Optimization */}
          <SettingToggle
            title={t("settings.imageOptimization")}
            tooltip={t("settings.imageOptimizationTooltip")}
            isChecked={settings.enableImageOptimization}
            onToggle={(checked) =>
              updateSetting("enableImageOptimization", checked)
            }
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="flex items-center"
              aria-label={t("common.reset")}
            >
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("common.reset")}
            </Button>
            <Button
              size="sm"
              onClick={saveSettings}
              disabled={!hasChanges}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
              aria-label={t("common.save")}
            >
              <Save className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("common.save")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceOptimizer;
