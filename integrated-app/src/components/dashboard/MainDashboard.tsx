import React, { useState, useEffect, useCallback, useMemo } from "react";
import WeddingCountdown from "./WeddingCountdown";
import ProgressIndicator from "./ProgressIndicator";
import RsvpStats from "./RsvpStats";
import UpcomingTasks from "./UpcomingTasks";
import DashboardAnalytics from "./DashboardAnalytics";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/use-toast";
import { guestsApi, RsvpStats as RsvpStatsType } from "@/lib/api";

interface MainDashboardProps {
  weddingDate?: Date;
  coupleName?: string;
}

// Default RSVP stats
const DEFAULT_RSVP_STATS: RsvpStatsType = {
  attending: 0,
  declined: 0,
  pending: 0,
  total: 0,
};

// Minimum loading time to prevent flickering
const MIN_LOADING_TIME = 300; // ms

// Refresh animation duration
const REFRESH_ANIMATION_DURATION = 600; // ms

/**
 * MainDashboard component displays the main wedding planning dashboard
 * with various widgets and statistics.
 */
const MainDashboard = ({
  weddingDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
  coupleName = "Emma & Noah",
}: MainDashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rsvpStats, setRsvpStats] = useState<RsvpStatsType>(DEFAULT_RSVP_STATS);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const loadingStartTime = Date.now();

    try {
      // Fetch RSVP stats
      const stats = await guestsApi.getRsvpStats();
      setRsvpStats(stats);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: t("common.error"),
        description: t("dashboard.errors.failedToLoadData"),
        variant: "destructive",
      });
    } finally {
      // Ensure minimum loading time to prevent flickering
      const timeElapsed = Date.now() - loadingStartTime;
      const remainingDelay = Math.max(0, MIN_LOADING_TIME - timeElapsed);

      setTimeout(() => {
        setLoading(false);
      }, remainingDelay);
    }
  }, [t, toast]);

  // Format the last refresh time
  const formattedLastRefresh = useMemo(() => {
    return lastRefresh.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastRefresh]);

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    toast({
      title: t("dashboard.refreshing"),
      description: t("dashboard.refreshingDescription"),
    });
  }, [fetchDashboardData, t, toast]);

  // Handle refresh after reminder sent
  const handleAfterReminderSent = useCallback(() => {
    let refreshTimer: NodeJS.Timeout;
    setLoading(true);

    // Add a delay to make the refresh animation visible
    refreshTimer = setTimeout(() => {
      fetchDashboardData();
    }, REFRESH_ANIMATION_DURATION);

    // Cleanup timer if component unmounts
    return () => clearTimeout(refreshTimer);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {t("dashboard.overview")}
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 hidden sm:inline-block">
            {t("dashboard.lastUpdated")}: {formattedLastRefresh}
          </span>
          <Button
            onClick={handleRefresh}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? t("common.loading") : t("dashboard.refresh")}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          loading ? "opacity-50 pointer-events-none" : "opacity-100",
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <WeddingCountdown weddingDate={weddingDate} />
          <RsvpStats stats={rsvpStats} onRefresh={handleAfterReminderSent} />
          <ProgressIndicator />
        </div>

        <div className="mb-8">
          <DashboardAnalytics />
        </div>

        <div className="mb-8">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
