import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/use-toast";
import { Layout, Save, Check, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  preview: React.ReactNode;
}

interface LayoutCustomizerProps {
  onSelectLayout?: (layoutId: string) => void;
  initialLayout?: string;
}

/**
 * LayoutCustomizer component allows users to select different layout options
 * for the wedding planning dashboard.
 */
export function LayoutCustomizer({
  onSelectLayout,
  initialLayout = "standard",
}: LayoutCustomizerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedLayout, setSelectedLayout] = useState(initialLayout);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Define layout options for different sections
  const dashboardLayouts: LayoutOption[] = [
    {
      id: "standard",
      name: t("layouts.dashboard.standard.name") || "Standard",
      description:
        t("layouts.dashboard.standard.description") ||
        "A balanced layout with key metrics and upcoming tasks",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-8 bg-rose-600 rounded-md mb-4"></div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="h-16 bg-blue-100 rounded-md"></div>
            <div className="h-16 bg-green-100 rounded-md"></div>
            <div className="h-16 bg-amber-100 rounded-md"></div>
          </div>
          <div className="w-full h-12 bg-gray-200 rounded-md"></div>
        </div>
      ),
    },
    {
      id: "compact",
      name: t("layouts.dashboard.compact.name") || "Compact",
      description:
        t("layouts.dashboard.compact.description") ||
        "Focused layout with more information in less space",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-6 bg-rose-600 rounded-md mb-2"></div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <div className="h-10 bg-blue-100 rounded-md"></div>
            <div className="h-10 bg-green-100 rounded-md"></div>
            <div className="h-10 bg-amber-100 rounded-md"></div>
            <div className="h-10 bg-purple-100 rounded-md"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-24 bg-gray-200 rounded-md"></div>
            <div className="h-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ),
    },
    {
      id: "modern",
      name: t("layouts.dashboard.modern.name") || "Modern",
      description:
        t("layouts.dashboard.modern.description") ||
        "Contemporary design with focus on visual elements",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="flex justify-between mb-4">
            <div className="w-1/3 h-8 bg-rose-600 rounded-full"></div>
            <div className="w-1/4 h-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-20 bg-blue-100 rounded-lg mb-2"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-green-100 rounded-lg"></div>
            <div className="h-12 bg-amber-100 rounded-lg"></div>
          </div>
        </div>
      ),
    },
  ];

  const guestLayouts: LayoutOption[] = [
    {
      id: "table",
      name: t("layouts.guests.table.name") || "Table View",
      description:
        t("layouts.guests.table.description") ||
        "Traditional table layout for guest management",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-8 bg-blue-500 rounded-md mb-4"></div>
          <div className="space-y-2">
            <div className="w-full h-6 bg-gray-200 rounded-md"></div>
            <div className="w-full h-6 bg-gray-200 rounded-md"></div>
            <div className="w-full h-6 bg-gray-200 rounded-md"></div>
            <div className="w-full h-6 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ),
    },
    {
      id: "cards",
      name: t("layouts.guests.cards.name") || "Card View",
      description:
        t("layouts.guests.cards.description") ||
        "Visual card-based layout for guest information",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-8 bg-blue-500 rounded-md mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ),
    },
  ];

  const budgetLayouts: LayoutOption[] = [
    {
      id: "detailed",
      name: t("layouts.budget.detailed.name") || "Detailed View",
      description:
        t("layouts.budget.detailed.description") ||
        "Comprehensive budget tracking with detailed breakdowns",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-8 bg-green-500 rounded-md mb-4"></div>
          <div className="flex gap-2 mb-2">
            <div className="w-2/3 h-20 bg-gray-200 rounded-md"></div>
            <div className="w-1/3 h-20 bg-gray-200 rounded-md"></div>
          </div>
          <div className="w-full h-8 bg-gray-200 rounded-md"></div>
        </div>
      ),
    },
    {
      id: "visual",
      name: t("layouts.budget.visual.name") || "Visual Charts",
      description:
        t("layouts.budget.visual.description") ||
        "Chart-focused view for visual budget tracking",
      preview: (
        <div className="border rounded-md p-4 bg-gray-50 h-48">
          <div className="w-full h-8 bg-green-500 rounded-md mb-4"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-28 bg-gray-200 rounded-full"></div>
            <div className="h-28 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ),
    },
  ];

  // Get current layout options based on active tab
  const getCurrentLayouts = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return dashboardLayouts;
      case "guests":
        return guestLayouts;
      case "budget":
        return budgetLayouts;
      default:
        return dashboardLayouts;
    }
  }, [activeTab, dashboardLayouts, guestLayouts, budgetLayouts]);

  // Handle layout selection
  const handleSelectLayout = useCallback(
    (layoutId: string) => {
      setSelectedLayout(layoutId);

      // Call the callback if provided
      if (onSelectLayout) {
        onSelectLayout(`${activeTab}-${layoutId}`);
      }

      toast({
        title: t("common.success") || "Success",
        description:
          t("layouts.layoutSelected") || "Layout selected successfully",
      });
    },
    [activeTab, onSelectLayout, t, toast],
  );

  // Apply the selected layout
  const applySelectedLayout = useCallback(() => {
    // In a real implementation, this would apply the layout to the application
    // For now, we'll just show a toast message
    toast({
      title: t("common.success") || "Success",
      description: t("layouts.layoutApplied") || "Layout applied successfully",
    });
  }, [t, toast]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Layout className="h-5 w-5 text-blue-500 mr-2" aria-hidden="true" />
          {t("settings.layoutCustomization") || "Layout Customization"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              {t("layouts.sections.dashboard") || "Dashboard"}
            </TabsTrigger>
            <TabsTrigger value="guests">
              {t("layouts.sections.guests") || "Guests"}
            </TabsTrigger>
            <TabsTrigger value="budget">
              {t("layouts.sections.budget") || "Budget"}
            </TabsTrigger>
          </TabsList>

          {["dashboard", "guests", "budget"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentLayouts().map((layout) => (
                  <div
                    key={layout.id}
                    className={`border rounded-md overflow-hidden transition-all ${selectedLayout === layout.id ? "ring-2 ring-blue-500" : "hover:border-blue-200"}`}
                  >
                    <div className="p-4">{layout.preview}</div>
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{layout.name}</h3>
                        {selectedLayout === layout.id && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {layout.description}
                      </p>
                      <Button
                        variant={
                          selectedLayout === layout.id ? "default" : "outline"
                        }
                        size="sm"
                        className={`w-full ${selectedLayout === layout.id ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                        onClick={() => handleSelectLayout(layout.id)}
                      >
                        {selectedLayout === layout.id
                          ? t("layouts.selected") || "Selected"
                          : t("layouts.select") || "Select"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button
            onClick={applySelectedLayout}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {t("layouts.applyChanges") || "Apply Changes"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LayoutCustomizer;
