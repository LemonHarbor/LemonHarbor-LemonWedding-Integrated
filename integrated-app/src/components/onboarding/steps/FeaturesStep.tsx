import {
  CalendarHeart,
  Users2,
  SquareMenu,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FeaturesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}

export default function FeaturesStep({
  formData,
  updateFormData,
}: FeaturesStepProps) {
  const features: FeatureItem[] = [
    {
      id: "weddingCountdown",
      title: "Wedding Countdown",
      description:
        "Keep track of days, hours, and minutes until your special day with a beautiful countdown timer.",
      icon: <CalendarHeart className="h-5 w-5 text-rose-600" />,
      color: "text-rose-600",
      borderColor: "border-rose-100",
      bgColor: "bg-rose-100",
    },
    {
      id: "guestManagement",
      title: "Guest Management",
      description:
        "Easily manage your guest list, track RSVPs, and handle dietary restrictions. Import and export your guest list as needed.",
      icon: <Users2 className="h-5 w-5 text-blue-600" />,
      color: "text-blue-600",
      borderColor: "border-blue-100",
      bgColor: "bg-blue-100",
    },
    {
      id: "tablePlanning",
      title: "Table Planning",
      description:
        "Interactive table planner with drag-and-drop functionality and AI-assisted seating arrangements based on guest relationships.",
      icon: <SquareMenu className="h-5 w-5 text-green-600" />,
      color: "text-green-600",
      borderColor: "border-green-100",
      bgColor: "bg-green-100",
    },
    {
      id: "budgetTracking",
      title: "Budget Tracking",
      description:
        "Smart budget tools with visual breakdowns of planned vs. actual expenses. Create categories and track all your wedding costs.",
      icon: <Wallet className="h-5 w-5 text-purple-600" />,
      color: "text-purple-600",
      borderColor: "border-purple-100",
      bgColor: "bg-purple-100",
    },
    {
      id: "taskManagement",
      title: "Task Management",
      description:
        "Keep track of all your wedding planning tasks with due dates, priorities, and completion status.",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      color: "text-amber-600",
      borderColor: "border-amber-100",
      bgColor: "bg-amber-100",
    },
    {
      id: "progressTracking",
      title: "Progress Tracking",
      description:
        "Monitor your overall wedding planning progress and see what tasks still need to be completed.",
      icon: <CheckCircle2 className="h-5 w-5 text-teal-600" />,
      color: "text-teal-600",
      borderColor: "border-teal-100",
      bgColor: "bg-teal-100",
    },
  ];

  const handleFeatureToggle = (featureId: string, isChecked: boolean) => {
    const updatedFeatures = {
      ...formData.selectedFeatures,
      [featureId]: isChecked,
    };
    updateFormData({ ...formData, selectedFeatures: updatedFeatures });
  };

  // Initialize selectedFeatures if it doesn't exist
  if (!formData.selectedFeatures) {
    const initialFeatures = features.reduce((acc, feature) => {
      acc[feature.id] = true; // All features enabled by default
      return acc;
    }, {});
    updateFormData({ ...formData, selectedFeatures: initialFeatures });
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-serif font-semibold text-rose-800 mb-2 text-center">
        Discover Key Features
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Here's what you can do with your wedding planning dashboard
      </p>

      <div className="space-y-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`bg-white p-4 rounded-xl shadow-sm border ${feature.borderColor} flex items-start gap-4 transition-all duration-200 hover:shadow-md`}
          >
            <div
              className={`h-10 w-10 ${feature.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {feature.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800 mb-1">
                  {feature.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={formData.selectedFeatures?.[feature.id] ?? true}
                    onCheckedChange={(checked) =>
                      handleFeatureToggle(feature.id, checked as boolean)
                    }
                    className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                  />
                  <Label
                    htmlFor={`feature-${feature.id}`}
                    className="text-sm text-gray-600"
                  >
                    Enable
                  </Label>
                </div>
              </div>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          You can always change these preferences later in your dashboard
          settings.
        </p>
      </div>
    </div>
  );
}
