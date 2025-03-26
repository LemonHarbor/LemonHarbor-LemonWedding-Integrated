import { useDrop } from "react-dnd";
import { Table, Guest, GuestRelationship } from "@/lib/api";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DroppableTableProps {
  table: Table;
  onGuestDrop: (guestId: string, tableId: string) => void;
  children: React.ReactNode;
  relationships?: GuestRelationship[];
  guests?: Guest[];
}

export function DroppableTable({
  table,
  onGuestDrop,
  children,
  relationships = [],
  guests = [],
}: DroppableTableProps) {
  // Check if we're on a mobile device
  const isMobileView = window.innerWidth <= 768;
  const [conflicts, setConflicts] = useState<{ [key: string]: string[] }>({});
  const [hasConflicts, setHasConflicts] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "GUEST",
    drop: (item: { id: string; type: string }) => {
      if (item.type === "GUEST" && table.guests.length < table.capacity) {
        onGuestDrop(item.id, table.id);
      }
    },
    canDrop: () => table.guests.length < table.capacity,
    hover: () => {
      setIsHovering(true);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Reset hover state when not over
  useEffect(() => {
    if (!isOver) {
      setIsHovering(false);
    }
  }, [isOver]);

  const isValidDropTarget = isOver && canDrop;

  // Detect conflicts whenever table guests or relationships change
  useEffect(() => {
    if (
      !relationships ||
      relationships.length === 0 ||
      table.guests.length <= 1 ||
      !guests.length
    ) {
      setConflicts({});
      setHasConflicts(false);
      return;
    }

    const newConflicts: { [key: string]: string[] } = {};
    let conflictsFound = false;

    // Check each guest against others at the table for conflicts
    table.guests.forEach((guestId) => {
      const guestConflicts: string[] = [];

      // Find all conflict relationships for this guest
      const guestRelationships = relationships.filter(
        (r) =>
          r.relationshipType === "conflict" &&
          (r.guestId === guestId || r.relatedGuestId === guestId),
      );

      // Check if any of those conflicting guests are at this table
      guestRelationships.forEach((rel) => {
        const conflictingGuestId =
          rel.guestId === guestId ? rel.relatedGuestId : rel.guestId;

        if (table.guests.includes(conflictingGuestId)) {
          guestConflicts.push(conflictingGuestId);
          conflictsFound = true;
        }
      });

      if (guestConflicts.length > 0) {
        newConflicts[guestId] = guestConflicts;
      }
    });

    setConflicts(newConflicts);
    setHasConflicts(conflictsFound);
  }, [table.guests, relationships, guests]);

  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.name : "Unknown Guest";
  };

  return (
    <div
      ref={drop}
      className={`relative transition-all duration-200 ${isValidDropTarget ? "ring-2 ring-blue-400 scale-105" : isHovering ? "ring-1 ring-blue-200" : hasConflicts ? "ring-2 ring-amber-400" : ""}`}
    >
      {hasConflicts && (
        <div className="absolute -top-2 -right-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-amber-400 rounded-full p-1">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This table has seating conflicts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {children}
      {isValidDropTarget && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-full flex items-center justify-center animate-pulse">
          <div className="text-blue-600 font-medium text-xs bg-white px-3 py-1.5 rounded-full shadow-md">
            {isMobileView ? "Release to assign" : "Drop to assign"}
          </div>
        </div>
      )}
      {!isValidDropTarget &&
        isHovering &&
        table.guests.length >= table.capacity && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-30 rounded-full flex items-center justify-center">
            <div className="text-gray-600 font-medium text-xs bg-white px-3 py-1.5 rounded-full shadow-md">
              Table full
            </div>
          </div>
        )}
    </div>
  );
}
