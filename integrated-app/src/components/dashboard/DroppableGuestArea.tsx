import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useDrop } from "react-dnd";
import { DraggableGuest } from "./DraggableGuest";
import { Guest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";

// Constants
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_DELAY = 100;

interface DroppableGuestAreaProps {
  /** List of guests that haven't been assigned to tables */
  unassignedGuests: Guest[];
  /** Callback when a guest is removed from a table or assigned to a table */
  onGuestRemove: (guestId: string) => void;
  /** Maximum height of the container in pixels */
  maxHeight?: number;
  /** Screen width threshold for mobile view in pixels */
  mobileBreakpoint?: number;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Custom mobile instruction message */
  mobileInstructionMessage?: string;
}

/**
 * A component that displays unassigned guests and allows them to be dropped into tables.
 * Supports both desktop drag-and-drop and mobile tap interactions.
 *
 * @param props - Component props
 * @returns A memoized DroppableGuestArea component
 */
export const DroppableGuestArea = memo(function DroppableGuestArea({
  unassignedGuests = [],
  onGuestRemove,
  maxHeight = 350,
  mobileBreakpoint = MOBILE_BREAKPOINT,
  emptyStateMessage,
  mobileInstructionMessage,
}: DroppableGuestAreaProps) {
  const { t } = useTranslation();
  const [isMobileView, setIsMobileView] = useState(false);

  // Default messages with translation support
  const defaultEmptyMessage =
    t("tablePlanner.allGuestsAssigned") ||
    "All guests have been assigned to tables!";
  const defaultMobileInstruction =
    t("tablePlanner.tapToAssign") || "Tap a guest to assign them to a table";

  // Use provided messages or defaults
  const actualEmptyMessage = emptyStateMessage || defaultEmptyMessage;
  const actualMobileInstruction =
    mobileInstructionMessage || defaultMobileInstruction;

  // Memoized function to check if we're on a mobile device
  const checkMobileView = useCallback(() => {
    setIsMobileView(window.innerWidth <= mobileBreakpoint);
  }, [mobileBreakpoint]);

  // Set up responsive behavior
  useEffect(() => {
    // Initial check
    checkMobileView();

    // Debounced resize handler for better performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobileView, RESIZE_DEBOUNCE_DELAY);
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [checkMobileView]);

  // Set up drop functionality with error handling
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "GUEST",
      drop: (item: { id: string; type: string }) => {
        try {
          if (item.type === "GUEST" && item.id) {
            onGuestRemove(item.id);
          }
        } catch (error) {
          console.error("Error in drop handler:", error);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [onGuestRemove],
  );

  // Handle guest click for mobile view
  const handleGuestClick = useCallback(
    (guestId: string) => {
      if (isMobileView && guestId) {
        onGuestRemove(guestId);
      }
    },
    [isMobileView, onGuestRemove],
  );

  // Memoized values to prevent unnecessary calculations
  const isEmpty = useMemo(
    () => unassignedGuests.length === 0,
    [unassignedGuests],
  );
  const showMobileInstruction = useMemo(
    () => isMobileView && !isEmpty,
    [isMobileView, isEmpty],
  );

  // Memoized class names for better performance
  const containerClassName = useMemo(
    () =>
      cn("space-y-2 overflow-y-auto pr-2 transition-all duration-200", {
        "bg-blue-50 rounded-md p-2 ring-1 ring-blue-200": isOver && canDrop,
      }),
    [isOver, canDrop],
  );

  return (
    <div
      ref={drop}
      className={containerClassName}
      style={{ maxHeight: `${maxHeight}px` }}
      aria-label={
        t("tablePlanner.unassignedGuestsArea") || "Unassigned guests area"
      }
      role="region"
      data-testid="droppable-guest-area"
    >
      {isEmpty ? (
        <div
          className="text-center py-4 text-gray-500 text-sm"
          role="status"
          aria-live="polite"
        >
          {actualEmptyMessage}
        </div>
      ) : (
        <>
          {showMobileInstruction && (
            <p className="text-xs text-gray-400 mb-2" aria-live="polite">
              {actualMobileInstruction}
            </p>
          )}

          <div className="space-y-2">
            {unassignedGuests.map((guest) => (
              <div
                key={guest.id}
                onClick={() => handleGuestClick(guest.id)}
                className={cn({
                  "cursor-pointer hover:bg-blue-50 rounded-md transition-colors":
                    isMobileView,
                })}
                role="button"
                tabIndex={0}
                aria-label={
                  t("tablePlanner.assignGuestToTable", { name: guest.name }) ||
                  `Assign ${guest.name} to a table`
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleGuestClick(guest.id);
                  }
                }}
              >
                <DraggableGuest guest={guest} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

// Add display name for better debugging
DroppableGuestArea.displayName = "DroppableGuestArea";
