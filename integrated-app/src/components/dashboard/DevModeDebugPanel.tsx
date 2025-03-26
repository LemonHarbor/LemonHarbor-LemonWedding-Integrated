import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shouldShowDebugInfo } from "@/lib/devMode";
import { useTranslation } from "@/lib/useTranslation";

interface DebugInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  props: Record<string, any>;
}

interface DevModeDebugPanelProps {
  componentName: string;
  props?: Record<string, any>;
}

// Keep track of component render counts globally
const renderCounts: Record<string, number> = {};

export function DevModeDebugPanel({
  componentName,
  props = {},
}: DevModeDebugPanelProps) {
  const { t } = useTranslation();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    componentName,
    renderCount: 0,
    lastRenderTime: Date.now(),
    props: sanitizeProps(props),
  });

  // Only show if debug info is enabled
  if (!shouldShowDebugInfo()) {
    return null;
  }

  // Update render count and time on each render
  useEffect(() => {
    if (!renderCounts[componentName]) {
      renderCounts[componentName] = 0;
    }

    renderCounts[componentName]++;

    setDebugInfo({
      componentName,
      renderCount: renderCounts[componentName],
      lastRenderTime: Date.now(),
      props: sanitizeProps(props),
    });
  }, [componentName, props]);

  return (
    <div className="absolute top-0 right-0 z-50 p-2 max-w-xs">
      <Card className="border border-blue-300 bg-blue-50 shadow-sm text-xs">
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-mono flex items-center justify-between">
            <span>{debugInfo.componentName}</span>
            <Badge variant="outline" className="text-[10px] h-5 bg-blue-100">
              {t("Renders")}: {debugInfo.renderCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="font-mono text-[10px] overflow-auto max-h-32">
            {Object.entries(debugInfo.props).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-blue-700">{key}:</span>
                <span className="text-gray-700 truncate max-w-[120px]">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to sanitize props for display (remove functions, etc.)
function sanitizeProps(props: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(props).forEach(([key, value]) => {
    // Skip functions and complex objects
    if (typeof value === "function") {
      sanitized[key] = "[Function]";
    } else if (value instanceof Element || value instanceof Node) {
      sanitized[key] = "[DOM Element]";
    } else if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = `Array(${value.length})`;
      } else {
        sanitized[key] = "{...}";
      }
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}
