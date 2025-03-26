import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  UserPlus,
  Loader2,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { Guest, guestsApi } from "@/lib/api";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define filter types for better type safety
type FilterType =
  | "attending"
  | "declined"
  | "pending"
  | "assigned"
  | "unassigned"
  | "dietary"
  | null;

interface PaginatedGuestListProps {
  onAddGuest?: () => void;
  onEditGuest?: (guest: Guest) => void;
  onPrintGuestList?: () => void;
  onExportGuestList?: () => void;
  itemsPerPage?: number;
  initialFilter?: FilterType;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

// Extracted components for better modularity
type FilterBadgeProps = {
  filter: string;
  label: string;
  activeFilter: string | null;
  onClick: (filter: string) => void;
};

const FilterBadge = ({
  filter,
  label,
  activeFilter,
  onClick,
}: FilterBadgeProps) => (
  <Badge
    variant={activeFilter === filter ? "default" : "outline"}
    className={`cursor-pointer ${activeFilter === filter ? "bg-blue-500" : "hover:bg-blue-100"}`}
    onClick={() => onClick(filter)}
  >
    {label}
  </Badge>
);

const GuestTableRow = ({
  guest,
  onEdit,
  t,
}: {
  guest: Guest;
  onEdit?: (guest: Guest) => void;
  t: (key: string) => string;
}) => (
  <TableRow
    key={guest.id}
    className="cursor-pointer hover:bg-gray-50"
    onClick={() => onEdit && onEdit(guest)}
  >
    <TableCell className="font-medium">
      <div className="flex flex-col">
        <span>{guest.name}</span>
        <span className="text-xs text-gray-500 sm:hidden">{guest.email}</span>
      </div>
    </TableCell>
    <TableCell className="hidden sm:table-cell">{guest.email}</TableCell>
    <TableCell className="hidden md:table-cell">
      <RsvpBadge status={guest.rsvpStatus} t={t} />
      <div className="md:hidden mt-1 text-xs">
        {guest.tableAssignment || t("dashboard.tablePlanner.unassigned")}
      </div>
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      {guest.tableAssignment || (
        <span className="text-gray-400">
          {t("dashboard.tablePlanner.unassigned")}
        </span>
      )}
    </TableCell>
  </TableRow>
);

type RsvpBadgeProps = {
  status: string;
  t: (key: string) => string;
};

const RsvpBadge = ({ status, t }: RsvpBadgeProps) => {
  const badgeClasses = {
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
  };

  const statusClass =
    badgeClasses[status as keyof typeof badgeClasses] || badgeClasses.pending;

  return (
    <Badge variant="outline" className={statusClass}>
      {status === "confirmed"
        ? t("dashboard.attending")
        : status === "declined"
          ? t("dashboard.declined")
          : t("dashboard.pending")}
    </Badge>
  );
};

/**
 * PaginatedGuestList component displays a paginated list of guests with search and filtering capabilities
 */
export function PaginatedGuestList({
  onAddGuest,
  onEditGuest,
  onPrintGuestList,
  onExportGuestList,
  itemsPerPage = 10,
  initialFilter = null,
  refreshTrigger = 0,
}: PaginatedGuestListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [error, setError] = useState<string | null>(null);

  // Fetch guests on component mount or when refreshTrigger changes
  useEffect(() => {
    fetchGuests();
  }, [refreshTrigger]);

  // Fetch all guests
  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allGuests = await guestsApi.getGuests();
      setGuests(allGuests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError(t("dashboard.errors.failedToLoadGuests"));
      toast({
        title: t("common.error"),
        description: t("dashboard.errors.failedToLoadGuests"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  // Memoized filter function to avoid unnecessary recalculations
  const filterGuest = useCallback(
    (guest: Guest, query: string, filter: FilterType): boolean => {
      // First apply search query filter
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        const matchesQuery =
          guest.name.toLowerCase().includes(lowercaseQuery) ||
          (guest.email && guest.email.toLowerCase().includes(lowercaseQuery)) ||
          (guest.phone && guest.phone.toLowerCase().includes(lowercaseQuery));

        if (!matchesQuery) return false;
      }

      // Then apply category filter
      if (!filter) return true;

      switch (filter) {
        case "attending":
          return guest.rsvpStatus === "confirmed";
        case "declined":
          return guest.rsvpStatus === "declined";
        case "pending":
          return guest.rsvpStatus === "pending";
        case "assigned":
          return !!guest.tableAssignment;
        case "unassigned":
          return !guest.tableAssignment;
        case "dietary":
          return !!guest.dietaryRestrictions;
        default:
          return true;
      }
    },
    [],
  );

  // Apply filters with memoization to prevent unnecessary recalculations
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) =>
      filterGuest(guest, searchQuery, activeFilter),
    );
  }, [guests, searchQuery, activeFilter, filterGuest]);

  // Calculate total pages once when filtered guests change
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredGuests.length / itemsPerPage));
  }, [filteredGuests.length, itemsPerPage]);

  // Ensure current page is valid when total pages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Get current page items with memoization
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGuests, currentPage, itemsPerPage]);

  // Handle page navigation
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  // Toggle filter with debounce to prevent multiple rapid changes
  const toggleFilter = useCallback((filter: string) => {
    setActiveFilter((prevFilter) =>
      prevFilter === (filter as FilterType) ? null : (filter as FilterType),
    );
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Handle search with debounce
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Reset to first page when search changes
    },
    [],
  );

  // Render action buttons
  const renderActionButtons = () => (
    <div className="flex gap-2">
      {onExportGuestList && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExportGuestList}
          className="text-xs"
          aria-label={t("common.export")}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {t("common.export")}
        </Button>
      )}
      {onPrintGuestList && (
        <Button
          variant="outline"
          size="sm"
          onClick={onPrintGuestList}
          className="text-xs"
          aria-label={t("common.print")}
        >
          <Printer className="h-3.5 w-3.5 mr-1" />
          {t("common.print")}
        </Button>
      )}
      {onAddGuest && (
        <Button
          size="sm"
          onClick={onAddGuest}
          aria-label={t("dashboard.guestList.addGuest")}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          {t("dashboard.guestList.addGuest")}
        </Button>
      )}
    </div>
  );

  // Render filter badges
  const renderFilterBadges = () => (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-wrap">
      <Filter className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
      <FilterBadge
        filter="attending"
        label={t("dashboard.attending")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
      <FilterBadge
        filter="declined"
        label={t("dashboard.declined")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
      <FilterBadge
        filter="pending"
        label={t("dashboard.pending")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
      <FilterBadge
        filter="assigned"
        label={t("dashboard.tablePlanner.assigned")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
      <FilterBadge
        filter="unassigned"
        label={t("dashboard.tablePlanner.unassigned")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
      <FilterBadge
        filter="dietary"
        label={t("dashboard.guestList.dietary")}
        activeFilter={activeFilter}
        onClick={toggleFilter}
      />
    </div>
  );

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredGuests.length);

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {t("common.showing")} {startItem}-{endItem} {t("common.of")}{" "}
          {filteredGuests.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            aria-label={t("common.firstPage")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={t("common.previousPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm" aria-live="polite">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={t("common.nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label={t("common.lastPage")}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{t("dashboard.guestList.title")}</CardTitle>
          {renderActionButtons()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <Input
                placeholder={t("dashboard.guestList.searchPlaceholder")}
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label={t("dashboard.guestList.searchPlaceholder")}
              />
            </div>
            {renderFilterBadges()}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md">{error}</div>
          )}

          {/* Guest table */}
          {loading ? (
            <div
              className="flex justify-center items-center py-12"
              aria-live="polite"
              aria-busy="true"
            >
              <LoadingSpinner size="lg" text={t("common.loading")} />
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-gray-500" aria-live="polite">
              {searchQuery || activeFilter
                ? t("dashboard.guestList.noMatchingGuests")
                : t("dashboard.guestList.noGuests")}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {t("common.email")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("dashboard.rsvp")}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("dashboard.tablePlanner.table")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageItems.map((guest) => (
                      <GuestTableRow
                        key={guest.id}
                        guest={guest}
                        onEdit={onEditGuest}
                        t={t}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PaginatedGuestList;
