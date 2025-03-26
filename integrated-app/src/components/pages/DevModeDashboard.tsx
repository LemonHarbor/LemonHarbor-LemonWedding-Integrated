import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DevModePanel } from "@/components/DevModePanel";
import { DevModeApiTester } from "@/components/dashboard/DevModeApiTester";
import { AllFeaturesDemo } from "@/components/dashboard/DevModeFeatureDemo";
import { useDevModeStore } from "@/lib/devMode";
import { useTranslation } from "@/lib/useTranslation";
import {
  AlertCircle,
  Bug,
  Database,
  Gauge,
  Layers,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";
import ResponsiveDashboardLayout from "@/components/dashboard/layout/ResponsiveDashboardLayout";

export default function DevModeDashboard() {
  const { t } = useTranslation();
  const { enabled } = useDevModeStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Only show in development mode
  if (
    import.meta.env.MODE !== "development" &&
    !import.meta.env.VITE_FORCE_DEV_TOOLS
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>{t("Developer Mode")}</CardTitle>
            <CardDescription>
              {t("Developer mode is only available in development environment")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} className="w-full">
              {t("Go Back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ResponsiveDashboardLayout title={t("Developer Tools")}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Wrench className="mr-2 h-6 w-6 text-blue-600" />
              {t("Developer Mode")}
              {enabled ? (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {t("Enabled")}
                </Badge>
              ) : (
                <Badge className="ml-2 bg-gray-100 text-gray-800">
                  {t("Disabled")}
                </Badge>
              )}
            </h1>
            <p className="text-gray-500">
              {t("Tools and settings for development and testing")}
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-1 sm:grid-cols-4 w-full">
            <TabsTrigger value="overview">
              <Settings className="h-4 w-4 mr-2" />
              {t("Overview")}
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("Features")}
            </TabsTrigger>
            <TabsTrigger value="api">
              <Database className="h-4 w-4 mr-2" />
              {t("API")}
            </TabsTrigger>
            <TabsTrigger value="debug">
              <Bug className="h-4 w-4 mr-2" />
              {t("Debug")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DevModePanel />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                    {t("Important Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      {t("How to Use Developer Mode")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "Developer mode provides tools for testing and debugging the wedding planner application. Use the toggle in the bottom right corner to enable or disable developer mode.",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      {t("Removing Developer Mode")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "To completely remove developer mode from the application, remove the DevModeWrapper component from App.tsx and delete the related files.",
                      )}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md text-xs font-mono">
                      <p>1. Remove from App.tsx:</p>
                      <p className="text-blue-600 mt-1">
                        {
                          'import { DevModeWrapper } from "./components/DevModeWrapper";'
                        }
                      </p>
                      <p className="text-blue-600">
                        {"<DevModeWrapper>...</DevModeWrapper>"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-600" />
                  {t("Available Developer Tools")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border border-blue-200">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                        {t("Feature Showcase")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600 mb-4">
                        {t("Preview all features including experimental ones")}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("features")}
                      >
                        {t("View Features")}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-blue-200">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <Database className="h-4 w-4 mr-2 text-blue-600" />
                        {t("API Tester")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600 mb-4">
                        {t("Test API endpoints and view responses")}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("api")}
                      >
                        {t("Test API")}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-blue-200">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-center">
                        <Gauge className="h-4 w-4 mr-2 text-blue-600" />
                        {t("Network Simulation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-600 mb-4">
                        {t("Simulate slow network conditions")}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("overview")}
                      >
                        {t("Configure")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <AllFeaturesDemo />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <DevModeApiTester />
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bug className="h-5 w-5 mr-2 text-blue-600" />
                  {t("Debug Information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {t("Environment")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t("Mode")}:</span>
                      <span className="ml-2 font-medium">
                        {import.meta.env.MODE}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("Base URL")}:</span>
                      <span className="ml-2 font-medium">
                        {import.meta.env.BASE_URL}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("Dev Mode")}:</span>
                      <span className="ml-2 font-medium">
                        {enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t("Supabase URL")}:
                      </span>
                      <span className="ml-2 font-medium truncate">
                        {import.meta.env.VITE_SUPABASE_URL
                          ? "✓ Set"
                          : "✗ Not Set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {t("Browser Information")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t("User Agent")}:</span>
                      <span className="ml-2 font-medium text-xs">
                        {typeof navigator !== "undefined"
                          ? navigator.userAgent.substring(0, 50) + "..."
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("Window Size")}:</span>
                      <span className="ml-2 font-medium">
                        {typeof window !== "undefined"
                          ? `${window.innerWidth}x${window.innerHeight}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {t("Local Storage")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        wedding_planner_dev_mode:
                      </span>
                      <span className="text-sm font-medium">
                        {typeof localStorage !== "undefined" &&
                          localStorage.getItem("wedding_planner_dev_mode")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">language:</span>
                      <span className="text-sm font-medium">
                        {typeof localStorage !== "undefined" &&
                          localStorage.getItem("language")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDashboardLayout>
  );
}
