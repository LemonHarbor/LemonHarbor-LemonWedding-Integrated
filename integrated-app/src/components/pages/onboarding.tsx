import OnboardingFlow from "../onboarding/OnboardingFlow";
import { useAuth } from "../../../supabase/auth";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-spinner";

export default function OnboardingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Loading..." />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user has already completed onboarding, redirect to dashboard
  if (user.user_metadata?.onboarding_completed) {
    return <Navigate to="/wedding-dashboard" />;
  }

  return <OnboardingFlow />;
}
