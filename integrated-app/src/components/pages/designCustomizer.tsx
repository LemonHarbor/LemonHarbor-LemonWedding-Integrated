import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/useTranslation";
import ThemeCustomizer from "@/components/dashboard/ThemeCustomizer";
import LayoutCustomizer from "@/components/dashboard/LayoutCustomizer";
import PerformanceOptimizer from "@/components/dashboard/PerformanceOptimizer";
import SecuritySettings from "@/components/dashboard/SecuritySettings";
import { Paintbrush, Zap, Shield, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DesignCustomizer page allows users to customize the design and layout
 * of the wedding planning application.
 */
export default function DesignCustomizer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("theme");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("designCustomizer.title") || "Design Customizer"}
          </h1>
          <p className="text-muted-foreground">
            {t("designCustomizer.description") ||
              "Customize the appearance and behavior of your wedding planning dashboard."}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="theme"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="theme" className="flex items-center">
            <Paintbrush className="h-4 w-4 mr-2" />
            {t("designCustomizer.theme") || "Theme"}
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center">
            <Layout className="h-4 w-4 mr-2" />
            {t("designCustomizer.layout") || "Layout"}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            {t("designCustomizer.performance") || "Performance"}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            {t("designCustomizer.security") || "Security"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <ThemeCustomizer />
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <LayoutCustomizer />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceOptimizer />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
