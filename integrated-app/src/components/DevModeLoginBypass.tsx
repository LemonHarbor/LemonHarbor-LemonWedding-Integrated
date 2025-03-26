import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDevModeStore } from "@/lib/devMode";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Key, Wrench } from "lucide-react";

export function DevModeLoginBypass() {
  const { enabled, toggleDevMode, setDevMode } = useDevModeStore();
  const navigate = useNavigate();
  const [superUserEmail, setSuperUserEmail] = useState("admin@lemonharbor.com");

  const handleBypassLogin = () => {
    // Enable dev mode if not already enabled
    if (!enabled) {
      setDevMode(true);
    }

    // Navigate to dashboard
    navigate("/wedding-dashboard");
  };

  const handleSuperUserLogin = () => {
    // Enable dev mode if not already enabled
    if (!enabled) {
      setDevMode(true);
    }

    // Store super user info in sessionStorage (will be cleared when browser is closed)
    sessionStorage.setItem(
      "devSuperUser",
      JSON.stringify({
        email: superUserEmail,
        isSuperUser: true,
        name: "Super Admin",
        id: "dev-super-user-id",
      }),
    );

    // Navigate to dashboard
    navigate("/wedding-dashboard");
  };

  return (
    <Card className="w-full max-w-md border-2 border-blue-200 shadow-lg mt-6">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 text-blue-600 mr-2" />
          Entwicklermodus
        </CardTitle>
        <CardDescription>Umgehe den Login für Testzwecke</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="standard">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="standard">Standard Bypass</TabsTrigger>
            <TabsTrigger value="superuser">Super User</TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <p className="text-sm text-gray-600 mb-4">
              Mit dieser Option kannst du den Login umgehen und direkt zum
              Dashboard gelangen, um die Features zu testen.
            </p>
            <Button
              onClick={handleBypassLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Dashboard ohne Login öffnen
            </Button>
          </TabsContent>

          <TabsContent value="superuser">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Als Super User anmelden, um erweiterte Funktionen zu testen.
                Diese Funktion ist nur im Entwicklermodus verfügbar.
              </p>

              <div className="space-y-2">
                <Label htmlFor="superUserEmail">Super User Email</Label>
                <Input
                  id="superUserEmail"
                  value={superUserEmail}
                  onChange={(e) => setSuperUserEmail(e.target.value)}
                  className="border-blue-200"
                />
              </div>

              <Button
                onClick={handleSuperUserLogin}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Als Super User anmelden
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 text-xs text-gray-500 italic">
        Diese Funktionen sind nur im Entwicklungsmodus verfügbar und werden in
        der Produktionsumgebung automatisch deaktiviert.
      </CardFooter>
    </Card>
  );
}
