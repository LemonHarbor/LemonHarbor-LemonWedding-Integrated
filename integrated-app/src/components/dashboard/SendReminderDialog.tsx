import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent as UIDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Search,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/use-toast";
import { guestsApi, Guest } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingCount: number;
  pendingGuests?: Guest[];
  isLoading?: boolean;
  onReminderSent?: () => void;
}

// Dialog states
enum DialogState {
  SELECTING = "selecting",
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
}

type UserData = {
  id: string;
  email?: string;
} | null;

/**
 * SendReminderDialog component allows users to send RSVP reminders to selected guests
 * who haven't responded to their invitation yet.
 */
export function SendReminderDialog({
  open,
  onOpenChange,
  pendingCount,
  pendingGuests = [],
  isLoading = false,
  onReminderSent,
}: SendReminderDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dialogState, setDialogState] = useState<DialogState>(
    DialogState.SELECTING,
  );
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [user, setUser] = useState<UserData>(null);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get the current user when the component mounts
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(t("dashboard.reminderErrors.userFetch"));
      }
    };
    getUser();
  }, [t]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setDialogState(isLoading ? DialogState.LOADING : DialogState.SELECTING);
      setError(null);
      setSelectAll(true);
      setSearchQuery("");
    }
  }, [open, isLoading]);

  // Update dialog state based on isLoading prop
  useEffect(() => {
    if (open && isLoading) {
      setDialogState(DialogState.LOADING);
    } else if (open && dialogState === DialogState.LOADING && !isLoading) {
      setDialogState(DialogState.SELECTING);
    }
  }, [isLoading, open, dialogState]);

  // Filter guests based on search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return pendingGuests;

    const query = searchQuery.toLowerCase().trim();
    return pendingGuests.filter(
      (guest) =>
        guest.name?.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query),
    );
  }, [pendingGuests, searchQuery]);

  // Update selected guests when pendingGuests changes or selectAll changes
  useEffect(() => {
    if (selectAll && filteredGuests.length > 0) {
      setSelectedGuests(filteredGuests.map((guest) => guest.id));
    } else if (
      !selectAll &&
      selectedGuests.length === filteredGuests.length &&
      filteredGuests.length > 0
    ) {
      // If all filtered guests are selected but selectAll is false, deselect all
      setSelectedGuests([]);
    }
  }, [filteredGuests, selectAll]);

  const handleToggleSelectAll = useCallback(() => {
    setSelectAll((prev) => !prev);
  }, []);

  const handleToggleGuest = useCallback(
    (guestId: string) => {
      setSelectedGuests((prev) => {
        const isSelected = prev.includes(guestId);
        const newSelection = isSelected
          ? prev.filter((id) => id !== guestId)
          : [...prev, guestId];

        // Update selectAll state based on whether all filtered guests are selected
        if (
          filteredGuests.length === newSelection.length &&
          filteredGuests.length > 0
        ) {
          setSelectAll(true);
        } else if (selectAll && newSelection.length < filteredGuests.length) {
          setSelectAll(false);
        }

        return newSelection;
      });
    },
    [filteredGuests, selectAll],
  );

  const handleSendReminders = async () => {
    if (!user) {
      setError(t("dashboard.reminderErrors.notLoggedIn"));
      setDialogState(DialogState.ERROR);
      return;
    }

    if (selectedGuests.length === 0) {
      setError(t("dashboard.reminderErrors.noSelection"));
      setDialogState(DialogState.ERROR);
      return;
    }

    setDialogState(DialogState.LOADING);
    setError(null);

    try {
      // Use the API function to send reminders to selected guests
      const success = await guestsApi.sendRsvpReminders(selectedGuests);

      if (success) {
        setDialogState(DialogState.SUCCESS);
        setSentCount(selectedGuests.length);

        // Show a toast notification for success
        toast({
          title: t("common.success"),
          description: t("dashboard.reminderSuccess", {
            count: selectedGuests.length,
          }),
          variant: "default",
        });

        // Call the callback if provided
        if (onReminderSent) {
          onReminderSent();
        }
      } else {
        throw new Error(t("dashboard.reminderErrors.failed"));
      }
    } catch (err: any) {
      console.error("Error sending reminders:", err);
      setError(err.message || t("dashboard.reminderErrors.unexpected"));
      setDialogState(DialogState.ERROR);

      // Show a toast notification for error
      toast({
        title: t("common.error"),
        description: err.message || t("dashboard.reminderErrors.unexpected"),
        variant: "destructive",
      });
    }
  };

  const handleClose = useCallback(() => {
    if (dialogState !== DialogState.LOADING) {
      onOpenChange(false);
      // Reset state after dialog is closed
      setTimeout(() => {
        setDialogState(DialogState.SELECTING);
        setError(null);
        setSearchQuery("");
      }, 300);
    }
  }, [dialogState, onOpenChange]);

  // Render components for different dialog states
  const dialogContentComponents = {
    [DialogState.ERROR]: () => (
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-800 mb-2">
          {t("dashboard.reminderErrors.title")}
        </p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    ),
    [DialogState.LOADING]: () => (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
        <p className="text-sm text-gray-600">{t("common.loading")}</p>
      </div>
    ),
    [DialogState.SUCCESS]: () => (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-800 mb-2">
          {t("dashboard.remindersSent")}
        </p>
        <p className="text-xs text-gray-500">
          {sentCount > 0
            ? t("dashboard.remindersSentDesc", { count: sentCount })
            : t("dashboard.noRemindersSent")}
        </p>
      </div>
    ),
    [DialogState.SELECTING]: () => (
      <div className="w-full">
        <div className="text-center mb-4">
          <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {t("dashboard.selectGuestsForReminder")}
          </p>
        </div>

        {pendingGuests.length > 0 ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("dashboard.searchGuests")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                aria-label={t("dashboard.searchGuests")}
              />
            </div>

            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectAll && filteredGuests.length > 0}
                onCheckedChange={handleToggleSelectAll}
                disabled={filteredGuests.length === 0}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium flex items-center cursor-pointer"
              >
                <Users className="h-4 w-4 mr-1" />
                {t("dashboard.selectAll")} ({filteredGuests.length})
              </label>
            </div>

            {filteredGuests.length > 0 ? (
              <>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {filteredGuests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded-md transition-colors"
                      >
                        <Checkbox
                          id={`guest-${guest.id}`}
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => handleToggleGuest(guest.id)}
                        />
                        <label
                          htmlFor={`guest-${guest.id}`}
                          className="text-sm flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-500" />
                            {guest.name}
                          </span>
                          <span
                            className="text-xs text-gray-500 truncate max-w-[120px]"
                            title={guest.email}
                          >
                            {guest.email}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <p className="text-xs text-gray-500 mt-2">
                  {t("dashboard.selectedGuestsCount", {
                    selected: selectedGuests.length,
                    total: filteredGuests.length,
                  })}
                </p>
              </>
            ) : (
              <p className="text-center text-sm text-amber-600 py-4">
                {t("dashboard.noGuestsMatchSearch")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-amber-600">
            {t("dashboard.noPendingGuests")}
          </p>
        )}
      </div>
    ),
  };

  // Determine if the send button should be shown
  const shouldShowSendButton =
    dialogState === DialogState.SELECTING && filteredGuests.length > 0;

  // Determine if the send button should be disabled
  const isSendButtonDisabled = selectedGuests.length === 0;

  // Get the appropriate content component based on dialog state
  const CurrentContent =
    dialogContentComponents[dialogState] ||
    dialogContentComponents[DialogState.SELECTING];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <UIDialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.sendReminders")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.sendRemindersDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          <CurrentContent />
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={dialogState === DialogState.LOADING}
          >
            {dialogState === DialogState.SUCCESS ||
            dialogState === DialogState.ERROR
              ? t("common.close")
              : t("common.cancel")}
          </Button>
          {shouldShowSendButton && (
            <Button
              onClick={handleSendReminders}
              disabled={isSendButtonDisabled}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {t("dashboard.sendReminders")}
            </Button>
          )}
        </DialogFooter>
      </UIDialogContent>
    </Dialog>
  );
}
