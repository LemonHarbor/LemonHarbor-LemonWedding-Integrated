import { useDevModeStore, shouldShowDebugInfo } from "@/lib/devMode";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bug, Database, Gauge, Wrench } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

export function DevModeIndicator() {
  const { t } = useTranslation();
  const { enabled, mockData, slowNetwork, showAllFeatures } = useDevModeStore();

  // Only show in development mode and when dev mode is enabled
  if (
    !enabled ||
    (import.meta.env.MODE !== "development" &&
      !import.meta.env.VITE_FORCE_DEV_TOOLS)
  ) {
    return null;
  }

  // Only show detailed info if debug info is enabled
  const showDetails = shouldShowDebugInfo();

  return (
    <div className="fixed top-0 left-0 z-50 p-2 flex gap-1 pointer-events-none">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-300 pointer-events-auto"
            >
              <Wrench className="h-3 w-3 mr-1" />
              {t("Dev")}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("Developer Mode Active")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showDetails && (
        <>
          {mockData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 border-amber-300 pointer-events-auto"
                  >
                    <Database className="h-3 w-3 mr-1" />
                    {t("Mock")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t("Using Mock Data")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {slowNetwork && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-800 border-red-300 pointer-events-auto"
                  >
                    <Gauge className="h-3 w-3 mr-1" />
                    {t("Slow")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t("Simulating Slow Network")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showAllFeatures && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 border-purple-300 pointer-events-auto"
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    {t("All")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t("All Features Enabled")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )}
    </div>
  );
}
