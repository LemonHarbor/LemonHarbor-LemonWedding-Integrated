import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import WelcomeStep from "./steps/WelcomeStep";
import LanguageSelectionStep from "./steps/LanguageSelectionStep";
import WeddingDetailsStep from "./steps/WeddingDetailsStep";
import GuestStep from "./steps/GuestStep";
import FeaturesStep from "./steps/FeaturesStep";
import CompletionStep from "./steps/CompletionStep";

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    partnerName: "",
    weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    venue: "",
    venueAddress: "",
    initialGuests: [],
    preferredLanguage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { name: "Welcome", component: WelcomeStep },
    { name: "Language", component: LanguageSelectionStep },
    { name: "Wedding Details", component: WeddingDetailsStep },
    { name: "Add Guests", component: GuestStep },
    { name: "Key Features", component: FeaturesStep },
    { name: "Complete", component: CompletionStep },
  ];

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update user profile with wedding details
      const { error: profileError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          partner_name: formData.partnerName,
          wedding_date: formData.weddingDate.toISOString(),
          venue: formData.venue,
          venue_address: formData.venueAddress,
          preferred_language: formData.preferredLanguage,
          onboarding_completed: true,
        },
      });

      if (profileError) throw profileError;

      // Add initial guests if any
      if (formData.initialGuests.length > 0) {
        const { error: guestsError } = await supabase.from("guests").insert(
          formData.initialGuests.map((guest) => ({
            user_id: user.id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone || "",
            rsvp_status: "pending",
          })),
        );

        if (guestsError) throw guestsError;
      }

      toast({
        title: "Onboarding complete!",
        description: "Your wedding dashboard is ready to use.",
      });

      // Redirect to dashboard
      navigate("/wedding-dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-3xl shadow-lg border-rose-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{steps[currentStep].name}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
          />

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>Continue</Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isSubmitting ? "Saving..." : "Start Planning"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
