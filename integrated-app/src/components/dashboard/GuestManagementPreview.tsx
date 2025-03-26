import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, ChevronRight, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeGuests } from "@/hooks/useRealtimeUpdates";

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvpStatus: "confirmed" | "pending" | "declined";
  category: string;
  avatar?: string;
}

interface GuestManagementPreviewProps {
  onViewAll?: () => void;
  onAddGuest?: () => void;
  onGuestClick?: (guestId: string) => void;
}

const GuestManagementPreview = ({
  onViewAll = () => {},
  onAddGuest = () => {},
  onGuestClick = () => {},
}: GuestManagementPreviewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Use the realtime hook to get guests with live updates
  const { guests: realtimeGuests, loading, error } = useRealtimeGuests();

  // Format guests for the component
  const guests = realtimeGuests.map((guest) => ({
    id: guest.id,
    name: guest.name,
    email: guest.email,
    rsvpStatus: guest.rsvp_status as "confirmed" | "pending" | "declined",
    category: guest.category,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guest.name.replace(/\s+/g, "")}`,
  }));

  // Filter guests based on search term and active tab
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "confirmed" && guest.rsvpStatus === "confirmed") ||
      (activeTab === "pending" && guest.rsvpStatus === "pending") ||
      (activeTab === "declined" && guest.rsvpStatus === "declined");

    return matchesSearch && matchesTab;
  });

  // Calculate RSVP statistics
  const confirmedCount = guests.filter(
    (guest) => guest.rsvpStatus === "confirmed",
  ).length;
  const pendingCount = guests.filter(
    (guest) => guest.rsvpStatus === "pending",
  ).length;
  const declinedCount = guests.filter(
    (guest) => guest.rsvpStatus === "declined",
  ).length;

  return (
    <Card className="w-full h-full bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Guest Management</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddGuest}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add Guest
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-sm">{guests.length}</span>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
              <span className="text-sm font-medium">Confirmed:</span>
              <span className="text-sm">{confirmedCount}</span>
            </div>
            <div className="flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded-md">
              <span className="text-sm font-medium">Pending:</span>
              <span className="text-sm">{pendingCount}</span>
            </div>
            <div className="flex items-center gap-1 bg-destructive/10 px-2 py-1 rounded-md">
              <span className="text-sm font-medium">Declined:</span>
              <span className="text-sm">{declinedCount}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-0 mt-0">
                <GuestList
                  guests={filteredGuests}
                  onGuestClick={onGuestClick}
                />
              </TabsContent>
              <TabsContent value="confirmed" className="space-y-0 mt-0">
                <GuestList
                  guests={filteredGuests}
                  onGuestClick={onGuestClick}
                />
              </TabsContent>
              <TabsContent value="pending" className="space-y-0 mt-0">
                <GuestList
                  guests={filteredGuests}
                  onGuestClick={onGuestClick}
                />
              </TabsContent>
              <TabsContent value="declined" className="space-y-0 mt-0">
                <GuestList
                  guests={filteredGuests}
                  onGuestClick={onGuestClick}
                />
              </TabsContent>
            </Tabs>
          )}

          {!loading && filteredGuests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="mb-4">No guests found matching your criteria</p>
              <Button variant="outline" onClick={onAddGuest}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Guest
              </Button>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-destructive">
              <p className="mb-4">Error loading guests: {error.message}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface GuestListProps {
  guests: Guest[];
  onGuestClick: (guestId: string) => void;
}

const GuestList = ({ guests, onGuestClick }: GuestListProps) => {
  // Helper function to determine badge variant based on RSVP status
  const getRsvpBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-2">
      {guests.slice(0, 5).map((guest) => (
        <div
          key={guest.id}
          className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => onGuestClick(guest.id)}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={guest.avatar} alt={guest.name} />
              <AvatarFallback>
                {guest.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{guest.name}</p>
              <p className="text-sm text-muted-foreground">{guest.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getRsvpBadgeVariant(guest.rsvpStatus)}>
              {guest.rsvpStatus.charAt(0).toUpperCase() +
                guest.rsvpStatus.slice(1)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {guest.category}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuestManagementPreview;
