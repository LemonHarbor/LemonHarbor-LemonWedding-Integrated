import { useState } from "react";
import { useDevModeStore } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  InfoIcon,
  Wrench,
  Sparkles,
  Database,
  Settings,
  Bug,
  CheckCircle2,
} from "lucide-react";

export function DevModeGuide() {
  const { enabled, toggleDevMode, showAllFeatures, toggleShowAllFeatures } =
    useDevModeStore();
  const [activeTab, setActiveTab] = useState("guide");

  return (
    <Card className="w-full max-w-3xl border-2 border-blue-200 shadow-lg bg-white">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center">
          <Wrench className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle className="text-blue-800">Dev Mode Guide</CardTitle>
        </div>
        <CardDescription>
          Anleitung zur Verwendung des Developer Mode und seiner Funktionen
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="guide">
              <InfoIcon className="h-4 w-4 mr-2" />
              Anleitung
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              <Bug className="h-4 w-4 mr-2" />
              Problembehebung
            </TabsTrigger>
          </TabsList>

          <div className="p-4 space-y-4">
            <TabsContent value="guide" className="mt-0 space-y-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Dev Mode Status</AlertTitle>
                <AlertDescription>
                  Der Dev Mode ist aktuell{" "}
                  {enabled ? (
                    <Badge
                      variant="success"
                      className="bg-green-100 text-green-800"
                    >
                      aktiviert
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100">
                      deaktiviert
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Schritt 1: Dev Mode aktivieren
                </h3>
                <p className="text-sm text-gray-600">
                  Klicken Sie auf das Schraubenschlüssel-Symbol in der oberen
                  rechten Ecke oder verwenden Sie den Button unten:
                </p>
                <Button
                  onClick={toggleDevMode}
                  className={
                    enabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  {enabled ? "Dev Mode deaktivieren" : "Dev Mode aktivieren"}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Schritt 2: Features anzeigen
                </h3>
                <p className="text-sm text-gray-600">
                  Um alle Features zu sehen, müssen Sie im Dev Mode Panel auf
                  den Tab "Features" klicken und dann "Show All Features"
                  aktivieren:
                </p>
                {enabled && (
                  <Button
                    onClick={toggleShowAllFeatures}
                    variant="outline"
                    className="border-blue-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {showAllFeatures
                      ? "Alle Features ausblenden"
                      : "Alle Features anzeigen"}
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Schritt 3: Testdaten generieren
                </h3>
                <p className="text-sm text-gray-600">
                  Nach der Aktivierung von "Show All Features" erscheint der
                  "Test Data Generator" im Dashboard. Damit können Sie:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  <li>Zufällige Gäste generieren</li>
                  <li>Tische erstellen</li>
                  <li>Beziehungen zwischen Gästen definieren</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2 text-blue-500" />
                      Test Data Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-gray-600">
                    Erstellt Testdaten für Gäste, Tische und Beziehungen. Nur
                    sichtbar, wenn "Show All Features" aktiviert ist.
                  </CardContent>
                </Card>

                <Card className="border border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-blue-500" />
                      Network Simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-gray-600">
                    Simuliert langsame Netzwerkverbindungen, um das Verhalten
                    der App unter verschiedenen Bedingungen zu testen.
                  </CardContent>
                </Card>

                <Card className="border border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Bug className="h-4 w-4 mr-2 text-blue-500" />
                      Debug Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-gray-600">
                    Zeigt technische Informationen wie React-Version, Umgebung
                    und Speichernutzung an.
                  </CardContent>
                </Card>

                <Card className="border border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      Feature Showcase
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-gray-600">
                    Zeigt alle verfügbaren Features an, einschließlich solcher,
                    die sich noch in der Entwicklung befinden.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting" className="mt-0 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Häufige Probleme</h3>

                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Features werden nicht angezeigt
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    Stellen Sie sicher, dass Sie sowohl den Dev Mode als auch
                    "Show All Features" aktiviert haben. Beide Optionen müssen
                    eingeschaltet sein.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Test Data Generator ist nicht sichtbar
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    Der Test Data Generator erscheint nur, wenn "Show All
                    Features" aktiviert ist. Prüfen Sie im Features-Tab des Dev
                    Mode Panels, ob diese Option eingeschaltet ist.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Dev Mode Panel verschwindet
                  </h4>
                  <p className="text-sm text-gray-600 pl-6">
                    Das Panel kann mit dem X in der oberen rechten Ecke
                    geschlossen werden. Um es wieder zu öffnen, klicken Sie auf
                    das Schraubenschlüssel-Symbol in der Navigationsleiste.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between">
        <p className="text-xs text-gray-500">
          Diese Anleitung ist nur für Entwicklungszwecke gedacht.
        </p>
        {!enabled && (
          <Button size="sm" onClick={toggleDevMode}>
            <Wrench className="h-4 w-4 mr-2" />
            Dev Mode aktivieren
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
