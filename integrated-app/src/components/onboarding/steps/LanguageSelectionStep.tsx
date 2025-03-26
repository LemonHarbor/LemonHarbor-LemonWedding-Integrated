import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Globe } from "lucide-react";

interface LanguageSelectionStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function LanguageSelectionStep({
  formData,
  updateFormData,
}: LanguageSelectionStepProps) {
  const { language, setLanguage, languageNames } = useLanguage();

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as any);
    updateFormData({ preferredLanguage: lang });
  };

  return (
    <div className="text-center">
      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        <Globe className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-3xl font-serif font-semibold text-rose-800 mb-2">
        Choose Your Language
      </h2>
      <p className="text-gray-600 mb-8">
        Select your preferred language for the wedding planning experience
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        {Object.entries(languageNames).map(([code, name]) => (
          <Card
            key={code}
            className={`p-4 cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${
              formData.preferredLanguage === code ||
              (code === language && !formData.preferredLanguage)
                ? "border-2 border-rose-500"
                : "border border-rose-100"
            }`}
            onClick={() => handleLanguageSelect(code)}
          >
            <span className="font-medium">{name}</span>
            {(formData.preferredLanguage === code ||
              (code === language && !formData.preferredLanguage)) && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 p-0 text-rose-500"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </Card>
        ))}
      </div>

      <p className="text-sm text-gray-500 italic">
        You can change your language preference anytime in settings
      </p>
    </div>
  );
}
