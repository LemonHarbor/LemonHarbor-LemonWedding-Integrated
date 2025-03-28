import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SystemSettings() {
  const { t } = useTranslation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t("admin.systemSettings")}</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="maintenance-mode">
            {t("admin.maintenanceMode")}
          </Label>
          <Switch
            id="maintenance-mode"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">{t("admin.apiKey")}</Label>
          <div className="flex space-x-2">
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t("admin.enterApiKey")}
            />
            <Button variant="outline">
              {t("admin.generate")}
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <Button>
            {t("admin.saveSettings")}
          </Button>
        </div>
      </div>
    </div>
  );
}
