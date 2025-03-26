import { useState, useEffect } from "react";
import { useDevModeStore, simulateNetworkDelay } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Bug,
  Database,
  Gauge,
  Layers,
  Loader2,
  Settings,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface DevModePanelProps {
  onClose?: () => void;
}

export function DevModePanel({ onClose }: DevModePanelProps) {
  const { t } = useTranslation();
  const {
    enabled,
    toggleDevMode,
    mockData,
    toggleMockData,
    slowNetwork,
    toggleSlowNetwork,
    showAllFeatures,
    toggleShowAllFeatures,
    showDebugInfo,
    toggleDebugInfo,
  } = useDevModeStore();

  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  // Simulate getting memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof performance !== "undefined" && performance.memory) {
        // @ts-ignore - Not all browsers support this
        setMemoryUsage(
          Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTestNetworkDelay = async () => {
    setIsLoading(true);
    await simulateNetworkDelay();
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-blue-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Wrench className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-blue-800">
              {t("Developer Mode")}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {t("Tools and settings for development and testing")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              {t("General")}
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("Features")}
            </TabsTrigger>
            <TabsTrigger value="debug">
              <Bug className="h-4 w-4 mr-2" />
              {t("Debug")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode">{t("Developer Mode")}</Label>
                <p className="text-sm text-gray-500">
                  {t("Enable all developer tools")}
                </p>
              </div>
              <Switch
                id="dev-mode"
                checked={enabled}
                onCheckedChange={toggleDevMode}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mock-data">{t("Use Mock Data")}</Label>
                <p className="text-sm text-gray-500">
                  {t("Use sample data instead of API calls")}
                </p>
              </div>
              <Switch
                id="mock-data"
                checked={mockData}
                onCheckedChange={toggleMockData}
                disabled={!enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="slow-network">
                  {t("Simulate Slow Network")}
                </Label>
                <p className="text-sm text-gray-500">
                  {t("Add random delays to API calls")}
                </p>
              </div>
              <Switch
                id="slow-network"
                checked={slowNetwork}
                onCheckedChange={toggleSlowNetwork}
                disabled={!enabled}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNetworkDelay}
              disabled={!enabled || isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Testing...")}
                </>
              ) : (
                <>
                  <Gauge className="mr-2 h-4 w-4" />
                  {t("Test Network Delay")}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="features" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="all-features">{t("Show All Features")}</Label>
                <p className="text-sm text-gray-500">
                  {t("Enable all features including unreleased ones")}
                </p>
              </div>
              <Switch
                id="all-features"
                checked={showAllFeatures}
                onCheckedChange={toggleShowAllFeatures}
                disabled={!enabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("Available Features")}</h3>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-start">
                  <Layers className="h-3 w-3 mr-1" />
                  {t("Table Planner")}
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <Database className="h-3 w-3 mr-1" />
                  {t("Guest Management")}
                </Badge>
                <Badge variant="outline" className="justify-start bg-blue-50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("AI Seating")}
                </Badge>
                <Badge variant="outline" className="justify-start bg-blue-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {t("RSVP Reminders")}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-info">{t("Show Debug Info")}</Label>
                <p className="text-sm text-gray-500">
                  {t("Display technical information in the UI")}
                </p>
              </div>
              <Switch
                id="debug-info"
                checked={showDebugInfo}
                onCheckedChange={toggleDebugInfo}
                disabled={!enabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("System Information")}</h3>
              <div className="bg-gray-50 p-3 rounded-md text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span>{t("React Version")}:</span>
                  <span>18.2.0</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Environment")}:</span>
                  <span>{import.meta.env.MODE}</span>
                </div>
                {memoryUsage !== null && (
                  <div className="flex justify-between">
                    <span>{t("Memory Usage")}:</span>
                    <span>{memoryUsage} MB</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gray-50 flex justify-between">
        <p className="text-xs text-gray-500">
          {t("Developer mode is")}{" "}
          {enabled ? (
            <span className="text-green-600 font-medium">{t("active")}</span>
          ) : (
            <span className="text-gray-600">{t("inactive")}</span>
          )}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onClose) onClose();
          }}
        >
          {t("Close")}
        </Button>
      </CardFooter>
    </Card>
  );
}
