import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendReminderDialog } from "./SendReminderDialog";
import { useTranslation } from "@/lib/useTranslation";
import { guestsApi, Guest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface RsvpStats {
  attending: number;
  declined: number;
  pending: number;
  total: number;
}

interface RsvpStatsProps {
  stats?: RsvpStats;
  onRefresh?: () => void;
}

interface StatCardProps {
  value: number;
  label: string;
  color: string;
}

// Extracted StatCard component for better reusability
const StatCard = ({ value, label, color }: StatCardProps) => (
  <div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

/**
 * RsvpStats component displays statistics about guest RSVPs and provides
 * functionality to send reminders to guests with pending responses.
 */
export default function RsvpStats({
  stats = {
    attending: 0,
    declined: 0,
    pending: 0,
    total: 0,
  },
  onRefresh,
}: RsvpStatsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate percentages only once when stats change
  const percentages = useMemo(() => {
    const total = Math.max(stats.total, 1); // Prevent division by zero
    return {
      attending: Math.round((stats.attending / total) * 100),
      declined: Math.round((stats.declined / total) * 100),
      pending: Math.round((stats.pending / total) * 100),
    };
  }, [stats]);

  // Fetch pending guests when the reminder dialog opens
  useEffect(() => {
    if (reminderDialogOpen && stats.pending > 0) {
      fetchPendingGuests();
    }
  }, [reminderDialogOpen, stats.pending]);

  const fetchPendingGuests = async () => {
    if (stats.pending === 0) return;

    setIsLoading(true);
    try {
      const allGuests = await guestsApi.getGuests();
      // Only include guests with valid email addresses
      const pending = allGuests.filter(
        (guest) =>
          guest.rsvpStatus === "pending" && Boolean(guest.email?.trim()),
      );
      setPendingGuests(pending);
    } catch (error) {
      console.error("Error fetching pending guests:", error);
      toast({
        title: t("common.error"),
        description: t("dashboard.errors.failedToLoadGuests"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = useCallback(() => {
    setReminderDialogOpen(true);
  }, []);

  const handleReminderSent = useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);
      // Add a small delay to make the refresh animation visible
      setTimeout(() => {
        onRefresh();
        setRefreshing(false);
      }, 600);
    }
  }, [onRefresh]);

  const handleManualRefresh = useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);
      setTimeout(() => {
        onRefresh();
        setRefreshing(false);
      }, 600);
    }
  }, [onRefresh]);

  // Determine if the send reminder button should be disabled
  const isReminderButtonDisabled = useMemo(
    () => stats.pending === 0 || refreshing,
    [stats.pending, refreshing],
  );

  return (
    <Card className="bg-white border-green-100 relative">
      {onRefresh && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={handleManualRefresh}
                disabled={refreshing}
                aria-label={t("dashboard.refreshStats")}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("dashboard.refreshStats")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-2">
        <CardTitle className="flex items-center text-green-800 text-lg font-medium">
          <Users2 className="h-5 w-5 mr-2 text-green-600" />
          {t("dashboard.rsvp")}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <StatCard
            value={stats.attending}
            label={t("dashboard.attending")}
            color="text-green-600"
          />
          <StatCard
            value={stats.declined}
            label={t("dashboard.declined")}
            color="text-red-500"
          />
          <StatCard
            value={stats.pending}
            label={t("dashboard.pending")}
            color="text-amber-500"
          />
        </div>

        {/* Progress bar showing attending percentage */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
          <div
            className="bg-green-500 h-2.5 rounded-l-full transition-all duration-500 ease-in-out"
            style={{ width: `${percentages.attending || 0}%` }}
            role="progressbar"
            aria-valuenow={percentages.attending}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>
            {percentages.attending}% {t("dashboard.attending").toLowerCase()}
          </span>
          <span>
            {stats.total} {t("dashboard.guestList.total") || "total invites"}
          </span>
        </div>

        <div className="text-center mt-2">
          <Button
            variant="ghost"
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center mx-auto transition-all duration-200"
            onClick={handleSendReminder}
            disabled={isReminderButtonDisabled}
          >
            <Mail className="h-4 w-4 mr-1" />
            {t("dashboard.sendReminders")}
            <span className="font-semibold ml-1">{stats.pending}</span>{" "}
            {t("dashboard.pending").toLowerCase()}
          </Button>
        </div>

        <SendReminderDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          pendingCount={stats.pending}
          pendingGuests={pendingGuests}
          isLoading={isLoading}
          onReminderSent={handleReminderSent}
        />
      </CardContent>
    </Card>
  );
}
