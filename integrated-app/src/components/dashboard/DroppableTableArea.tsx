import { useDrop } from "react-dnd";
import { DraggableTable } from "./DraggableTable";
import { Table, Guest, GuestRelationship } from "@/lib/api";

interface DroppableTableAreaProps {
  tables: Table[];
  guests: Guest[];
  getTableShape: (shape: string) => string;
  onTableMove: (tableId: string, position: { x: number; y: number }) => void;
  relationships?: GuestRelationship[];
  onGuestRemove?: (guestId: string) => void;
}

export function DroppableTableArea({
  tables,
  guests,
  getTableShape,
  onTableMove,
  relationships = [],
  onGuestRemove = () => {},
}: DroppableTableAreaProps) {
  // Check if we're on a mobile device
  const isMobileView = window.innerWidth <= 768;
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TABLE",
    drop: (item: { id: string; type: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && item.type === "TABLE") {
        const x = Math.round(delta.x);
        const y = Math.round(delta.y);
        onTableMove(item.id, { x, y });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-gray-50 border border-dashed ${isOver ? "border-blue-400 bg-blue-50/20" : "border-gray-200"} rounded-lg p-3 sm:p-4 md:p-6 min-h-[300px] sm:min-h-[400px] relative w-full h-full transition-all duration-200`}
    >
      <div className="absolute top-4 left-4 text-sm text-gray-400">
        {isMobileView
          ? "Tap tables to manage guests"
          : "Drag tables to arrange them"}
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">No tables added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-8">
          {tables.map((table) => (
            <DraggableTable
              key={table.id}
              table={table}
              guests={guests}
              getTableShape={getTableShape}
              relationships={relationships}
              onGuestRemove={onGuestRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
