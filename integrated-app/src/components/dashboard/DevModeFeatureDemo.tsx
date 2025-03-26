import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { shouldShowAllFeatures } from "@/lib/devMode";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface DevModeFeatureDemoProps {
  featureKey: string;
  title: string;
  description: string;
  isExperimental?: boolean;
  children: React.ReactNode;
}

export function DevModeFeatureDemo({
  featureKey,
  title,
  description,
  isExperimental = false,
  children,
}: DevModeFeatureDemoProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // If it's experimental and we're not showing all features, don't render
  if (isExperimental && !shouldShowAllFeatures()) {
    return null;
  }

  return (
    <Card
      className={`border ${isExperimental ? "border-blue-300" : "border-gray-200"} mb-6`}
    >
      <CardHeader className={isExperimental ? "bg-blue-50" : ""}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {title}
              {isExperimental && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("Experimental")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? t("Hide") : t("Show")}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <>
          <CardContent>{children}</CardContent>
          {isExperimental && (
            <CardFooter className="bg-blue-50 border-t border-blue-200 text-xs text-blue-700 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t("This is an experimental feature enabled in developer mode")}
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}

// Demo component that showcases all available features
export function AllFeaturesDemo() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Only show if we should show all features
  if (!shouldShowAllFeatures()) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-300 mb-6">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          {t("Feature Showcase")}
        </CardTitle>
        <CardDescription>
          {t("Preview of all available features in the wedding planner")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="overview">
              <Clock className="h-4 w-4 mr-1" />
              {t("Overview")}
            </TabsTrigger>
            <TabsTrigger value="guests">
              <Users className="h-4 w-4 mr-1" />
              {t("Guests")}
            </TabsTrigger>
            <TabsTrigger value="tables">
              <Users className="h-4 w-4 mr-1" />
              {t("Tables")}
            </TabsTrigger>
            <TabsTrigger value="budget">
              <Wallet className="h-4 w-4 mr-1" />
              {t("Budget")}
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">
                        {t("Wedding Countdown")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-600">
                          42
                        </div>
                        <div className="text-sm text-gray-500">
                          {t("days remaining")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">
                        {t("RSVP Status")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium text-green-600">24</div>
                          <div className="text-xs">{t("Confirmed")}</div>
                        </div>
                        <div>
                          <div className="font-medium text-amber-600">12</div>
                          <div className="text-xs">{t("Pending")}</div>
                        </div>
                        <div>
                          <div className="font-medium text-red-600">4</div>
                          <div className="text-xs">{t("Declined")}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {t("Upcoming Tasks")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>{t("Book venue")}</span>
                      </div>
                      <Badge variant="outline">{t("Completed")}</Badge>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-amber-500 mr-2" />
                        <span>{t("Send invitations")}</span>
                      </div>
                      <Badge variant="outline" className="bg-amber-50">
                        {t("Due soon")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guests" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{t("Guest List")}</h3>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {t("Add Guest")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-2 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">John Smith</div>
                      <div className="text-xs text-gray-500">
                        john@example.com
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {t("Confirmed")}
                    </Badge>
                  </div>
                  <div className="bg-white p-2 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">Jane Doe</div>
                      <div className="text-xs text-gray-500">
                        jane@example.com
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">
                      {t("Pending")}
                    </Badge>
                  </div>
                </div>

                <Button size="sm" className="w-full text-xs">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  {t("View All Guests")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tables" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{t("Table Planner")}</h3>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {t("Add Table")}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded-full border border-blue-200 flex flex-col items-center justify-center aspect-square">
                    <div className="font-medium text-blue-800">Table 1</div>
                    <div className="text-xs text-gray-500">8 seats</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 flex flex-col items-center justify-center aspect-square">
                    <div className="font-medium text-blue-800">Table 2</div>
                    <div className="text-xs text-gray-500">6 seats</div>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("AI Seating Assistant")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{t("Budget Tracker")}</h3>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {t("Add Expense")}
                  </Button>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">{t("Total Budget")}</span>
                    <span className="text-xs font-medium">$15,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {t("Spent")}: $6,750
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("Remaining")}: $8,250
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-2 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t("Venue")}</div>
                      <div className="text-xs text-gray-500">$5,000</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">33%</Badge>
                  </div>
                  <div className="bg-white p-2 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t("Catering")}</div>
                      <div className="text-xs text-gray-500">$1,750</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">12%</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-blue-50 border-t border-blue-200 text-xs text-blue-700 flex items-center justify-between p-3">
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t("Developer Mode Feature Showcase")}
        </div>
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 text-[10px]"
        >
          {t("All Features Enabled")}
        </Badge>
      </CardFooter>
    </Card>
  );
}
