import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { shouldShowAllFeatures, simulateNetworkDelay } from "@/lib/devMode";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Users,
  Wallet,
  X,
  Database,
  Table as TableIcon,
  Link2,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { supabase } from "../../../supabase/supabase";
import { Guest, Table, GuestRelationship } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

// Define types for better type safety
type GeneratorTab = "guests" | "tables" | "relationships" | "settings";

type GeneratorState = {
  loading: boolean;
  success: boolean;
  error: string | null;
};

type CountInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  helpText?: string;
};

type ActionButtonProps = {
  onClick: () => Promise<void>;
  label: string;
  isLoading: boolean;
  icon?: React.ReactNode;
};

type StatusMessageProps = {
  success: boolean;
  error: string | null;
};

/**
 * Component for generating test data in development mode
 * Allows creating random guests, tables, and relationships
 */
export function DevModeDataGenerator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GeneratorTab>("guests");
  const [state, setState] = useState<GeneratorState>({
    loading: false,
    success: false,
    error: null,
  });

  // Configuration state for data generation
  const [guestCount, setGuestCount] = useState(10);
  const [tableCount, setTableCount] = useState(3);
  const [relationshipCount, setRelationshipCount] = useState(5);

  // Advanced settings
  const [batchSize, setBatchSize] = useState(25);
  const [clearExistingData, setClearExistingData] = useState(false);

  // Only show if all features are enabled
  if (!shouldShowAllFeatures()) {
    return null;
  }

  // Reset state when changing tabs or after operations
  const resetState = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null,
    });
  }, []);

  // Handle errors consistently
  const handleError = useCallback(
    (error: any) => {
      console.error("Error generating test data:", error);
      setState({
        loading: false,
        success: false,
        error: error.message || t("An unexpected error occurred"),
      });

      toast({
        title: t("Error"),
        description: error.message || t("An unexpected error occurred"),
        variant: "destructive",
      });
    },
    [t, toast],
  );

  // Get current user ID - extracted for reuse
  const getUserId = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      throw new Error(t("User not authenticated"));
    }

    return userId;
  }, [t]);

  // Clear existing data if requested
  const clearDataIfRequested = useCallback(
    async (table: string, userId: string) => {
      if (!clearExistingData) return;

      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
      } catch (err) {
        console.warn(`Failed to clear ${table}:`, err);
        // Continue with generation even if clearing fails
      }
    },
    [clearExistingData],
  );

  // Data for random generation - moved outside to avoid recreation on each render
  const mockData = useMemo(
    () => ({
      firstNames: [
        "Emma",
        "Noah",
        "Olivia",
        "Liam",
        "Ava",
        "William",
        "Sophia",
        "Mason",
        "Isabella",
        "James",
        "Mia",
        "Benjamin",
        "Charlotte",
        "Jacob",
        "Amelia",
        "Michael",
        "Harper",
        "Ethan",
        "Evelyn",
        "Alexander",
        "Abigail",
        "Daniel",
        "Emily",
        "Matthew",
        "Elizabeth",
        "Henry",
        "Sofia",
        "Joseph",
        "Madison",
        "David",
      ],
      lastNames: [
        "Smith",
        "Johnson",
        "Williams",
        "Jones",
        "Brown",
        "Davis",
        "Miller",
        "Wilson",
        "Moore",
        "Taylor",
        "Anderson",
        "Thomas",
        "Jackson",
        "White",
        "Harris",
        "Martin",
        "Thompson",
        "Garcia",
        "Martinez",
        "Robinson",
        "Clark",
        "Rodriguez",
        "Lewis",
        "Lee",
        "Walker",
        "Hall",
        "Allen",
        "Young",
        "Hernandez",
        "King",
      ],
      rsvpStatuses: ["confirmed", "pending", "declined"],
      dietaryOptions: [
        null,
        "Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Nut Allergy",
        "Lactose Intolerant",
        "Shellfish Allergy",
        "Kosher",
        "Halal",
      ],
      tableNames: [
        "Table",
        "Round Table",
        "Rectangle Table",
        "Oval Table",
        "Family",
        "Friends",
        "Colleagues",
        "VIP",
        "Bridal Party",
      ],
      tableShapes: ["round", "rectangle", "oval"],
      tableSizes: [4, 6, 8, 10, 12],
    }),
    [],
  );

  // Generate random guests with improved data generation
  const generateRandomGuests = useCallback(async () => {
    setState({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await simulateNetworkDelay();
      const userId = await getUserId();

      // Clear existing guests if requested
      await clearDataIfRequested("guests", userId);

      // Create guests in batches for better performance
      const totalBatches = Math.ceil(guestCount / batchSize);
      let generatedCount = 0;

      for (let batch = 0; batch < totalBatches; batch++) {
        const currentBatchSize = Math.min(
          batchSize,
          guestCount - batch * batchSize,
        );

        const guests: Partial<Guest>[] = Array.from(
          { length: currentBatchSize },
          () => {
            const firstName =
              mockData.firstNames[
                Math.floor(Math.random() * mockData.firstNames.length)
              ];
            const lastName =
              mockData.lastNames[
                Math.floor(Math.random() * mockData.lastNames.length)
              ];
            const rsvpStatus =
              mockData.rsvpStatuses[
                Math.floor(Math.random() * mockData.rsvpStatuses.length)
              ];
            const dietaryRestriction =
              mockData.dietaryOptions[
                Math.floor(Math.random() * mockData.dietaryOptions.length)
              ];

            return {
              name: `${firstName} ${lastName}`,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
              phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              rsvp_status: rsvpStatus as "confirmed" | "pending" | "declined",
              dietary_restrictions: dietaryRestriction,
              user_id: userId,
            };
          },
        );

        // Insert batch of guests
        const { error, count } = await supabase.from("guests").insert(guests);
        if (error) throw error;

        generatedCount += currentBatchSize;

        // Update state to show progress for large batches
        if (totalBatches > 1) {
          setState((prev) => ({
            ...prev,
            error: `Generated ${generatedCount}/${guestCount} guests...`,
          }));
        }
      }

      setState({ loading: false, success: true, error: null });

      toast({
        title: t("Success"),
        description: t("Generated {count} guests successfully", {
          count: guestCount,
        }),
      });
    } catch (err) {
      handleError(err);
    }
  }, [
    guestCount,
    batchSize,
    getUserId,
    handleError,
    mockData,
    clearDataIfRequested,
    t,
    toast,
  ]);

  // Generate random tables with improved data generation
  const generateRandomTables = useCallback(async () => {
    setState({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await simulateNetworkDelay();
      const userId = await getUserId();

      // Clear existing tables if requested
      await clearDataIfRequested("tables", userId);

      // Generate tables with more realistic properties
      const tables: Partial<Table>[] = Array.from(
        { length: tableCount },
        (_, i) => {
          const shape = mockData.tableShapes[
            Math.floor(Math.random() * mockData.tableShapes.length)
          ] as "round" | "rectangle" | "oval";
          const capacity =
            mockData.tableSizes[
              Math.floor(Math.random() * mockData.tableSizes.length)
            ];

          // Create a grid-like layout for tables
          const gridSize = Math.ceil(Math.sqrt(tableCount));
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const spacing = 150;

          return {
            name: `${mockData.tableNames[Math.floor(Math.random() * mockData.tableNames.length)]} ${i + 1}`,
            shape,
            capacity,
            position_x: col * spacing,
            position_y: row * spacing,
            user_id: userId,
          };
        },
      );

      // Insert tables
      const { error } = await supabase.from("tables").insert(tables);
      if (error) throw error;

      setState({ loading: false, success: true, error: null });

      toast({
        title: t("Success"),
        description: t("Generated {count} tables successfully", {
          count: tableCount,
        }),
      });
    } catch (err) {
      handleError(err);
    }
  }, [
    tableCount,
    getUserId,
    handleError,
    mockData,
    clearDataIfRequested,
    t,
    toast,
  ]);

  // Generate random relationships with improved algorithm
  const generateRandomRelationships = useCallback(async () => {
    setState({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await simulateNetworkDelay();
      const userId = await getUserId();

      // Clear existing relationships if requested
      await clearDataIfRequested("guest_relationships", userId);

      // Get existing guests
      const { data: guests, error: guestsError } = await supabase
        .from("guests")
        .select("id")
        .eq("user_id", userId);

      if (guestsError) throw guestsError;

      if (!guests || guests.length < 2) {
        throw new Error(
          t(
            "Not enough guests to create relationships. Please add at least 2 guests first.",
          ),
        );
      }

      // Generate random relationships with improved distribution
      const relationshipTypes = ["preference", "conflict"];
      const relationships: Partial<GuestRelationship>[] = [];
      const existingPairs = new Set<string>(); // Track existing pairs to avoid duplicates

      // Try to create the requested number of relationships, but avoid infinite loops
      let attempts = 0;
      const maxAttempts = relationshipCount * 3;
      const maxPossibleRelationships =
        (guests.length * (guests.length - 1)) / 2;
      const targetCount = Math.min(relationshipCount, maxPossibleRelationships);

      while (relationships.length < targetCount && attempts < maxAttempts) {
        attempts++;

        // Get two random guests
        const guestIndex1 = Math.floor(Math.random() * guests.length);
        let guestIndex2 = Math.floor(Math.random() * guests.length);

        // Make sure we don't get the same guest twice
        while (guestIndex2 === guestIndex1) {
          guestIndex2 = Math.floor(Math.random() * guests.length);
        }

        const guestId = guests[guestIndex1].id;
        const relatedGuestId = guests[guestIndex2].id;

        // Create a unique key for this pair (order-independent)
        const pairKey = [guestId, relatedGuestId].sort().join("-");

        // Skip if this pair already exists
        if (existingPairs.has(pairKey)) {
          continue;
        }

        existingPairs.add(pairKey);

        const relationshipType = relationshipTypes[
          Math.floor(Math.random() * relationshipTypes.length)
        ] as "preference" | "conflict";

        relationships.push({
          guest_id: guestId,
          related_guest_id: relatedGuestId,
          relationship_type: relationshipType,
          user_id: userId,
        });
      }

      // Insert relationships in batches if there are many
      if (relationships.length > 0) {
        if (relationships.length > 50) {
          // Insert in batches of 50 for better performance
          for (let i = 0; i < relationships.length; i += 50) {
            const batch = relationships.slice(i, i + 50);
            const { error } = await supabase
              .from("guest_relationships")
              .insert(batch);
            if (error) throw error;
          }
        } else {
          const { error } = await supabase
            .from("guest_relationships")
            .insert(relationships);
          if (error) throw error;
        }
      } else {
        throw new Error(
          t(
            "Could not create any unique relationships. Try adding more guests first.",
          ),
        );
      }

      setState({
        loading: false,
        success: true,
        error:
          relationships.length < relationshipCount
            ? t(
                `Created ${relationships.length} relationships (requested ${relationshipCount}). Add more guests for more relationships.`,
              )
            : null,
      });

      toast({
        title: t("Success"),
        description: t("Generated {count} relationships successfully", {
          count: relationships.length,
        }),
        variant:
          relationships.length < relationshipCount ? "default" : "default",
      });
    } catch (err) {
      handleError(err);
    }
  }, [
    relationshipCount,
    getUserId,
    handleError,
    t,
    clearDataIfRequested,
    toast,
  ]);

  // Reusable UI component for count inputs
  const CountInput = ({
    value,
    onChange,
    min = 1,
    max = 50,
    label,
    helpText,
  }: CountInputProps) => (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          className="w-20 h-8 text-sm"
        />
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );

  // Reusable UI component for action buttons
  const ActionButton = ({
    onClick,
    label,
    isLoading,
    icon,
  }: ActionButtonProps) => (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full mt-4"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("common.loading")}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </>
      )}
    </Button>
  );

  // Reusable UI component for status messages
  const StatusMessage = ({ success, error }: StatusMessageProps) => {
    if (error) {
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm flex items-start">
          <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      );
    }

    if (success) {
      return (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm flex items-start">
          <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{t("Data generated successfully!")}</span>
        </div>
      );
    }

    return null;
  };

  // Generate all types of data at once
  const generateAllData = useCallback(async () => {
    setState({
      loading: true,
      success: false,
      error: null,
    });

    try {
      // First generate guests
      await generateRandomGuests();

      // Then generate tables
      await generateRandomTables();

      // Finally generate relationships
      await generateRandomRelationships();

      setState({ loading: false, success: true, error: null });

      toast({
        title: t("Success"),
        description: t("Generated all test data successfully"),
      });
    } catch (err) {
      handleError(err);
    }
  }, [
    generateRandomGuests,
    generateRandomTables,
    generateRandomRelationships,
    handleError,
    t,
    toast,
  ]);

  return (
    <Card className="border-2 border-blue-300 shadow-md">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
          {t("Test Data Generator")}
        </CardTitle>
        <CardDescription>
          {t("Generate random test data for development")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as GeneratorTab);
            resetState();
          }}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="guests">
              <Users className="h-4 w-4 mr-2" />
              {t("Guests")}
            </TabsTrigger>
            <TabsTrigger value="tables">
              <TableIcon className="h-4 w-4 mr-2" />
              {t("Tables")}
            </TabsTrigger>
            <TabsTrigger value="relationships">
              <Link2 className="h-4 w-4 mr-2" />
              {t("Relationships")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("Settings")}
            </TabsTrigger>
          </TabsList>

          <div className="p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t("Development Mode Only")}</p>
                <p className="mt-1 text-xs">
                  {t(
                    "This tool is for generating test data and should only be used in development environments.",
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <TabsContent value="guests" className="mt-0 space-y-4">
              <CountInput
                value={guestCount}
                onChange={setGuestCount}
                min={1}
                max={100}
                label={t("Number of guests to generate:")}
                helpText={t(
                  "Creates random guest profiles with names, emails, and RSVP status",
                )}
              />
              <ActionButton
                onClick={generateRandomGuests}
                label={t("Generate Random Guests")}
                isLoading={state.loading}
                icon={<Database className="h-4 w-4" />}
              />
            </TabsContent>

            <TabsContent value="tables" className="mt-0 space-y-4">
              <CountInput
                value={tableCount}
                onChange={setTableCount}
                min={1}
                max={20}
                label={t("Number of tables to generate:")}
                helpText={t(
                  "Creates tables with different shapes and capacities",
                )}
              />
              <ActionButton
                onClick={generateRandomTables}
                label={t("Generate Random Tables")}
                isLoading={state.loading}
                icon={<TableIcon className="h-4 w-4" />}
              />
            </TabsContent>

            <TabsContent value="relationships" className="mt-0 space-y-4">
              <CountInput
                value={relationshipCount}
                onChange={setRelationshipCount}
                min={1}
                max={50}
                label={t("Number of relationships to generate:")}
                helpText={t("Creates preferences and conflicts between guests")}
              />
              <p className="text-xs text-gray-500">
                {t(
                  "Note: You need at least 2 guests in the database to create relationships.",
                )}
              </p>
              <ActionButton
                onClick={generateRandomRelationships}
                label={t("Generate Random Relationships")}
                isLoading={state.loading}
                icon={<Link2 className="h-4 w-4" />}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">
                      {t("Clear existing data")}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {t("Delete existing data before generating new data")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="clear-data" className="text-sm">
                      {clearExistingData ? t("Yes") : t("No")}
                    </Label>
                    <input
                      type="checkbox"
                      id="clear-data"
                      checked={clearExistingData}
                      onChange={(e) => setClearExistingData(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <CountInput
                  value={batchSize}
                  onChange={setBatchSize}
                  min={5}
                  max={100}
                  label={t("Batch size:")}
                  helpText={t(
                    "Number of records to insert at once (for performance)",
                  )}
                />

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">
                    {t("Generate All Data")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {t("Generate guests, tables, and relationships in one go")}
                  </p>
                  <ActionButton
                    onClick={generateAllData}
                    label={t("Generate All Test Data")}
                    isLoading={state.loading}
                    icon={<RefreshCw className="h-4 w-4" />}
                  />
                </div>
              </div>
            </TabsContent>

            <StatusMessage success={state.success} error={state.error} />
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">
          {t(
            'This tool is only visible in developer mode with "Show All Features" enabled.',
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
