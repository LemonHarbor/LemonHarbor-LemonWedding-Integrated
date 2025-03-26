import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Users } from "lucide-react";
import GuestList from "@/components/guest/GuestList";
import GuestForm from "@/components/guest/GuestForm";
import RSVPStats from "@/components/guest/RSVPStats";
import GuestRelationships from "@/components/guest/GuestRelationships";
import EmailNotifications from "@/components/guest/EmailNotifications";
import EmailLogs from "@/components/guest/EmailLogs";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeGuests } from "@/hooks/useRealtimeUpdates";
import { createGuest, updateGuest, deleteGuest } from "@/services/guestService";

const GuestManagement = () => {
  const { toast } = useToast();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const { guests, loading, refetch } = useRealtimeGuests();

  // Handle adding a new guest
  const handleAddGuest = () => {
    setIsEditing(false);
    setSelectedGuest(null);
    setShowGuestForm(true);
  };

  // Handle editing a guest
  const handleEditGuest = (guest) => {
    setIsEditing(true);
    setSelectedGuest(guest);
    setShowGuestForm(true);
  };

  // Handle deleting a guest
  const handleDeleteGuest = async (id) => {
    try {
      await deleteGuest(id);
      toast({
        title: "Guest Deleted",
        description: "The guest has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete guest: ${error.message}`,
      });
    }
  };

  // Handle guest form submission
  const handleGuestFormSubmit = async (data) => {
    try {
      if (isEditing && selectedGuest) {
        // Update existing guest
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        await updateGuest(selectedGuest.id, {
          name: fullName,
          email: data.email,
          phone: data.phone,
          category: data.category,
          dietary_restrictions: data.dietaryRestrictions,
          plus_one: data.plusOne,
          rsvp_status: data.rsvpStatus,
          notes: data.notes,
        });

        toast({
          title: "Guest Updated",
          description: "The guest has been updated successfully.",
        });
      } else {
        // Add new guest
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        await createGuest({
          name: fullName,
          email: data.email,
          phone: data.phone,
          category: data.category,
          dietary_restrictions: data.dietaryRestrictions,
          plus_one: data.plusOne,
          rsvp_status: data.rsvpStatus,
          notes: data.notes,
        });

        toast({
          title: "Guest Added",
          description: "The new guest has been added successfully.",
        });
      }

      setShowGuestForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} guest: ${error.message}`,
      });
    }
  };

  // Handle guest form cancel
  const handleGuestFormCancel = () => {
    setShowGuestForm(false);
  };

  // Handle showing relationships dialog
  const handleShowRelationships = () => {
    setShowRelationships(true);
  };

  // Handle refreshing guest list
  const handleRefreshGuests = () => {
    refetch();
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Guest Management</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShowRelationships}>
              <Users className="mr-2 h-4 w-4" />
              Manage Relationships
            </Button>
            <Button onClick={handleAddGuest}>
              <Plus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </div>
        </div>

        {/* RSVP Statistics */}
        <RSVPStats guests={guests} loading={loading} />

        {/* Guest List */}
        <GuestList
          guests={guests}
          loading={loading}
          onEditGuest={handleEditGuest}
          onDeleteGuest={handleDeleteGuest}
          onRefreshGuests={handleRefreshGuests}
        />

        {/* Email Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmailNotifications guests={guests} />
          <EmailLogs />
        </div>
      </div>

      {/* Guest Form Dialog */}
      <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
        <DialogContent className="sm:max-w-md">
          <GuestForm
            isEditing={isEditing}
            initialData={
              selectedGuest
                ? {
                    firstName: selectedGuest.name.split(" ")[0],
                    lastName: selectedGuest.name.split(" ")[1] || "",
                    email: selectedGuest.email,
                    phone: selectedGuest.phone || "",
                    category: selectedGuest.category.toLowerCase(),
                    dietaryRestrictions:
                      selectedGuest.dietaryRestrictions || "",
                    plusOne: selectedGuest.plusOne,
                    rsvpStatus: selectedGuest.rsvpStatus.toLowerCase(),
                    notes: selectedGuest.notes || "",
                  }
                : undefined
            }
            onSubmit={handleGuestFormSubmit}
            onCancel={handleGuestFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Relationships Dialog */}
      <Dialog open={showRelationships} onOpenChange={setShowRelationships}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <GuestRelationships />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GuestManagement;
