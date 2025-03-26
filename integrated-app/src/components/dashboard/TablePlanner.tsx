import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CircleUser,
  Plus,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertCircle,
  Printer,
  Users,
  LayoutGrid,
  Menu,
  AlertTriangle,
  Heart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  tablesApi,
  guestsApi,
  guestRelationshipsApi,
  Table,
  Guest,
  GuestRelationship,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DroppableTableArea } from "./DroppableTableArea";
import { DroppableGuestArea } from "./DroppableGuestArea";
import { DroppableTable } from "./DroppableTable";
import { DraggableTable } from "./DraggableTable";
import { useReactToPrint } from "react-to-print";
import PrintableTableAssignments from "./PrintableTableAssignments";
import { useTranslation } from "@/lib/useTranslation";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TablePosition {
  x: number;
  y: number;
}

// Custom DnD backend with options for touch devices
const CustomDndBackend = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const backendOptions = {
    enableMouseEvents: true,
    enableTouchEvents: true,
    delayTouchStart: 50,
    touchSlop: 5, // Smaller slop means more precise touch handling
    ignoreContextMenu: true,
    scrollAngleRanges: [
      { start: 30, end: 150 },
      { start: 210, end: 330 },
    ],
  };

  return (
    <DndProvider
      backend={isMobile ? TouchBackend : HTML5Backend}
      options={isMobile ? backendOptions : undefined}
    >
      {children}
    </DndProvider>
  );
};

export default function TablePlanner() {
  const { t } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [tablePositions, setTablePositions] = useState<
    Record<string, TablePosition>
  >({});
  const [guests, setGuests] = useState<Guest[]>([]);
  const [relationships, setRelationships] = useState<GuestRelationship[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiComplete, setAiComplete] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState<Partial<Table>>({
    name: "",
    shape: "round",
    capacity: 8,
    guests: [],
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState("layout");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableDetailOpen, setTableDetailOpen] = useState(false);

  const printableTableAssignmentsRef = useRef<HTMLDivElement>(null);

  const handlePrintTableAssignments = useReactToPrint({
    content: () => printableTableAssignmentsRef.current,
    documentTitle: "Wedding Table Assignments",
  });

  useEffect(() => {
    fetchData();

    // Check if we're on a mobile device
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener("resize", checkMobileView);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Save table positions when they change
  useEffect(() => {
    const saveTablePositions = async () => {
      // Only save if we have tables and positions
      if (tables.length === 0 || Object.keys(tablePositions).length === 0)
        return;

      // Save each table's position
      for (const table of tables) {
        const position = tablePositions[table.id];
        if (position) {
          await tablesApi.updateTable({
            ...table,
            positionX: position.x,
            positionY: position.y,
          });
        }
      }
    };

    // Use a debounce to avoid too many updates
    const debounceTimeout = setTimeout(saveTablePositions, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [tablePositions, tables]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedTables, fetchedGuests, fetchedRelationships] =
        await Promise.all([
          tablesApi.getTables(),
          guestsApi.getGuests(),
          guestRelationshipsApi.getGuestRelationships(),
        ]);

      setTables(fetchedTables);
      setGuests(fetchedGuests);
      setRelationships(fetchedRelationships);
      setUnassignedGuests(
        fetchedGuests.filter((guest) => !guest.tableAssignment),
      );

      // Initialize table positions from database or set default positions
      const newPositions: Record<string, TablePosition> = {};
      fetchedTables.forEach((table, index) => {
        if (table.positionX !== null && table.positionY !== null) {
          // Use positions from database
          newPositions[table.id] = {
            x: table.positionX || 0,
            y: table.positionY || 0,
          };
        } else if (!tablePositions[table.id]) {
          // Calculate a grid-like initial position if not in database
          const col = index % 3;
          const row = Math.floor(index / 3);
          newPositions[table.id] = {
            x: col * 150,
            y: row * 150,
          };
        } else {
          // Use existing position from state
          newPositions[table.id] = tablePositions[table.id];
        }
      });
      setTablePositions(newPositions);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: t("common.error"),
        description: t("common.loading"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTableShape = (shape: string) => {
    switch (shape) {
      case "round":
        return "rounded-full";
      case "rectangle":
        return "rounded-lg";
      case "oval":
        return "rounded-[50%/60%]";
      default:
        return "rounded-full";
    }
  };

  const handleAiAssist = () => {
    setAiDialogOpen(true);
  };

  const runAiAssistant = async () => {
    setAiProcessing(true);
    try {
      // Generate AI suggestions based on real data
      const suggestedTables = await generateAiSuggestions();
      setAiSuggestions(suggestedTables);
      setAiComplete(true);

      toast({
        title: t("common.success"),
        description: t("dashboard.tablePlanner.reviewSuggestions"),
      });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const generateAiSuggestions = async (): Promise<Table[]> => {
    // Create a deep copy of tables to work with
    const newTables = JSON.parse(JSON.stringify(tables)) as Table[];
    const allGuests = [...guests];

    // Reset all tables
    newTables.forEach((table) => {
      table.guests = [];
    });

    // Get preferences and conflicts from relationships
    const guestPreferences: Record<string, string[]> = {};
    const guestConflicts: Record<string, string[]> = {};
    const guestFamilies: Record<string, string> = {};

    // Process relationships to build preference and conflict maps
    relationships.forEach((rel) => {
      if (rel.relationshipType === "preference") {
        if (!guestPreferences[rel.guestId]) {
          guestPreferences[rel.guestId] = [];
        }
        guestPreferences[rel.guestId].push(rel.relatedGuestId);

        // Make preferences bidirectional if not already set
        if (!guestPreferences[rel.relatedGuestId]) {
          guestPreferences[rel.relatedGuestId] = [];
        }
        if (!guestPreferences[rel.relatedGuestId].includes(rel.guestId)) {
          guestPreferences[rel.relatedGuestId].push(rel.guestId);
        }
      } else if (rel.relationshipType === "conflict") {
        if (!guestConflicts[rel.guestId]) {
          guestConflicts[rel.guestId] = [];
        }
        guestConflicts[rel.guestId].push(rel.relatedGuestId);

        // Make conflicts bidirectional if not already set
        if (!guestConflicts[rel.relatedGuestId]) {
          guestConflicts[rel.relatedGuestId] = [];
        }
        if (!guestConflicts[rel.relatedGuestId].includes(rel.guestId)) {
          guestConflicts[rel.relatedGuestId].push(rel.guestId);
        }
      }
    });

    // Group guests into preference clusters
    const preferenceGroups: string[][] = [];
    const processedGuests = new Set<string>();

    // Build preference groups (people who want to sit together)
    for (const guest of allGuests) {
      if (processedGuests.has(guest.id)) continue;

      const group: string[] = [guest.id];
      processedGuests.add(guest.id);

      // BFS to find all connected preferences
      const queue = [...(guestPreferences[guest.id] || [])];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (processedGuests.has(currentId)) continue;

        group.push(currentId);
        processedGuests.add(currentId);

        // Add this guest's preferences to the queue
        const prefs = guestPreferences[currentId] || [];
        for (const pref of prefs) {
          if (!processedGuests.has(pref) && !queue.includes(pref)) {
            queue.push(pref);
          }
        }
      }

      if (group.length > 1) {
        preferenceGroups.push(group);
      }
    }

    // Sort preference groups by size (largest first)
    preferenceGroups.sort((a, b) => b.length - a.length);

    // First pass: place preference groups
    for (const group of preferenceGroups) {
      // Find a table that can fit the entire group
      let targetTable = newTables.find(
        (t) => t.capacity - t.guests.length >= group.length,
      );

      // If no table can fit the entire group, find the largest table
      if (!targetTable) {
        targetTable = [...newTables].sort(
          (a, b) =>
            b.capacity - b.guests.length - (a.capacity - a.guests.length),
        )[0];
      }

      // Check for conflicts with existing guests at this table
      const hasConflicts = group.some((guestId) => {
        const conflicts = guestConflicts[guestId] || [];
        return targetTable!.guests.some((existingId) =>
          conflicts.includes(existingId),
        );
      });

      if (!hasConflicts) {
        // Add as many from the group as possible
        const availableSpace = targetTable.capacity - targetTable.guests.length;
        const guestsToAdd = group.slice(0, availableSpace);
        targetTable.guests.push(...guestsToAdd);

        // Mark these guests as processed
        guestsToAdd.forEach((id) => processedGuests.add(id));
      } else {
        // If conflicts exist, try to place them individually
        for (const guestId of group) {
          if (targetTable.guests.includes(guestId)) continue;

          // Find a table without conflicts
          const suitableTable = newTables.find((table) => {
            if (table.guests.length >= table.capacity) return false;

            const conflicts = guestConflicts[guestId] || [];
            return !table.guests.some((existingId) =>
              conflicts.includes(existingId),
            );
          });

          if (suitableTable) {
            suitableTable.guests.push(guestId);
          } else {
            // If no suitable table, add to the table with most space
            const tableWithMostSpace = [...newTables]
              .filter((t) => t.guests.length < t.capacity)
              .sort(
                (a, b) =>
                  b.capacity - b.guests.length - (a.capacity - a.guests.length),
              )[0];

            if (tableWithMostSpace) {
              tableWithMostSpace.guests.push(guestId);
            }
          }
        }
      }
    }

    // Second pass: place remaining guests
    const remainingGuests = allGuests.filter(
      (g) => !newTables.some((t) => t.guests.includes(g.id)),
    );

    for (const guest of remainingGuests) {
      // Find a table without conflicts and with space
      let targetTable = newTables.find((table) => {
        if (table.guests.length >= table.capacity) return false;

        const conflicts = guestConflicts[guest.id] || [];
        return !table.guests.some((existingId) =>
          conflicts.includes(existingId),
        );
      });

      // If no conflict-free table, find one with preferences
      if (!targetTable) {
        targetTable = newTables.find((table) => {
          if (table.guests.length >= table.capacity) return false;

          const preferences = guestPreferences[guest.id] || [];
          return table.guests.some((existingId) =>
            preferences.includes(existingId),
          );
        });
      }

      // If still no table, use the one with most space
      if (!targetTable) {
        targetTable = [...newTables]
          .filter((t) => t.guests.length < t.capacity)
          .sort(
            (a, b) =>
              b.capacity - b.guests.length - (a.capacity - a.guests.length),
          )[0];
      }

      // If all tables are full, add to the first table
      if (!targetTable && newTables.length > 0) {
        targetTable = newTables[0];
      }

      // Assign guest to table if we found one
      if (targetTable) {
        targetTable.guests.push(guest.id);
      }
    }

    // Balance tables if needed (optional optimization)
    balanceTables(newTables, guestConflicts, guestPreferences);

    return newTables;
  };

  // Helper function to balance tables
  const balanceTables = (
    tables: Table[],
    conflicts: Record<string, string[]>,
    preferences: Record<string, string[]>,
  ) => {
    // Skip balancing if we have fewer than 2 tables
    if (tables.length < 2) return;

    // Calculate average fill percentage
    const totalCapacity = tables.reduce(
      (sum, table) => sum + table.capacity,
      0,
    );
    const totalGuests = tables.reduce(
      (sum, table) => sum + table.guests.length,
      0,
    );
    const avgFillPercentage = totalGuests / totalCapacity;

    // Identify overfilled and underfilled tables
    const overfilledTables = tables.filter(
      (t) => t.guests.length / t.capacity > avgFillPercentage * 1.2,
    );
    const underfilledTables = tables.filter(
      (t) => t.guests.length / t.capacity < avgFillPercentage * 0.8,
    );

    if (overfilledTables.length === 0 || underfilledTables.length === 0) return;

    // Try to move guests from overfilled to underfilled tables
    for (const sourceTable of overfilledTables) {
      for (const targetTable of underfilledTables) {
        if (targetTable.guests.length >= targetTable.capacity) continue;

        // Find guests that can be moved (no conflicts with target table)
        const movableGuests = sourceTable.guests.filter((guestId) => {
          const guestConflicts = conflicts[guestId] || [];
          return !targetTable.guests.some((targetGuestId) =>
            guestConflicts.includes(targetGuestId),
          );
        });

        // Prioritize guests with preferences in the target table
        const prioritizedGuests = movableGuests.sort((a, b) => {
          const aPrefs = preferences[a] || [];
          const bPrefs = preferences[b] || [];
          const aPrefsInTarget = aPrefs.filter((id) =>
            targetTable.guests.includes(id),
          ).length;
          const bPrefsInTarget = bPrefs.filter((id) =>
            targetTable.guests.includes(id),
          ).length;
          return bPrefsInTarget - aPrefsInTarget;
        });

        // Move one guest if possible
        if (prioritizedGuests.length > 0) {
          const guestToMove = prioritizedGuests[0];
          sourceTable.guests = sourceTable.guests.filter(
            (id) => id !== guestToMove,
          );
          targetTable.guests.push(guestToMove);

          // Stop if the target table is now filled
          if (targetTable.guests.length >= targetTable.capacity) break;
        }
      }
    }
  };

  const applyAiSuggestions = async () => {
    try {
      setLoading(true);

      // For each guest in each table, update their table assignment
      for (const table of aiSuggestions) {
        for (const guestId of table.guests) {
          await tablesApi.assignGuestToTable(guestId, table.name);
        }
      }

      // Refresh data after applying changes
      await fetchData();

      toast({
        title: t("common.success"),
        description: t("dashboard.tablePlanner.acceptSuggestions"),
      });
    } catch (error) {
      console.error("Error applying AI suggestions:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setAiDialogOpen(false);
      setAiComplete(false);
      setLoading(false);
    }
  };

  const resetAiDialog = () => {
    setAiDialogOpen(false);
    setAiProcessing(false);
    setAiComplete(false);
    setAiSuggestions([]);
  };

  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.name : t("dashboard.guestList.name");
  };

  const handleAddTable = async () => {
    if (!newTable.name || !newTable.capacity) return;

    try {
      const tableToAdd = {
        name: newTable.name,
        shape: newTable.shape as "round" | "rectangle" | "oval",
        capacity: newTable.capacity,
      };

      const addedTable = await tablesApi.createTable(tableToAdd);
      if (addedTable) {
        setTables([...tables, addedTable]);
        toast({
          title: t("common.success"),
          description: t("dashboard.tablePlanner.addTable"),
        });
      }
    } catch (error) {
      console.error("Error adding table:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setNewTable({
        name: "",
        shape: "round",
        capacity: 8,
        guests: [],
      });
      setAddTableDialogOpen(false);
    }
  };

  const handleTableMove = (
    tableId: string,
    delta: { x: number; y: number },
  ) => {
    setTablePositions((prev) => {
      const currentPos = prev[tableId] || { x: 0, y: 0 };
      return {
        ...prev,
        [tableId]: {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y,
        },
      };
    });
  };

  const handleGuestAssign = async (guestId: string, tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;

      await tablesApi.assignGuestToTable(guestId, table.name);

      // Update local state
      setTables((prev) => {
        return prev.map((t) => {
          if (t.id === tableId) {
            return {
              ...t,
              guests: [...t.guests, guestId],
            };
          }
          return t;
        });
      });

      setUnassignedGuests((prev) => prev.filter((g) => g.id !== guestId));

      toast({
        title: t("common.success"),
        description: `${t("dashboard.tablePlanner.assignGuests")}: ${table.name}`,
      });
    } catch (error) {
      console.error("Error assigning guest to table:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    }
  };

  const handleGuestRemove = async (guestId: string) => {
    try {
      await tablesApi.removeGuestFromTable(guestId);

      // Update local state
      setTables((prev) => {
        return prev.map((t) => {
          return {
            ...t,
            guests: t.guests.filter((id) => id !== guestId),
          };
        });
      });

      const guest = guests.find((g) => g.id === guestId);
      if (guest) {
        setUnassignedGuests((prev) => [
          ...prev,
          { ...guest, tableAssignment: null },
        ]);
      }

      toast({
        title: t("common.success"),
        description: t("dashboard.tablePlanner.removeTable"),
      });
    } catch (error) {
      console.error("Error removing guest from table:", error);
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    }
  };

  // Handle table selection for mobile view
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setTableDetailOpen(true);
  };

  // Handle guest tap on mobile
  const handleGuestTap = (guestId: string) => {
    if (isMobileView) {
      // Show a dialog to select which table to assign this guest to
      const availableTables = tables.filter(
        (t) => t.guests.length < t.capacity,
      );
      if (availableTables.length > 0) {
        // For simplicity, just assign to the first available table
        // In a real implementation, you'd show a selection dialog here
        handleGuestAssign(guestId, availableTables[0].id);
        toast({
          title: t("common.success"),
          description: `${t("dashboard.tablePlanner.assignGuests")}: ${availableTables[0].name}`,
        });
      } else {
        toast({
          title: t("common.error"),
          description: t("dashboard.tablePlanner.noAvailableTables"),
          variant: "destructive",
        });
      }
    }
  };

  // Render mobile table card
  const renderMobileTableCard = (table: Table) => {
    const tableGuests = table.guests
      .map((guestId) => guests.find((g) => g.id === guestId))
      .filter(Boolean) as Guest[];

    // Check if this table has any conflicts
    const hasConflicts = relationships.some(
      (rel) =>
        rel.relationshipType === "conflict" &&
        table.guests.includes(rel.guestId) &&
        table.guests.includes(rel.relatedGuestId),
    );

    return (
      <Card
        key={table.id}
        className={`mb-3 cursor-pointer hover:border-blue-300 transition-colors ${hasConflicts ? "border-amber-400" : ""}`}
        onClick={() => handleTableSelect(table)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-blue-800 flex items-center">
                {table.name}
                {hasConflicts && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 ml-2" />
                )}
              </h4>
              <p className="text-xs text-gray-500">
                {table.guests.length}/{table.capacity}{" "}
                {t("dashboard.attending")} •{" "}
                {t(`dashboard.tablePlanner.${table.shape}`)}{" "}
                {t("dashboard.tablePlanner.title").toLowerCase()}
              </p>
            </div>
            <div
              className={`${getTableShape(table.shape)} w-10 h-10 ${hasConflicts ? "bg-amber-100 border-amber-300" : "bg-blue-100 border-blue-200"} border flex items-center justify-center`}
            >
              <span className="text-xs font-medium">{table.guests.length}</span>
            </div>
          </div>

          {tableGuests.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mt-1">
                {tableGuests.slice(0, 3).map((guest) => {
                  // Check if this guest has conflicts with others at this table
                  const hasGuestConflict = relationships.some(
                    (rel) =>
                      rel.relationshipType === "conflict" &&
                      ((rel.guestId === guest.id &&
                        table.guests.includes(rel.relatedGuestId)) ||
                        (rel.relatedGuestId === guest.id &&
                          table.guests.includes(rel.guestId))),
                  );

                  return (
                    <Badge
                      key={guest.id}
                      variant="outline"
                      className={`${hasGuestConflict ? "bg-amber-50 border-amber-300" : "bg-blue-50"} text-xs`}
                    >
                      {guest.name}
                      {hasGuestConflict && (
                        <AlertTriangle className="h-3 w-3 text-amber-500 ml-1 inline" />
                      )}
                    </Badge>
                  );
                })}
                {tableGuests.length > 3 && (
                  <Badge variant="outline" className="bg-gray-100 text-xs">
                    +{tableGuests.length - 3} {t("common.more")}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {hasConflicts && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-1 rounded flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t("dashboard.tablePlanner.seatingConflicts")}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <CustomDndBackend>
      <div>
        {/* Mobile View Header */}
        {isMobileView ? (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {t("dashboard.tablePlanner.title")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {mobileMenuOpen && (
              <div className="bg-white border rounded-lg p-3 mb-4 flex flex-col space-y-2 shadow-sm">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setAddTableDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dashboard.tablePlanner.addTable")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    handlePrintTableAssignments();
                    setMobileMenuOpen(false);
                  }}
                  disabled={tables.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {t("dashboard.tablePlanner.printLayout")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-blue-600"
                  onClick={() => {
                    handleAiAssist();
                    setMobileMenuOpen(false);
                  }}
                  disabled={tables.length === 0 || guests.length === 0}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("dashboard.tablePlanner.aiAssistant")}
                </Button>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="layout" className="flex items-center">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {t("dashboard.tablePlanner.tables")}
                </TabsTrigger>
                <TabsTrigger value="guests" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {t("dashboard.guestManagement")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h3 className="text-lg font-medium">
              {t("dashboard.tablePlanner.floorPlan")}
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center w-full sm:w-auto"
                onClick={() => setAddTableDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t("dashboard.tablePlanner.addTable")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center w-full sm:w-auto"
                onClick={handlePrintTableAssignments}
                disabled={tables.length === 0}
              >
                <Printer className="mr-1 h-4 w-4" />
                {t("dashboard.tablePlanner.printLayout")}
              </Button>
              <Button
                size="sm"
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={handleAiAssist}
                disabled={tables.length === 0 || guests.length === 0}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {t("dashboard.tablePlanner.aiAssistant")}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : isMobileView ? (
          <div>
            <Tabs value={activeTab}>
              <TabsContent value="layout" className="mt-2">
                {tables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-blue-50 rounded-full p-3 mb-3">
                      <LayoutGrid className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-gray-500 mb-4">
                      {t("dashboard.tablePlanner.noTables")}
                    </p>
                    <Button
                      onClick={() => setAddTableDialogOpen(true)}
                      size="sm"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      {t("dashboard.tablePlanner.addFirstTable")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tables.map((table) => renderMobileTableCard(table))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="guests" className="mt-2">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-4 flex items-center justify-between">
                    <span>{t("dashboard.tablePlanner.unassignedGuests")}</span>
                    <span className="text-sm text-gray-500">
                      {unassignedGuests.length}{" "}
                      {t("dashboard.guestManagement").toLowerCase()}
                    </span>
                  </h4>

                  <DroppableGuestArea
                    unassignedGuests={unassignedGuests}
                    onGuestRemove={handleGuestRemove}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Table Layout Area */}
            <div className="lg:col-span-2">
              <DroppableTableArea
                tables={tables}
                guests={guests}
                getTableShape={getTableShape}
                onTableMove={handleTableMove}
                relationships={relationships}
                onGuestRemove={handleGuestRemove}
              />
            </div>

            {/* Unassigned Guests */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-4 flex items-center justify-between">
                <span>{t("dashboard.tablePlanner.unassignedGuests")}</span>
                <span className="text-sm text-gray-500">
                  {unassignedGuests.length}{" "}
                  {t("dashboard.guestManagement").toLowerCase()}
                </span>
              </h4>

              <DroppableGuestArea
                unassignedGuests={unassignedGuests}
                onGuestRemove={
                  isMobileView ? handleGuestTap : handleGuestRemove
                }
              />

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />{" "}
                  {t("dashboard.tablePlanner.seatingPreferences")}
                </h4>
                <p className="text-xs text-blue-700">
                  {t("dashboard.tablePlanner.preferencesDescription")}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>{t("dashboard.tablePlanner.conflictDetection")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Table Dialog */}
        <Dialog open={addTableDialogOpen} onOpenChange={setAddTableDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("dashboard.tablePlanner.addTable")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tableName">
                  {t("dashboard.tablePlanner.tableName")} *
                </Label>
                <Input
                  id="tableName"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  placeholder={t("dashboard.tablePlanner.tableNamePlaceholder")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tableShape">
                  {t("dashboard.tablePlanner.tableShape")}
                </Label>
                <Select
                  value={newTable.shape}
                  onValueChange={(value) =>
                    setNewTable({
                      ...newTable,
                      shape: value as "round" | "rectangle" | "oval",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("dashboard.tablePlanner.selectShape")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">
                      {t("dashboard.tablePlanner.round")}
                    </SelectItem>
                    <SelectItem value="rectangle">
                      {t("dashboard.tablePlanner.rectangular")}
                    </SelectItem>
                    <SelectItem value="oval">
                      {t("dashboard.tablePlanner.oval")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tableCapacity">
                  {t("dashboard.tablePlanner.capacity")} *
                </Label>
                <Input
                  id="tableCapacity"
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity?.toString() || "8"}
                  onChange={(e) =>
                    setNewTable({
                      ...newTable,
                      capacity: parseInt(e.target.value) || 8,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddTableDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAddTable}
                disabled={!newTable.name || !newTable.capacity}
              >
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Seating Assistant Dialog */}
        <Dialog open={aiDialogOpen} onOpenChange={resetAiDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.tablePlanner.aiAssistant")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.tablePlanner.aiAssistantDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {aiProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-center text-gray-700">
                    {t("dashboard.tablePlanner.aiProcessing")}
                  </p>
                </div>
              ) : aiComplete ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                    <Check className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      {t("dashboard.tablePlanner.aiComplete")}
                    </p>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border rounded-md p-3">
                    {aiSuggestions.map((table) => (
                      <div key={table.id} className="mb-4">
                        <h4 className="font-medium text-blue-800">
                          {table.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {table.guests.length}/{table.capacity}{" "}
                          {t("dashboard.guestManagement").toLowerCase()}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {table.guests.map((guestId) => (
                            <Badge
                              key={guestId}
                              variant="outline"
                              className="bg-blue-50"
                            >
                              {getGuestName(guestId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("dashboard.tablePlanner.beforeStart")}
                      </p>
                      <p className="text-xs mt-1">
                        {t("dashboard.tablePlanner.beforeStartDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-800">
                        {t("dashboard.tablePlanner.howAiWorks")}:
                      </h4>
                      <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
                        <li>{t("dashboard.tablePlanner.aiFeature1")}</li>
                        <li>{t("dashboard.tablePlanner.aiFeature2")}</li>
                        <li>{t("dashboard.tablePlanner.aiFeature3")}</li>
                        <li>{t("dashboard.tablePlanner.aiFeature4")}</li>
                      </ul>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={runAiAssistant}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={tables.length === 0 || guests.length === 0}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t("dashboard.tablePlanner.generateSeating")}
                      </Button>
                    </div>

                    {(tables.length === 0 || guests.length === 0) && (
                      <div className="text-amber-600 bg-amber-50 p-3 rounded-md text-xs text-center">
                        {tables.length === 0
                          ? t("dashboard.tablePlanner.addTableFirst")
                          : ""}
                        {tables.length === 0 && guests.length === 0
                          ? t("common.and")
                          : ""}
                        {guests.length === 0
                          ? t("dashboard.tablePlanner.addGuestsFirst")
                          : ""}{" "}
                        {t("dashboard.tablePlanner.beforeUsingAI")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {aiComplete ? (
                <>
                  <Button variant="outline" onClick={resetAiDialog}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={applyAiSuggestions}>
                    {t("dashboard.tablePlanner.applySeatingPlan")}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={resetAiDialog}>
                  {t("common.close")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Table Detail Dialog */}
        {isMobileView && (
          <Dialog open={tableDetailOpen} onOpenChange={setTableDetailOpen}>
            <DialogContent className="sm:max-w-md">
              {selectedTable && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedTable.name}</DialogTitle>
                    <DialogDescription>
                      {t(`dashboard.tablePlanner.${selectedTable.shape}`)}{" "}
                      {t("dashboard.tablePlanner.title").toLowerCase()}{" "}
                      {t("dashboard.tablePlanner.with")}{" "}
                      {selectedTable.capacity}{" "}
                      {t("dashboard.tablePlanner.seats")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">
                      {t("dashboard.tablePlanner.assignedGuests")} (
                      {selectedTable.guests.length}/{selectedTable.capacity})
                    </h4>

                    {selectedTable.guests.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        {t("dashboard.tablePlanner.noAssignedGuests")}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedTable.guests.map((guestId) => {
                          const guest = guests.find((g) => g.id === guestId);

                          // Check if this guest has conflicts with others at this table
                          const hasConflict = relationships.some(
                            (rel) =>
                              rel.relationshipType === "conflict" &&
                              ((rel.guestId === guestId &&
                                selectedTable.guests.includes(
                                  rel.relatedGuestId,
                                )) ||
                                (rel.relatedGuestId === guestId &&
                                  selectedTable.guests.includes(rel.guestId))),
                          );

                          return guest ? (
                            <div
                              key={guest.id}
                              className={`flex justify-between items-center p-2 ${hasConflict ? "bg-amber-50" : "bg-gray-50"} rounded-md`}
                            >
                              <div className="flex items-center">
                                <CircleUser
                                  className={`h-4 w-4 ${hasConflict ? "text-amber-500" : "text-gray-400"} mr-2`}
                                />
                                <span className="text-sm">{guest.name}</span>
                                {hasConflict && (
                                  <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleGuestRemove(guest.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {selectedTable.guests.length < selectedTable.capacity && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          {t("dashboard.tablePlanner.addGuests")}
                        </h4>
                        {unassignedGuests.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            {t("dashboard.tablePlanner.allGuestsAssigned")}
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {unassignedGuests.map((guest) => {
                              // Check if this guest would have conflicts at this table
                              const wouldHaveConflict = relationships.some(
                                (rel) =>
                                  rel.relationshipType === "conflict" &&
                                  ((rel.guestId === guest.id &&
                                    selectedTable.guests.includes(
                                      rel.relatedGuestId,
                                    )) ||
                                    (rel.relatedGuestId === guest.id &&
                                      selectedTable.guests.includes(
                                        rel.guestId,
                                      ))),
                              );

                              return (
                                <div
                                  key={guest.id}
                                  className={`flex justify-between items-center p-2 ${wouldHaveConflict ? "bg-amber-50" : "bg-gray-50"} rounded-md`}
                                >
                                  <div className="flex items-center">
                                    <CircleUser
                                      className={`h-4 w-4 ${wouldHaveConflict ? "text-amber-500" : "text-gray-400"} mr-2`}
                                    />
                                    <span className="text-sm">
                                      {guest.name}
                                    </span>
                                    {wouldHaveConflict && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {t(
                                                "dashboard.tablePlanner.guestConflictWarning",
                                              )}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600"
                                    onClick={() => {
                                      handleGuestAssign(
                                        guest.id,
                                        selectedTable.id,
                                      );
                                      // Update the selected table with the new guest
                                      setSelectedTable({
                                        ...selectedTable,
                                        guests: [
                                          ...selectedTable.guests,
                                          guest.id,
                                        ],
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTableDetailOpen(false)}
                >
                  {t("common.close")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Printable Table Assignments (hidden) */}
        <div className="hidden">
          <PrintableTableAssignments
            ref={printableTableAssignmentsRef}
            tables={tables}
            guests={guests}
            title={t("dashboard.tablePlanner.weddingTableAssignments")}
          />
        </div>
      </div>
    </CustomDndBackend>
  );
}
