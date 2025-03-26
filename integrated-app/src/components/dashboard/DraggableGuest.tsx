import { useDrag } from "react-dnd";
import { CircleUser } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Guest } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

interface DraggableGuestProps {
  guest: Guest;
  highlightConflict?: boolean;
}

export function DraggableGuest({
  guest,
  highlightConflict = false,
}: DraggableGuestProps) {
  // Check if we're on a mobile device
  const isMobileView = window.innerWidth <= 768;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "GUEST",
    item: { id: guest.id, type: "GUEST" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      key={guest.id}
      className={`${isMobileView ? "cursor-pointer active:scale-95" : "cursor-move"} hover:bg-gray-50 transition-all ${highlightConflict ? "border-amber-400 bg-amber-50" : ""} ${isDragging ? "shadow-lg ring-2 ring-blue-300" : ""}`}
      style={{
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CircleUser
            className={`h-5 w-5 ${highlightConflict ? "text-amber-500" : isDragging ? "text-blue-500" : "text-gray-400"} mr-2`}
          />
          <span className="text-sm">{guest.name}</span>
        </div>
        {highlightConflict && (
          <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
        )}
        {isMobileView && !isDragging && !highlightConflict && (
          <div className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">Tap to assign</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
