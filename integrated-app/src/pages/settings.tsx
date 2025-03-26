import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import PermissionSettings from "@/components/settings/PermissionSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import VisibilitySettings from "@/components/settings/VisibilitySettings";
import { User, Shield, Users, Bell, Palette, Eye } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language";
import { useAuth } from "@/context/AuthContext";
import { PermissionGuard } from "@/components/ui/permission-guard";

const SettingsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isCouple = user?.role === "couple";

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("settings.manageAccount")}
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="border-b mb-6">
            <TabsList className="flex h-10 w-full justify-start rounded-none bg-transparent p-0 mb-0 overflow-x-auto">
              <TabsTrigger
                value="profile"
                className={cn(
                  "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                )}
              >
                <User className="h-4 w-4" />
                {t("settings.profile")}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className={cn(
                  "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                )}
              >
                <Shield className="h-4 w-4" />
                {t("settings.security")}
              </TabsTrigger>
              <PermissionGuard requiredPermission="canManagePermissions">
                <TabsTrigger
                  value="permissions"
                  className={cn(
                    "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  )}
                >
                  <Users className="h-4 w-4" />
                  {t("settings.permissions")}
                </TabsTrigger>
              </PermissionGuard>
              <TabsTrigger
                value="notifications"
                className={cn(
                  "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                )}
              >
                <Bell className="h-4 w-4" />
                {t("settings.notifications")}
              </TabsTrigger>
              <TabsTrigger
                value="themes"
                className={cn(
                  "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                )}
              >
                <Palette className="h-4 w-4" />
                {t("settings.themes")}
              </TabsTrigger>
              {isCouple && (
                <TabsTrigger
                  value="visibility"
                  className={cn(
                    "flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  )}
                >
                  <Eye className="h-4 w-4" />
                  Visibility
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings
              initialData={{
                firstName: "John",
                lastName: "Smith",
                email: "john.smith@example.com",
                phone: "+1 (555) 123-4567",
                weddingDate: new Date(
                  new Date().setMonth(new Date().getMonth() + 6),
                ),
                weddingLocation: "Grand Plaza Hotel, New York",
                partnerFirstName: "Jane",
                partnerLastName: "Smith",
                additionalNotes:
                  "We're planning an outdoor ceremony with an indoor reception.",
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings
              currentEmail="john.smith@example.com"
              lastPasswordChange="2 months ago"
              hasTwoFactorEnabled={false}
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <ThemeSettings
              onPurchaseTheme={async (themeId) => {
                // Simulate a purchase API call
                await new Promise((resolve) => setTimeout(resolve, 1500));
                // Return true to indicate success (in a real app, this would be the API response)
                return true;
              }}
            />
          </TabsContent>

          <TabsContent value="visibility" className="space-y-6">
            <VisibilitySettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
