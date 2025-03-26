import { useState, useEffect } from "react";
import { guestsApi, Guest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No guests added yet. Add your first guest!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Guest List ({guests.length})</h3>
      <div className="grid gap-3">
        {guests.slice(0, 5).map((guest) => (
          <div
            key={guest.id}
            className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <div className="font-medium">{guest.name}</div>
              <div className="text-sm text-gray-500">{guest.email}</div>
            </div>
            <div>{getRsvpBadge(guest.rsvpStatus)}</div>
          </div>
        ))}
        {guests.length > 5 && (
          <div className="text-center text-sm text-gray-500">
            +{guests.length - 5} more guests
          </div>
        )}
      </div>
    </div>
  );
}
