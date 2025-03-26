import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/language";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface RSVPFormProps {
  guestId?: string;
  initialStatus?: "confirmed" | "pending" | "declined";
  onStatusChange?: (status: "confirmed" | "pending" | "declined") => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({
  guestId,
  initialStatus = "pending",
  onStatusChange,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<"confirmed" | "pending" | "declined">(
    initialStatus,
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRSVP = async (
    newStatus: "confirmed" | "pending" | "declined",
  ) => {
    try {
      setIsSubmitting(true);

      // Use the provided guestId or fall back to the authenticated user's ID
      const targetGuestId = guestId || user?.id;

      if (!targetGuestId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No guest ID available. Please log in again.",
        });
        return;
      }

      // Update the guest's RSVP status in the database
      const { error } = await supabase
        .from("guests")
        .update({
          rsvp_status: newStatus,
          dietary_restrictions: dietaryRestrictions || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetGuestId);

      if (error) throw error;

      // Update local state
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);

      toast({
        title: "RSVP Updated",
        description: `Your RSVP has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update RSVP: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button
          className="flex-1"
          variant={status === "confirmed" ? "default" : "outline"}
          onClick={() => handleRSVP("confirmed")}
          disabled={isSubmitting}
        >
          I'll be there
        </Button>
        <Button
          variant={status === "declined" ? "destructive" : "outline"}
          className="flex-1"
          onClick={() => handleRSVP("declined")}
          disabled={isSubmitting}
        >
          I can't make it
        </Button>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dietary Restrictions</label>
        <Textarea
          placeholder="Please let us know if you have any dietary restrictions or allergies"
          value={dietaryRestrictions}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <Button
        className="w-full"
        onClick={() => handleRSVP(status)}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : t("actions.save")}
      </Button>
    </div>
  );
};

export default RSVPForm;
