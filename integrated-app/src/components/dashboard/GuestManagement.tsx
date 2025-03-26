import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  Download,
  Plus,
  Search,
  Upload,
  X,
  Loader2,
  Edit,
  Printer,
  Mail,
  Users,
  Table as TableIcon,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PrintableGuestList from "./PrintableGuestList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { guestsApi, Guest } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [importData, setImportData] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);
  const [editGuestDialogOpen, setEditGuestDialogOpen] = useState(false);
  const [bulkAssignTableDialogOpen, setBulkAssignTableDialogOpen] =
    useState(false);
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkTableAssignment, setBulkTableAssignment] = useState("");
  const [bulkEmailContent, setBulkEmailContent] = useState({
    subject: "",
    message: "",
  });
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: "",
    email: "",
    phone: "",
    rsvpStatus: "pending",
    dietaryRestrictions: "",
    tableAssignment: "",
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    rsvpStatus: "all",
    tableAssignment: "all",
    hasRestrictions: "all",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Guest | "";
    direction: "ascending" | "descending";
  }>({ key: "", direction: "ascending" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uniqueTables, setUniqueTables] = useState<string[]>([]);

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    // Reset selected guests when the guest list changes
    setSelectedGuests([]);
    setSelectAll(false);

    // Extract unique table assignments for filtering
    const tables = guests
      .map((guest) => guest.tableAssignment)
      .filter((table) => table && table.trim() !== "")
      .filter((table, index, self) => self.indexOf(table) === index);
    setUniqueTables(tables);
  }, [guests]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const fetchedGuests = await guestsApi.getGuests();
      setGuests(fetchedGuests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast({
        title: "Error",
        description: "Failed to load guests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search filter
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase());

      // RSVP status filter
      const matchesRsvp =
        filters.rsvpStatus === "all" || guest.rsvpStatus === filters.rsvpStatus;

      // Table assignment filter
      const matchesTable =
        filters.tableAssignment === "all" ||
        (filters.tableAssignment === "unassigned"
          ? !guest.tableAssignment || guest.tableAssignment.trim() === ""
          : guest.tableAssignment === filters.tableAssignment);

      // Dietary restrictions filter
      const matchesRestrictions =
        filters.hasRestrictions === "all" ||
        (filters.hasRestrictions === "yes"
          ? !!guest.dietaryRestrictions &&
            guest.dietaryRestrictions.trim() !== ""
          : !guest.dietaryRestrictions ||
            guest.dietaryRestrictions.trim() === "");

      return (
        matchesSearch && matchesRsvp && matchesTable && matchesRestrictions
      );
    });
  }, [guests, searchQuery, filters]);

  const sortedGuests = useMemo(() => {
    if (!sortConfig.key) return filteredGuests;

    return [...filteredGuests].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredGuests, sortConfig]);

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Confirmed
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Declined
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setImportDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      const importedGuests = JSON.parse(importData) as Guest[];

      // Validate the imported data structure
      if (!Array.isArray(importedGuests)) {
        throw new Error("Imported data is not an array");
      }

      // Check if each item has the required fields
      const isValid = importedGuests.every(
        (guest) =>
          typeof guest.name === "string" &&
          typeof guest.email === "string" &&
          (guest.rsvpStatus === "confirmed" ||
            guest.rsvpStatus === "declined" ||
            guest.rsvpStatus === "pending"),
      );

      if (!isValid) {
        throw new Error(
          "Some guests are missing required fields or have invalid data",
        );
      }

      const newGuests = await guestsApi.importGuests(importedGuests);
      if (newGuests.length > 0) {
        setGuests([...guests, ...newGuests]);
        setImportDialogOpen(false);
        toast({
          title: "Import Successful",
          description: `${newGuests.length} new guests have been imported.`,
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description:
          error instanceof Error ? error.message : "Invalid data format",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(guests, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `wedding_guests_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.email) return;

    try {
      const guestToAdd = {
        name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone || "",
        rsvpStatus: newGuest.rsvpStatus as "confirmed" | "declined" | "pending",
        dietaryRestrictions: newGuest.dietaryRestrictions,
        tableAssignment: newGuest.tableAssignment,
      };

      const addedGuest = await guestsApi.createGuest(guestToAdd);
      if (addedGuest) {
        setGuests([...guests, addedGuest]);
        toast({
          title: "Success",
          description: "Guest added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      toast({
        title: "Error",
        description: "Failed to add guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNewGuest({
        name: "",
        email: "",
        phone: "",
        rsvpStatus: "pending",
        dietaryRestrictions: "",
        tableAssignment: "",
      });
      setAddGuestDialogOpen(false);
    }
  };

  const handleEditGuest = async () => {
    if (!currentGuest || !currentGuest.name || !currentGuest.email) return;

    try {
      const updatedGuest = await guestsApi.updateGuest(currentGuest);
      if (updatedGuest) {
        setGuests(
          guests.map((guest) =>
            guest.id === updatedGuest.id ? updatedGuest : guest,
          ),
        );
        toast({
          title: "Success",
          description: "Guest updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating guest:", error);
      toast({
        title: "Error",
        description: "Failed to update guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditGuestDialogOpen(false);
      setCurrentGuest(null);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const success = await guestsApi.deleteGuest(guestId);
      if (success) {
        setGuests(guests.filter((guest) => guest.id !== guestId));
        toast({
          title: "Success",
          description: "Guest deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast({
        title: "Error",
        description: "Failed to delete guest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRsvpStatus = async (
    guestId: string,
    status: "confirmed" | "declined" | "pending",
  ) => {
    const guestToUpdate = guests.find((guest) => guest.id === guestId);
    if (!guestToUpdate) return;

    const updatedGuest = { ...guestToUpdate, rsvpStatus: status };

    try {
      const result = await guestsApi.updateGuest(updatedGuest);
      if (result) {
        setGuests(
          guests.map((guest) => (guest.id === guestId ? updatedGuest : guest)),
        );
        toast({
          title: "Success",
          description: `RSVP status updated to ${status}`,
        });
      }
    } catch (error) {
      console.error("Error updating RSVP status:", error);
      toast({
        title: "Error",
        description: "Failed to update RSVP status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdateRsvpStatus = async (
    status: "confirmed" | "declined" | "pending",
  ) => {
    if (selectedGuests.length === 0) return;

    try {
      const updatedGuests = [];

      for (const guestId of selectedGuests) {
        const guestToUpdate = guests.find((guest) => guest.id === guestId);
        if (guestToUpdate) {
          const updatedGuest = { ...guestToUpdate, rsvpStatus: status };
          const result = await guestsApi.updateGuest(updatedGuest);
          if (result) {
            updatedGuests.push(updatedGuest);
          }
        }
      }

      if (updatedGuests.length > 0) {
        setGuests(
          guests.map((guest) => {
            const updated = updatedGuests.find((u) => u.id === guest.id);
            return updated || guest;
          }),
        );

        toast({
          title: "Success",
          description: `RSVP status updated to ${status} for ${updatedGuests.length} guests`,
        });
      }
    } catch (error) {
      console.error("Error updating bulk RSVP status:", error);
      toast({
        title: "Error",
        description:
          "Failed to update RSVP status for some guests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAssignTable = async () => {
    if (selectedGuests.length === 0 || !bulkTableAssignment) return;

    try {
      const updatedGuests = [];

      for (const guestId of selectedGuests) {
        const guestToUpdate = guests.find((guest) => guest.id === guestId);
        if (guestToUpdate) {
          const updatedGuest = {
            ...guestToUpdate,
            tableAssignment: bulkTableAssignment,
          };
          const result = await guestsApi.updateGuest(updatedGuest);
          if (result) {
            updatedGuests.push(updatedGuest);
          }
        }
      }

      if (updatedGuests.length > 0) {
        setGuests(
          guests.map((guest) => {
            const updated = updatedGuests.find((u) => u.id === guest.id);
            return updated || guest;
          }),
        );

        toast({
          title: "Success",
          description: `Table assignment updated to ${bulkTableAssignment} for ${updatedGuests.length} guests`,
        });

        setBulkTableAssignment("");
        setBulkAssignTableDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating bulk table assignment:", error);
      toast({
        title: "Error",
        description:
          "Failed to update table assignment for some guests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkSendEmail = async () => {
    if (
      selectedGuests.length === 0 ||
      !bulkEmailContent.subject ||
      !bulkEmailContent.message
    )
      return;

    try {
      // This is a placeholder for the actual email sending functionality
      // In a real implementation, you would call an API endpoint to send emails

      toast({
        title: "Success",
        description: `Email sent to ${selectedGuests.length} guests`,
      });

      setBulkEmailContent({ subject: "", message: "" });
      setBulkEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast({
        title: "Error",
        description: "Failed to send emails to some guests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (guest: Guest) => {
    setCurrentGuest(guest);
    setEditGuestDialogOpen(true);
  };

  const printableGuestListRef = useRef<HTMLDivElement>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handlePrintGuestList = useReactToPrint({
    content: () => printableGuestListRef.current,
    documentTitle: "Wedding Guest List",
    onAfterPrint: () => setPrintDialogOpen(false),
  });

  const toggleSelectGuest = (guestId: string) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId],
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(sortedGuests.map((guest) => guest.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSort = (key: keyof Guest) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig.key === key) {
      direction =
        sortConfig.direction === "ascending" ? "descending" : "ascending";
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Guest) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }

    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const resetFilters = () => {
    setFilters({
      rsvpStatus: "all",
      tableAssignment: "all",
      hasRestrictions: "all",
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedGuests.length === 0) {
      toast({
        title: "No guests selected",
        description: "Please select at least one guest to perform this action.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case "confirm":
        handleBulkUpdateRsvpStatus("confirmed");
        break;
      case "decline":
        handleBulkUpdateRsvpStatus("declined");
        break;
      case "pending":
        handleBulkUpdateRsvpStatus("pending");
        break;
      case "assignTable":
        setBulkAssignTableDialogOpen(true);
        break;
      case "sendEmail":
        setBulkEmailDialogOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search guests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setFilterDialogOpen(true)}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filter
            {(filters.rsvpStatus !== "all" ||
              filters.tableAssignment !== "all" ||
              filters.hasRestrictions !== "all") && (
              <Badge
                variant="secondary"
                className="ml-2 bg-rose-100 text-rose-800"
              >
                {Object.values(filters).filter((v) => v !== "all").length}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleExport}
            disabled={guests.length === 0}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handlePrintGuestList}
            disabled={guests.length === 0}
          >
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button
            size="sm"
            className="flex items-center bg-rose-600 hover:bg-rose-700"
            onClick={() => setAddGuestDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {selectedGuests.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-md">
          <span className="text-sm font-medium">
            {selectedGuests.length} guests selected
          </span>
          <div className="flex-1"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions <MoreHorizontal className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction("confirm")}>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Mark as Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("decline")}>
                <X className="mr-2 h-4 w-4 text-red-500" />
                Mark as Declined
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("pending")}>
                <Users className="mr-2 h-4 w-4 text-amber-500" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("assignTable")}>
                <TableIcon className="mr-2 h-4 w-4 text-blue-500" />
                Assign to Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("sendEmail")}>
                <Mail className="mr-2 h-4 w-4 text-purple-500" />
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedGuests([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectAll && sortedGuests.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all guests"
                  />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Name
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("email")}
                  className="hidden sm:table-cell cursor-pointer"
                >
                  <div className="flex items-center">
                    Email
                    {getSortIcon("email")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("phone")}
                  className="hidden md:table-cell cursor-pointer"
                >
                  <div className="flex items-center">
                    Phone
                    {getSortIcon("phone")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("rsvpStatus")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    RSVP Status
                    {getSortIcon("rsvpStatus")}
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Dietary Restrictions
                </TableHead>
                <TableHead
                  onClick={() => handleSort("tableAssignment")}
                  className="hidden md:table-cell cursor-pointer"
                >
                  <div className="flex items-center">
                    Table
                    {getSortIcon("tableAssignment")}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGuests.length > 0 ? (
                sortedGuests.map((guest) => (
                  <TableRow
                    key={guest.id}
                    className={
                      selectedGuests.includes(guest.id) ? "bg-slate-50" : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedGuests.includes(guest.id)}
                        onCheckedChange={() => toggleSelectGuest(guest.id)}
                        aria-label={`Select ${guest.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {guest.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guest.phone || "-"}
                    </TableCell>
                    <TableCell>{getRsvpBadge(guest.rsvpStatus)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {guest.dietaryRestrictions || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guest.tableAssignment || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleUpdateRsvpStatus(guest.id, "confirmed")
                          }
                          disabled={guest.rsvpStatus === "confirmed"}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleUpdateRsvpStatus(guest.id, "declined")
                          }
                          disabled={guest.rsvpStatus === "declined"}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(guest)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    {searchQuery
                      ? "No guests found matching your search."
                      : "No guests added yet. Add your first guest!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Guests</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="import-data">Preview of import data</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                You can edit the JSON data above if needed before importing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleImport}>Import Guests</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Guest Dialog */}
      <Dialog open={addGuestDialogOpen} onOpenChange={setAddGuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newGuest.name}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, name: e.target.value })
                }
                placeholder="Enter guest name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newGuest.email}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, email: e.target.value })
                }
                placeholder="Enter guest email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newGuest.phone}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, phone: e.target.value })
                }
                placeholder="Enter guest phone"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rsvpStatus">RSVP Status</Label>
              <Select
                value={newGuest.rsvpStatus}
                onValueChange={(value) =>
                  setNewGuest({
                    ...newGuest,
                    rsvpStatus: value as "confirmed" | "declined" | "pending",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select RSVP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input
                id="dietaryRestrictions"
                value={newGuest.dietaryRestrictions}
                onChange={(e) =>
                  setNewGuest({
                    ...newGuest,
                    dietaryRestrictions: e.target.value,
                  })
                }
                placeholder="Enter dietary restrictions"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tableAssignment">Table Assignment</Label>
              <Input
                id="tableAssignment"
                value={newGuest.tableAssignment}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, tableAssignment: e.target.value })
                }
                placeholder="Enter table assignment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddGuestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGuest}
              disabled={!newGuest.name || !newGuest.email}
            >
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={editGuestDialogOpen} onOpenChange={setEditGuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {currentGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={currentGuest.name}
                  onChange={(e) =>
                    setCurrentGuest({ ...currentGuest, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentGuest.email}
                  onChange={(e) =>
                    setCurrentGuest({ ...currentGuest, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={currentGuest.phone}
                  onChange={(e) =>
                    setCurrentGuest({ ...currentGuest, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rsvpStatus">RSVP Status</Label>
                <Select
                  value={currentGuest.rsvpStatus}
                  onValueChange={(value) =>
                    setCurrentGuest({
                      ...currentGuest,
                      rsvpStatus: value as "confirmed" | "declined" | "pending",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dietaryRestrictions">
                  Dietary Restrictions
                </Label>
                <Input
                  id="edit-dietaryRestrictions"
                  value={currentGuest.dietaryRestrictions}
                  onChange={(e) =>
                    setCurrentGuest({
                      ...currentGuest,
                      dietaryRestrictions: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tableAssignment">Table Assignment</Label>
                <Input
                  id="edit-tableAssignment"
                  value={currentGuest.tableAssignment}
                  onChange={(e) =>
                    setCurrentGuest({
                      ...currentGuest,
                      tableAssignment: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteGuest(currentGuest.id);
                    setEditGuestDialogOpen(false);
                  }}
                >
                  Delete Guest
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditGuestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditGuest}
              disabled={
                !currentGuest || !currentGuest.name || !currentGuest.email
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Table Dialog */}
      <Dialog
        open={bulkAssignTableDialogOpen}
        onOpenChange={setBulkAssignTableDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Table to {selectedGuests.length} Guests
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-table-assignment">Table Assignment</Label>
              <Input
                id="bulk-table-assignment"
                value={bulkTableAssignment}
                onChange={(e) => setBulkTableAssignment(e.target.value)}
                placeholder="Enter table number or name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkAssignTableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssignTable}
              disabled={!bulkTableAssignment}
            >
              Assign Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialogOpen} onOpenChange={setBulkEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Send Email to {selectedGuests.length} Guests
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={bulkEmailContent.subject}
                onChange={(e) =>
                  setBulkEmailContent({
                    ...bulkEmailContent,
                    subject: e.target.value,
                  })
                }
                placeholder="Enter email subject"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={bulkEmailContent.message}
                onChange={(e) =>
                  setBulkEmailContent({
                    ...bulkEmailContent,
                    message: e.target.value,
                  })
                }
                placeholder="Enter your message"
                rows={6}
              />
              <p className="text-sm text-gray-500">
                This will be sent to all selected guests. You can use
                placeholders like {"{name}"} which will be replaced with each
                guest's name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSendEmail}
              disabled={!bulkEmailContent.subject || !bulkEmailContent.message}
            >
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Guests</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-rsvp">RSVP Status</Label>
              <Select
                value={filters.rsvpStatus}
                onValueChange={(value) =>
                  setFilters({ ...filters, rsvpStatus: value })
                }
              >
                <SelectTrigger id="filter-rsvp">
                  <SelectValue placeholder="Select RSVP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="filter-table">Table Assignment</Label>
              <Select
                value={filters.tableAssignment}
                onValueChange={(value) =>
                  setFilters({ ...filters, tableAssignment: value })
                }
              >
                <SelectTrigger id="filter-table">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {uniqueTables.map((table) => (
                    <SelectItem key={table} value={table}>
                      Table {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="filter-dietary">Dietary Restrictions</Label>
              <Select
                value={filters.hasRestrictions}
                onValueChange={(value) =>
                  setFilters({ ...filters, hasRestrictions: value })
                }
              >
                <SelectTrigger id="filter-dietary">
                  <SelectValue placeholder="Select restriction status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Guests</SelectItem>
                  <SelectItem value="yes">Has Restrictions</SelectItem>
                  <SelectItem value="no">No Restrictions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable Guest List (hidden) */}
      <div className="hidden">
        <PrintableGuestList
          ref={printableGuestListRef}
          guests={guests}
          title="Wedding Guest List"
        />
      </div>
    </div>
  );
}
