import { ReactNode, useEffect } from "react";
import { DevModeToggle } from "./DevModeToggle";
import { DevModeIndicator } from "./DevModeIndicator";
import { useDevModeStore } from "@/lib/devMode";

interface DevModeWrapperProps {
  children: ReactNode;
}

export function DevModeWrapper({ children }: DevModeWrapperProps) {
  const { enabled } = useDevModeStore();

  // Log when dev mode is toggled
  useEffect(() => {
    if (enabled) {
      console.log(
        "%c🔧 Developer Mode Enabled",
        "background: #3b82f6; color: white; padding: 2px 4px; border-radius: 2px;",
      );
    } else {
      console.log(
        "%c🔧 Developer Mode Disabled",
        "background: #6b7280; color: white; padding: 2px 4px; border-radius: 2px;",
      );
    }
  }, [enabled]);

  return (
    <>
      {children}
      <DevModeToggle />
      <DevModeIndicator />
    </>
  );
}
