import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guestRelationshipsApi, Guest, GuestRelationship } from "@/lib/api";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Users, Heart, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface GuestRelationshipVisualizerProps {
  guests?: Guest[];
  onRefresh?: () => void;
}

type RelationshipMap = Record<
  string,
  {
    preferences: string[];
    conflicts: string[];
  }
>;

type RelationshipGroup = string[];
type RelationshipType = "preferences" | "conflicts";

/**
 * RelationshipItem - Extracted component for rendering relationship items
 */
const RelationshipItem = memo(
  ({
    group,
    index,
    type,
    t,
  }: {
    group: string[];
    index: number;
    type: RelationshipType;
    t: (key: string) => string;
  }) => {
    const isPreferences = type === "preferences";
    const bgColor = isPreferences ? "bg-rose-50" : "bg-amber-50";
    const borderColor = isPreferences ? "border-rose-100" : "border-amber-100";
    const iconColor = isPreferences ? "text-rose-500" : "text-amber-500";
    const Icon = isPreferences ? Heart : AlertTriangle;
    const relationshipText = isPreferences
      ? t("dashboard.preferToSitTogether")
      : t("dashboard.shouldNotSitTogether");

    return (
      <div
        key={`${type}-${index}`}
        className={`p-3 ${bgColor} rounded-md border ${borderColor} flex items-center transition-colors duration-200`}
        data-testid={`relationship-item-${type}-${index}`}
      >
        <Icon
          className={`h-4 w-4 ${iconColor} mr-3 flex-shrink-0`}
          aria-hidden="true"
        />
        <div>
          <span className="font-medium">{group[0]}</span>
          <span className="text-gray-500 mx-2">&</span>
          <span className="font-medium">{group[1]}</span>
          <span className="text-sm text-gray-500 ml-2">{relationshipText}</span>
        </div>
      </div>
    );
  },
);
RelationshipItem.displayName = "RelationshipItem";

/**
 * EmptyState - Component for displaying empty state messages
 */
const EmptyState = memo(({ message }: { message: string }) => (
  <div
    className="text-center py-8 text-gray-500"
    role="status"
    aria-live="polite"
  >
    {message}
  </div>
));
EmptyState.displayName = "EmptyState";

/**
 * RefreshButton - Extracted component for the refresh button
 */
const RefreshButton = memo(
  ({
    onClick,
    disabled,
    refreshing,
    tooltipText,
  }: {
    onClick: () => void;
    disabled: boolean;
    refreshing: boolean;
    tooltipText: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
            onClick={onClick}
            disabled={disabled}
            aria-label={tooltipText}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
);
RefreshButton.displayName = "RefreshButton";

/**
 * LoadingIndicator - Extracted component for loading state
 */
const LoadingIndicator = memo(() => (
  <div className="flex justify-center items-center py-8" aria-busy="true">
    <Loader2
      className="h-8 w-8 text-blue-500 animate-spin"
      aria-label="Loading"
    />
  </div>
));
LoadingIndicator.displayName = "LoadingIndicator";

/**
 * GuestRelationshipVisualizer component displays guest relationships
 * in a visual format to help with seating arrangements.
 */
export default function GuestRelationshipVisualizer({
  guests = [],
  onRefresh,
}: GuestRelationshipVisualizerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [relationships, setRelationships] = useState<GuestRelationship[]>([]);
  const [activeTab, setActiveTab] = useState<RelationshipType>("preferences");

  // Fetch relationships when component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await guestRelationshipsApi.getGuestRelationships();
        if (isMounted) {
          setRelationships(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching guest relationships:", error);
        if (isMounted) {
          toast({
            title: t("common.error"),
            description: t("dashboard.errors.failedToLoadRelationships"),
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    };

    fetchData();

    // Clean up any pending operations when component unmounts
    return () => {
      isMounted = false;
    };
  }, [t, toast]);

  // Fetch all guest relationships with error handling
  const fetchRelationships = useCallback(async () => {
    try {
      const data = await guestRelationshipsApi.getGuestRelationships();
      setRelationships(data);
      return true;
    } catch (error) {
      console.error("Error fetching guest relationships:", error);
      toast({
        title: t("common.error"),
        description: t("dashboard.errors.failedToLoadRelationships"),
        variant: "destructive",
      });
      return false;
    }
  }, [t, toast]);

  // Handle manual refresh with debounce protection
  const handleManualRefresh = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);

    // Use a timeout to ensure the spinner is visible for at least 500ms
    const refreshTimeout = setTimeout(async () => {
      const success = await fetchRelationships();

      if (success && onRefresh) {
        onRefresh();
        toast({
          title: t("common.success"),
          description: t("dashboard.relationshipsRefreshed"),
        });
      }

      setRefreshing(false);
    }, 500);

    return () => clearTimeout(refreshTimeout);
  }, [fetchRelationships, onRefresh, refreshing, t, toast]);

  // Process relationships into a more usable format - memoized for performance
  const relationshipMap = useMemo(() => {
    const map: RelationshipMap = {};

    // Initialize map for all guests
    guests.forEach((guest) => {
      map[guest.id] = { preferences: [], conflicts: [] };
    });

    // Populate relationships
    relationships.forEach((rel) => {
      if (rel.relationshipType === "preference" && map[rel.guestId]) {
        map[rel.guestId].preferences.push(rel.relatedGuestId);
      } else if (rel.relationshipType === "conflict" && map[rel.guestId]) {
        map[rel.guestId].conflicts.push(rel.relatedGuestId);
      }
    });

    return map;
  }, [guests, relationships]);

  // Get guest name by ID with memoization for performance
  const getGuestName = useCallback(
    (id: string): string => {
      const guest = guests.find((g) => g.id === id);
      return guest ? guest.name : t("dashboard.unknownGuest");
    },
    [guests, t],
  );

  // Generate relationship groups based on active tab - memoized for performance
  const relationshipGroups = useMemo((): RelationshipGroup[] => {
    const groups: Record<string, string[]> = {};
    const relationshipType = activeTab;

    // Process each guest's relationships
    Object.entries(relationshipMap).forEach(([guestId, relations]) => {
      if (relations[relationshipType].length > 0) {
        const guestName = getGuestName(guestId);

        relations[relationshipType].forEach((relatedId) => {
          const relatedName = getGuestName(relatedId);
          // Create a unique key for this relationship pair
          const pairKey = [guestId, relatedId].sort().join("-");

          if (!groups[pairKey]) {
            groups[pairKey] = [guestName, relatedName];
          }
        });
      }
    });

    return Object.values(groups);
  }, [relationshipMap, activeTab, getGuestName]);

  // Render content based on loading state and data availability
  const renderContent = useCallback(() => {
    if (loading) {
      return <LoadingIndicator />;
    }

    return (
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as RelationshipType)}
        className="w-full"
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="preferences" className="flex-1">
            <Heart className="h-4 w-4 mr-2 text-rose-500" aria-hidden="true" />
            {t("dashboard.preferences")}
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex-1">
            <AlertTriangle
              className="h-4 w-4 mr-2 text-amber-500"
              aria-hidden="true"
            />
            {t("dashboard.conflicts")}
          </TabsTrigger>
        </TabsList>

        {["preferences", "conflicts"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-0">
            {relationshipGroups.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {relationshipGroups.map((group, index) => (
                    <RelationshipItem
                      key={`${tabValue}-${index}`}
                      group={group}
                      index={index}
                      type={tabValue as RelationshipType}
                      t={t}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState
                message={
                  tabValue === "preferences"
                    ? t("dashboard.noPreferencesFound")
                    : t("dashboard.noConflictsFound")
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    );
  }, [loading, activeTab, relationshipGroups, t]);

  return (
    <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2 relative">
        <CardTitle className="flex items-center text-blue-800 text-lg font-medium">
          <Users className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
          {t("dashboard.guestRelationships")}
        </CardTitle>

        {/* Refresh button */}
        <RefreshButton
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          refreshing={refreshing}
          tooltipText={t("dashboard.refreshRelationships")}
        />
      </CardHeader>

      <CardContent className="pt-4">
        {renderContent()}

        {/* Optional refresh button at bottom */}
        {!loading && onRefresh && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {t("dashboard.refreshRelationships")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
