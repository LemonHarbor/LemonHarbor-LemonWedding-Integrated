import { useDrag } from "react-dnd";
import { CircleUser, AlertTriangle } from "lucide-react";
import { Table, Guest, GuestRelationship } from "@/lib/api";

interface DraggableTableProps {
  table: Table;
  guests: Guest[];
  getTableShape?: (shape: string) => string;
  relationships?: GuestRelationship[];
  onGuestRemove?: (guestId: string) => void;
}

export function DraggableTable({
  table,
  guests,
  getTableShape = (shape) =>
    shape === "round"
      ? "rounded-full"
      : shape === "oval"
        ? "rounded-full aspect-[1.5/1]"
        : "rounded-md",
  relationships = [],
  onGuestRemove = () => {},
}: DraggableTableProps) {
  // Check if we're on a mobile device
  const isMobileView = window.innerWidth <= 768;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TABLE",
    item: { id: table.id, type: "TABLE" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Prevent dragging on mobile - use tap instead
    canDrag: () => !isMobileView,
  }));

  // Check if this table has any conflicts
  const hasConflicts = relationships.some(
    (rel) =>
      rel.relationshipType === "conflict" &&
      table.guests.includes(rel.guestId) &&
      table.guests.includes(rel.relatedGuestId),
  );

  return (
    <div
      ref={drag}
      className="relative transition-all duration-200"
      style={{
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      <div
        className={`${getTableShape(table.shape)} ${hasConflicts ? "bg-white border-2 border-amber-300" : "bg-white border-2 border-blue-200"} flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 ${isMobileView ? "cursor-pointer active:scale-95" : "cursor-move"} shadow-sm hover:shadow-md transition-all`}
      >
        <div className="text-center">
          <div
            className={`font-medium ${hasConflicts ? "text-amber-700" : "text-blue-800"}`}
          >
            {table.name}
            {hasConflicts && (
              <AlertTriangle className="h-4 w-4 text-amber-500 ml-1 inline" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {table.guests.length}/{table.capacity} guests
          </div>
          {isMobileView && (
            <div className="text-xs text-blue-400 mt-1">Tap to manage</div>
          )}
        </div>
      </div>

      {/* Guest indicators */}
      {table.guests.slice(0, 3).map((guestId, index) => {
        const guest = guests.find((g) => g.id === guestId);
        const angle = index * 45 * (Math.PI / 180);
        const x = Math.cos(angle) * 60;
        const y = Math.sin(angle) * 60;

        // Check if this guest has conflicts with others at this table
        const hasGuestConflict = relationships.some(
          (rel) =>
            rel.relationshipType === "conflict" &&
            ((rel.guestId === guestId &&
              table.guests.includes(rel.relatedGuestId)) ||
              (rel.relatedGuestId === guestId &&
                table.guests.includes(rel.guestId))),
        );

        return guest ? (
          <div
            key={guest.id}
            className={`absolute ${hasGuestConflict ? "bg-amber-100 border-amber-300" : "bg-blue-100 border-blue-200"} rounded-full w-8 h-8 flex items-center justify-center border`}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              top: "50%",
              left: "50%",
              marginTop: "-16px",
              marginLeft: "-16px",
            }}
            title={guest.name}
          >
            <CircleUser
              className={`h-5 w-5 ${hasGuestConflict ? "text-amber-600" : "text-blue-600"}`}
            />
          </div>
        ) : null;
      })}

      {table.guests.length > 3 && (
        <div
          className="absolute bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center border border-blue-200"
          style={{
            bottom: "0",
            right: "0",
          }}
        >
          <span className="text-xs text-blue-600 font-medium">
            +{table.guests.length - 3}
          </span>
        </div>
      )}

      {hasConflicts && (
        <div
          className="absolute bg-amber-400 rounded-full w-6 h-6 flex items-center justify-center border border-amber-500"
          style={{
            top: "0",
            right: "0",
            transform: "translate(30%, -30%)",
          }}
          title="Seating conflicts detected"
        >
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
}
