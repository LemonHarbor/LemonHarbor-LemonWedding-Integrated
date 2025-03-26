import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/useTranslation";
import { supabase } from "../../../supabase/supabase";
import {
  Shield,
  Info,
  Key,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface SecuritySettings {
  enableTwoFactor: boolean;
  sessionTimeout: number; // minutes
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  maxLoginAttempts: number;
}

interface SecuritySettingsProps {
  initialSettings?: Partial<SecuritySettings>;
  onSettingsChange?: (settings: SecuritySettings) => void;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  enableTwoFactor: false,
  sessionTimeout: 60, // 1 hour
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  maxLoginAttempts: 5,
};

// Extracted components for better modularity
interface SettingHeaderProps {
  title: string;
  tooltip?: string;
  badge?: {
    text: string;
    variant?: "default" | "outline";
    className?: string;
  };
}

const SettingHeader = memo(({ title, tooltip, badge }: SettingHeaderProps) => {
  const { t } = useTranslation();

  return (
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
      {tooltip && (
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
      )}
    </div>
  );
});
SettingHeader.displayName = "SettingHeader";

interface SettingToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingToggle = memo(
  ({ id, label, checked, onChange, disabled = false }: SettingToggleProps) => (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  ),
);
SettingToggle.displayName = "SettingToggle";

interface SelectOptionProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  options: Array<{ value: number | string; label: string }>;
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
        aria-label={label}
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

// Password validation utility
const validatePassword = (
  password: string,
  confirmPassword: string,
  settings: SecuritySettings,
): string | null => {
  const { t } = useTranslation();

  if (password !== confirmPassword) {
    return t("settings.passwordsDoNotMatch");
  }

  if (password.length < settings.passwordMinLength) {
    return t("settings.passwordTooShort", {
      length: settings.passwordMinLength,
    });
  }

  if (
    settings.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return t("settings.passwordRequiresSpecialChars");
  }

  if (settings.requireNumbers && !/\d/.test(password)) {
    return t("settings.passwordRequiresNumbers");
  }

  if (settings.requireUppercase && !/[A-Z]/.test(password)) {
    return t("settings.passwordRequiresUppercase");
  }

  return null;
};

/**
 * SecuritySettings component allows users to configure security settings
 * for their account and wedding planning environment.
 */
export function SecuritySettings({
  initialSettings,
  onSettingsChange,
}: SecuritySettingsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>(() => {
    // Merge default settings with initial settings if provided
    return { ...DEFAULT_SETTINGS, ...initialSettings };
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("securitySettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Validate parsed settings to ensure they match expected structure
        if (typeof parsedSettings === "object" && parsedSettings !== null) {
          // Merge with defaults to ensure all properties exist
          setSettings((prev) => ({ ...prev, ...parsedSettings }));
        }
      }
    } catch (error) {
      console.error("Error loading security settings:", error);
      setError(t("settings.errorLoadingSettings"));
    }
  }, [t]);

  // Update a single setting with type safety
  const updateSetting = useCallback(
    <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
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
      localStorage.setItem("securitySettings", JSON.stringify(settings));

      // Apply session timeout setting
      if (settings.sessionTimeout > 0) {
        // This is just a simulation - in a real app, you would configure the auth provider
        console.log(
          `Setting session timeout to ${settings.sessionTimeout} minutes`,
        );
      }

      setHasChanges(false);
      setError(null);

      // Notify parent component if callback provided
      if (onSettingsChange) {
        onSettingsChange(settings);
      }

      toast({
        title: t("common.success"),
        description: t("settings.securitySettingsSaved"),
      });
    } catch (error) {
      console.error("Error saving security settings:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("settings.errorSavingSettings"),
      );

      toast({
        title: t("common.error"),
        description: t("settings.errorSavingSettings"),
        variant: "destructive",
      });
    }
  }, [settings, t, toast, onSettingsChange]);

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

  // Handle password change with improved validation
  const handlePasswordChange = useCallback(async () => {
    setPasswordError(null);
    setIsChangingPassword(true);

    // Use the utility function to validate password
    const validationError = validatePassword(
      newPassword,
      confirmPassword,
      settings,
    );
    if (validationError) {
      setPasswordError(validationError);
      setIsChangingPassword(false);
      return;
    }

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Close dialog and show success message
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: t("common.success"),
        description: t("settings.passwordChanged"),
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || t("settings.errorChangingPassword"));
    } finally {
      setIsChangingPassword(false);
    }
  }, [newPassword, confirmPassword, settings, t, toast]);

  // Generate options for select inputs
  const passwordLengthOptions = [
    { value: 6, label: "6" },
    { value: 8, label: "8" },
    { value: 10, label: "10" },
    { value: 12, label: "12" },
  ];

  const sessionTimeoutOptions = [
    { value: 15, label: `15 ${t("common.minutes")}` },
    { value: 30, label: `30 ${t("common.minutes")}` },
    { value: 60, label: `1 ${t("common.hour")}` },
    { value: 120, label: `2 ${t("common.hours")}` },
    { value: 240, label: `4 ${t("common.hours")}` },
  ];

  const loginAttemptsOptions = [
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Shield
              className="h-5 w-5 text-green-500 mr-2"
              aria-hidden="true"
            />
            {t("settings.securitySettings")}
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
            {/* Password Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SettingHeader title={t("settings.passwordSettings")} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="flex items-center"
                  aria-label={t("settings.changePassword")}
                >
                  <Key className="h-4 w-4 mr-1" aria-hidden="true" />
                  {t("settings.changePassword")}
                </Button>
              </div>

              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <SelectOption
                  id="passwordMinLength"
                  label={t("settings.passwordMinLength")}
                  value={settings.passwordMinLength}
                  onChange={(value) =>
                    updateSetting("passwordMinLength", value)
                  }
                  options={passwordLengthOptions}
                />

                <SettingToggle
                  id="requireSpecialChars"
                  label={t("settings.requireSpecialChars")}
                  checked={settings.requireSpecialChars}
                  onChange={(checked) =>
                    updateSetting("requireSpecialChars", checked)
                  }
                />

                <SettingToggle
                  id="requireNumbers"
                  label={t("settings.requireNumbers")}
                  checked={settings.requireNumbers}
                  onChange={(checked) =>
                    updateSetting("requireNumbers", checked)
                  }
                />

                <SettingToggle
                  id="requireUppercase"
                  label={t("settings.requireUppercase")}
                  checked={settings.requireUppercase}
                  onChange={(checked) =>
                    updateSetting("requireUppercase", checked)
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <SettingHeader
                title={t("settings.twoFactorAuth")}
                tooltip={t("settings.twoFactorAuthTooltip")}
                badge={{ text: t("common.comingSoon") }}
              />
              <Switch
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) =>
                  updateSetting("enableTwoFactor", checked)
                }
                disabled={true} // Disabled because it's coming soon
                aria-label={t("settings.twoFactorAuth")}
              />
            </div>

            <Separator />

            {/* Session Settings */}
            <div className="space-y-3">
              <SettingHeader
                title={t("settings.sessionSettings")}
                tooltip={t("settings.sessionSettingsTooltip")}
              />

              <div className="pl-4 border-l-2 border-gray-100">
                <SelectOption
                  id="sessionTimeout"
                  label={t("settings.sessionTimeout")}
                  value={settings.sessionTimeout}
                  onChange={(value) => updateSetting("sessionTimeout", value)}
                  options={sessionTimeoutOptions}
                />
              </div>
            </div>

            <Separator />

            {/* Login Attempt Limits */}
            <div className="space-y-3">
              <SettingHeader
                title={t("settings.loginAttemptLimits")}
                tooltip={t("settings.loginAttemptLimitsTooltip")}
              />

              <div className="pl-4 border-l-2 border-gray-100">
                <SelectOption
                  id="maxLoginAttempts"
                  label={t("settings.maxLoginAttempts")}
                  value={settings.maxLoginAttempts}
                  onChange={(value) => updateSetting("maxLoginAttempts", value)}
                  options={loginAttemptsOptions}
                />
              </div>
            </div>

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
                className="flex items-center bg-green-600 hover:bg-green-700"
                aria-label={t("common.save")}
              >
                <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                {t("common.save")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.changePassword")}</DialogTitle>
            <DialogDescription>
              {t("settings.changePasswordDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{passwordError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("settings.currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("settings.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1 mt-2">
              <p>{t("settings.passwordRequirements")}:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  {t("settings.minCharacters", {
                    count: settings.passwordMinLength,
                  })}
                </li>
                {settings.requireUppercase && (
                  <li>{t("settings.requireUppercaseChar")}</li>
                )}
                {settings.requireNumbers && (
                  <li>{t("settings.requireNumber")}</li>
                )}
                {settings.requireSpecialChars && (
                  <li>{t("settings.requireSpecialChar")}</li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isChangingPassword}
              aria-label={t("common.cancel")}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={
                isChangingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="bg-green-600 hover:bg-green-700"
              aria-label={t("common.save")}
            >
              {isChangingPassword ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t("common.processing")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
