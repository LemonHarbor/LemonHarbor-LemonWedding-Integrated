import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface GuestStepProps {
  formData: {
    initialGuests: Guest[];
  };
  updateFormData: (data: Partial<GuestStepProps["formData"]>) => void;
}

export default function GuestStep({
  formData,
  updateFormData,
}: GuestStepProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGuest, setNewGuest] = useState<Omit<Guest, "id">>({
    name: "",
    email: "",
    phone: "",
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");

  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.email) return;

    const guest: Guest = {
      id: Date.now().toString(),
      ...newGuest,
    };

    updateFormData({
      initialGuests: [...formData.initialGuests, guest],
    });

    setNewGuest({ name: "", email: "", phone: "" });
    setIsAddDialogOpen(false);
  };

  const handleRemoveGuest = (id: string) => {
    updateFormData({
      initialGuests: formData.initialGuests.filter((guest) => guest.id !== id),
    });
  };

  const handleImport = () => {
    try {
      const importedGuests = JSON.parse(importData);

      if (!Array.isArray(importedGuests)) {
        throw new Error("Imported data is not an array");
      }

      const validGuests = importedGuests
        .filter((guest) => guest.name && guest.email)
        .map((guest) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: guest.name,
          email: guest.email,
          phone: guest.phone || "",
        }));

      updateFormData({
        initialGuests: [...formData.initialGuests, ...validGuests],
      });

      setImportDialogOpen(false);
      toast({
        title: "Import Successful",
        description: `${validGuests.length} guests have been imported.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (formData.initialGuests.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Add some guests first before exporting.",
      });
      return;
    }

    const dataStr = JSON.stringify(formData.initialGuests, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `wedding_guests_template.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-rose-800 mb-2 text-center">
        Add Your Initial Guest List
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Start building your guest list - you can always add more later
      </p>

      <div className="flex justify-between mb-4">
        <div className="text-sm text-gray-500">
          {formData.initialGuests.length} guests added
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleExport}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="flex items-center bg-rose-600 hover:bg-rose-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formData.initialGuests.length > 0 ? (
              formData.initialGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGuest(guest.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  No guests added yet. Add your first guest to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Guest Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={newGuest.phone}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, phone: e.target.value })
                }
                placeholder="Enter guest phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Guests</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Paste JSON data below</Label>
              <textarea
                className="min-h-[200px] p-3 border rounded-md font-mono text-sm"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
