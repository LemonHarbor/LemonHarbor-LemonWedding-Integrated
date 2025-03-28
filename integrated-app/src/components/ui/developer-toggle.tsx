import { useState } from "react";
import { Button } from "./button";
import { Switch } from "./switch";
import { Label } from "./label";

export function DeveloperToggle() {
  const [developerMode, setDeveloperMode] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="developer-mode" 
        checked={developerMode}
        onCheckedChange={setDeveloperMode}
      />
      <Label htmlFor="developer-mode">Developer Mode</Label>
    </div>
  );
}
