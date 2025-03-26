import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  X,
  UserPlus,
  Users,
  AlertTriangle,
  Network,
  Loader2,
} from "lucide-react";
import {
  guestsApi,
  guestRelationshipsApi,
  Guest,
  GuestRelationship,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/useTranslation";

// Types
type RelationshipType = "preference" | "conflict";
interface NewRelationship {
  guestId: string;
  relatedGuestId: string;
  relationshipType: RelationshipType;
}

// Constants
const ANIMATION_DURATION = 300; // ms

/**
 * RelationshipGraph Component - Visualizes guest relationships in a graph
 */
const RelationshipGraph = memo(
  ({
    guests,
    relationships,
    getGuestName,
  }: {
    guests: Guest[];
    relationships: GuestRelationship[];
    getGuestName: (id: string) => string;
  }) => {
    const [hoveredGuest, setHoveredGuest] = useState<string | null>(null);
    const { t } = useTranslation();

    // Calculate positions in a circle - memoized for performance
    const { positions, svgSize } = useMemo(() => {
      const radius = Math.min(300, 100 + guests.length * 15);
      const center = { x: radius + 50, y: radius + 50 };
      const positions: Record<string, { x: number; y: number }> = {};

      guests.forEach((guest, index) => {
        const angle = (index / guests.length) * 2 * Math.PI;
        positions[guest.id] = {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        };
      });

      return { positions, center, radius, svgSize: (radius + 100) * 2 };
    }, [guests]);

    // Group relationships by type - memoized for performance
    const { preferenceRelationships, conflictRelationships } = useMemo(() => {
      return {
        preferenceRelationships: relationships.filter(
          (r) => r.relationshipType === "preference",
        ),
        conflictRelationships: relationships.filter(
          (r) => r.relationshipType === "conflict",
        ),
      };
    }, [relationships]);

    // Handle mouse events
    const handleMouseEnter = useCallback((guestId: string) => {
      setHoveredGuest(guestId);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setHoveredGuest(null);
    }, []);

    // Render relationship lines
    const renderRelationshipLines = useCallback(() => {
      return (
        <>
          {preferenceRelationships.map((rel) => {
            const startPos = positions[rel.guestId];
            const endPos = positions[rel.relatedGuestId];
            if (!startPos || !endPos) return null;

            const isHighlighted =
              hoveredGuest === rel.guestId ||
              hoveredGuest === rel.relatedGuestId;

            return (
              <line
                key={`pref-${rel.id}`}
                x1={startPos.x}
                y1={startPos.y}
                x2={endPos.x}
                y2={endPos.y}
                stroke={isHighlighted ? "#e11d48" : "#fda4af"}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeOpacity={isHighlighted ? 1 : 0.7}
                aria-label={`Preference between ${getGuestName(rel.guestId)} and ${getGuestName(rel.relatedGuestId)}`}
              />
            );
          })}

          {conflictRelationships.map((rel) => {
            const startPos = positions[rel.guestId];
            const endPos = positions[rel.relatedGuestId];
            if (!startPos || !endPos) return null;

            const isHighlighted =
              hoveredGuest === rel.guestId ||
              hoveredGuest === rel.relatedGuestId;

            return (
              <line
                key={`conf-${rel.id}`}
                x1={startPos.x}
                y1={startPos.y}
                x2={endPos.x}
                y2={endPos.y}
                stroke={isHighlighted ? "#b45309" : "#fbbf24"}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeOpacity={isHighlighted ? 1 : 0.7}
                strokeDasharray="5,5"
                aria-label={`Conflict between ${getGuestName(rel.guestId)} and ${getGuestName(rel.relatedGuestId)}`}
              />
            );
          })}
        </>
      );
    }, [
      preferenceRelationships,
      conflictRelationships,
      positions,
      hoveredGuest,
      getGuestName,
    ]);

    // Render guest nodes
    const renderGuestNodes = useCallback(() => {
      return guests.map((guest) => {
        const pos = positions[guest.id];
        if (!pos) return null;

        const isHighlighted = hoveredGuest === guest.id;
        const isConnected =
          hoveredGuest !== null &&
          relationships.some(
            (r) =>
              (r.guestId === hoveredGuest && r.relatedGuestId === guest.id) ||
              (r.relatedGuestId === hoveredGuest && r.guestId === guest.id),
          );

        return (
          <g
            key={guest.id}
            onMouseEnter={() => handleMouseEnter(guest.id)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={`Guest: ${getGuestName(guest.id)}`}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isHighlighted ? 25 : isConnected ? 22 : 20}
              fill={
                isHighlighted ? "#f43f5e" : isConnected ? "#fb7185" : "#ffffff"
              }
              stroke={isHighlighted ? "#be123c" : "#e11d48"}
              strokeWidth={2}
              className="transition-all duration-200"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={isHighlighted || isConnected ? "bold" : "normal"}
              fill={isHighlighted || isConnected ? "#ffffff" : "#000000"}
              className="pointer-events-none"
            >
              {getGuestName(guest.id).split(" ")[0]}
            </text>
            <text
              x={pos.x}
              y={pos.y + 45}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#6b7280"
              className={`pointer-events-none transition-opacity duration-200 ${isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              {getGuestName(guest.id)}
            </text>
          </g>
        );
      });
    }, [
      guests,
      positions,
      hoveredGuest,
      relationships,
      handleMouseEnter,
      handleMouseLeave,
      getGuestName,
    ]);

    return (
      <div className="w-full overflow-auto">
        <div
          className="min-h-[500px] flex justify-center"
          aria-label="Guest relationship graph"
        >
          <svg
            width={svgSize}
            height={svgSize}
            className="overflow-visible"
            role="img"
            aria-label="Guest relationship visualization"
          >
            {/* Draw relationship lines first so they appear behind the nodes */}
            {renderRelationshipLines()}

            {/* Draw guest nodes */}
            {renderGuestNodes()}
          </svg>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-rose-400"></div>
            <span className="text-sm text-gray-600">
              {t("relationships.preferTogether") || "Prefer together"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-400 border-dashed border-t border-amber-400"></div>
            <span className="text-sm text-gray-600">
              {t("relationships.conflict") || "Conflict"}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          {t("relationships.hoverInstructions") ||
            "Hover over a guest to highlight their relationships"}
        </p>
      </div>
    );
  },
);
RelationshipGraph.displayName = "RelationshipGraph";

/**
 * RelationshipTableRow Component - Renders a single relationship row
 */
const RelationshipTableRow = memo(
  ({
    relationship,
    getGuestName,
    getRelationshipIcon,
    getRelationshipLabel,
    onDelete,
  }: {
    relationship: GuestRelationship;
    getGuestName: (id: string) => string;
    getRelationshipIcon: (type: string) => JSX.Element;
    getRelationshipLabel: (type: string) => JSX.Element;
    onDelete: (id: string) => void;
  }) => {
    const { t } = useTranslation();

    return (
      <TableRow>
        <TableCell className="font-medium">
          {getGuestName(relationship.guestId)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getRelationshipIcon(relationship.relationshipType)}
            {getRelationshipLabel(relationship.relationshipType)}
          </div>
        </TableCell>
        <TableCell>{getGuestName(relationship.relatedGuestId)}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(relationship.id)}
            className="text-gray-500 hover:text-red-600 transition-colors"
            aria-label={t("relationships.delete") || "Delete relationship"}
          >
            <X className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  },
);
RelationshipTableRow.displayName = "RelationshipTableRow";

/**
 * EmptyState Component - Displays when no relationships are defined
 */
const EmptyState = memo(({ onAddFirst }: { onAddFirst: () => void }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gray-50 border border-dashed border-gray-300">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-700 mb-2">
          {t("relationships.noRelationships") || "No relationships defined yet"}
        </h4>
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          {t("relationships.helpText") ||
            "Define relationships between guests to help the AI seating assistant create better seating arrangements."}
        </p>
        <Button
          onClick={onAddFirst}
          className="bg-rose-600 hover:bg-rose-700 text-white transition-colors"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("relationships.addFirst") || "Add First Relationship"}
        </Button>
      </CardContent>
    </Card>
  );
});
EmptyState.displayName = "EmptyState";

/**
 * GuestRelationshipManager component allows users to manage relationships
 * between guests for optimal seating arrangements.
 */
export default function GuestRelationshipManager() {
  const { t } = useTranslation();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [relationships, setRelationships] = useState<GuestRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRelationship, setNewRelationship] = useState<NewRelationship>({
    guestId: "",
    relatedGuestId: "",
    relationshipType: "preference",
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all required data with error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedGuests, fetchedRelationships] = await Promise.all([
        guestsApi.getGuests(),
        guestRelationshipsApi.getGuestRelationships(),
      ]);

      setGuests(fetchedGuests);
      setRelationships(fetchedRelationships);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: t("common.error") || "Error",
        description:
          t("relationships.fetchError") ||
          "Failed to load guest relationships. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Reset new relationship form
  const resetNewRelationshipForm = useCallback(() => {
    setNewRelationship({
      guestId: "",
      relatedGuestId: "",
      relationshipType: "preference",
    });
  }, []);

  // Handle dialog open/close with form reset
  const handleOpenDialog = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setAddDialogOpen(false);
    resetNewRelationshipForm();
  }, [resetNewRelationshipForm]);

  // Validate relationship before adding
  const validateRelationship = useCallback(
    (relationship: NewRelationship): string | null => {
      if (
        !relationship.guestId ||
        !relationship.relatedGuestId ||
        !relationship.relationshipType
      ) {
        return t("relationships.fillAllFields") || "Please fill in all fields";
      }

      if (relationship.guestId === relationship.relatedGuestId) {
        return (
          t("relationships.selfRelationship") ||
          "A guest cannot have a relationship with themselves"
        );
      }

      // Check if relationship already exists
      const existingRelationship = relationships.find(
        (r) =>
          (r.guestId === relationship.guestId &&
            r.relatedGuestId === relationship.relatedGuestId) ||
          (r.guestId === relationship.relatedGuestId &&
            r.relatedGuestId === relationship.guestId),
      );

      if (existingRelationship) {
        return (
          t("relationships.alreadyExists") || "This relationship already exists"
        );
      }

      return null;
    },
    [relationships, t],
  );

  // Add new relationship with validation
  const handleAddRelationship = useCallback(async () => {
    const validationError = validateRelationship(newRelationship);
    if (validationError) {
      toast({
        title: t("common.error") || "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await guestRelationshipsApi.createGuestRelationship({
        guestId: newRelationship.guestId,
        relatedGuestId: newRelationship.relatedGuestId,
        relationshipType: newRelationship.relationshipType,
      });

      if (result) {
        setRelationships((prev) => [...prev, result]);
        toast({
          title: t("common.success") || "Success",
          description:
            t("relationships.addSuccess") || "Relationship added successfully",
        });
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error adding relationship:", error);
      toast({
        title: t("common.error") || "Error",
        description:
          t("relationships.addError") ||
          "Failed to add relationship. Please try again.",
        variant: "destructive",
      });
    }
  }, [newRelationship, validateRelationship, handleCloseDialog, t]);

  // Delete relationship with optimistic update
  const handleDeleteRelationship = useCallback(
    async (relationshipId: string) => {
      try {
        // Optimistic update
        const relationshipToDelete = relationships.find(
          (r) => r.id === relationshipId,
        );
        setRelationships(relationships.filter((r) => r.id !== relationshipId));

        const success =
          await guestRelationshipsApi.deleteGuestRelationship(relationshipId);

        if (success) {
          toast({
            title: t("common.success") || "Success",
            description:
              t("relationships.deleteSuccess") ||
              "Relationship deleted successfully",
          });
        } else {
          // Revert optimistic update if API call fails
          if (relationshipToDelete) {
            setRelationships((prev) => [...prev, relationshipToDelete]);
          }
          throw new Error("API returned false");
        }
      } catch (error) {
        console.error("Error deleting relationship:", error);
        toast({
          title: t("common.error") || "Error",
          description:
            t("relationships.deleteError") ||
            "Failed to delete relationship. Please try again.",
          variant: "destructive",
        });
      }
    },
    [relationships, t],
  );

  // Update new relationship form fields
  const handleRelationshipChange = useCallback(
    <K extends keyof NewRelationship>(key: K, value: NewRelationship[K]) => {
      setNewRelationship((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Helper functions for displaying relationship data
  const getGuestName = useCallback(
    (guestId: string): string => {
      const guest = guests.find((g) => g.id === guestId);
      return guest
        ? guest.name
        : t("relationships.unknownGuest") || "Unknown Guest";
    },
    [guests, t],
  );

  const getRelationshipIcon = useCallback((type: string): JSX.Element => {
    return type === "preference" ? (
      <Heart className="h-4 w-4 text-rose-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-500" />
    );
  }, []);

  const getRelationshipLabel = useCallback(
    (type: string): JSX.Element => {
      return type === "preference" ? (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200"
        >
          {t("relationships.preferTogether") || "Prefer to sit together"}
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          {t("relationships.conflict") || "Should not sit together"}
        </Badge>
      );
    },
    [t],
  );

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
          <span className="ml-3 text-gray-600">
            {t("common.loading") || "Loading..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-medium">
              {t("relationships.title") || "Guest Relationships"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t("relationships.description") ||
                "Define seating preferences and conflicts between guests"}
            </p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("relationships.add") || "Add Relationship"}
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {relationships.length === 0 ? (
          <EmptyState onAddFirst={handleOpenDialog} />
        ) : (
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Users className="h-4 w-4" />{" "}
                {t("relationships.tableView") || "Table View"}
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex items-center gap-2">
                <Network className="h-4 w-4" />{" "}
                {t("relationships.graphView") || "Relationship Graph"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-0">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("relationships.guest") || "Guest"}
                      </TableHead>
                      <TableHead>
                        {t("relationships.relationship") || "Relationship"}
                      </TableHead>
                      <TableHead>
                        {t("relationships.relatedGuest") || "Related Guest"}
                      </TableHead>
                      <TableHead className="w-[80px]">
                        {t("common.actions") || "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationships.map((relationship) => (
                      <RelationshipTableRow
                        key={relationship.id}
                        relationship={relationship}
                        getGuestName={getGuestName}
                        getRelationshipIcon={getRelationshipIcon}
                        getRelationshipLabel={getRelationshipLabel}
                        onDelete={handleDeleteRelationship}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="graph" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <RelationshipGraph
                    guests={guests}
                    relationships={relationships}
                    getGuestName={getGuestName}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Heart className="h-4 w-4 mr-2" />{" "}
            {t("relationships.seatingPreferences") || "Seating Preferences"}
          </h4>
          <p className="text-xs text-blue-700">
            {t("relationships.aiAssistantHelp") ||
              "These relationships will be used by the AI seating assistant to create optimal seating arrangements. Guests with preferences will be seated together when possible, while those with conflicts will be seated at different tables."}
          </p>
        </div>
      </div>

      {/* Add Relationship Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("relationships.addDialogTitle") || "Add Guest Relationship"}
            </DialogTitle>
            <DialogDescription>
              {t("relationships.addDialogDescription") ||
                "Define seating preferences or conflicts between guests"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="guest1">
                {t("relationships.firstGuest") || "First Guest"}
              </Label>
              <Select
                value={newRelationship.guestId}
                onValueChange={(value) =>
                  handleRelationshipChange("guestId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t("relationships.selectGuest") || "Select a guest"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relationshipType">
                {t("relationships.relationshipType") || "Relationship Type"}
              </Label>
              <Select
                value={newRelationship.relationshipType}
                onValueChange={(value) =>
                  handleRelationshipChange(
                    "relationshipType",
                    value as RelationshipType,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t("relationships.selectType") ||
                      "Select relationship type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preference">
                    {t("relationships.preferTogether") ||
                      "Prefer to sit together"}
                  </SelectItem>
                  <SelectItem value="conflict">
                    {t("relationships.conflict") || "Should not sit together"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guest2">
                {t("relationships.secondGuest") || "Second Guest"}
              </Label>
              <Select
                value={newRelationship.relatedGuestId}
                onValueChange={(value) =>
                  handleRelationshipChange("relatedGuestId", value)
                }
                disabled={!newRelationship.guestId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t("relationships.selectGuest") || "Select a guest"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {guests
                    .filter((g) => g.id !== newRelationship.guestId)
                    .map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleAddRelationship}
              disabled={
                !newRelationship.guestId ||
                !newRelationship.relatedGuestId ||
                !newRelationship.relationshipType
              }
              className="bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              {t("relationships.add") || "Add Relationship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
