import { CheckCircle } from "lucide-react";

interface CompletionStepProps {
  formData: {
    fullName: string;
    partnerName: string;
    weddingDate: Date;
  };
  updateFormData: (data: any) => void;
}

export default function CompletionStep({ formData }: CompletionStepProps) {
  const weddingDateFormatted = formData.weddingDate.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const coupleName =
    formData.fullName && formData.partnerName
      ? `${formData.fullName} & ${formData.partnerName}`
      : "Your Wedding";

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <h2 className="text-3xl font-serif font-semibold text-rose-800 mb-2">
        You're All Set!
      </h2>

      <p className="text-gray-600 mb-6">
        Your wedding dashboard is ready to use
      </p>

      <div className="bg-rose-50 p-6 rounded-xl mb-6 max-w-md mx-auto">
        <h3 className="font-medium text-rose-800 text-xl mb-2">{coupleName}</h3>
        <p className="text-rose-600">{weddingDateFormatted}</p>
      </div>

      <div className="text-sm text-gray-500 space-y-2">
        <p>You can now:</p>
        <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
          <li>Add more guests to your list</li>
          <li>Create your seating plan</li>
          <li>Set up your wedding budget</li>
          <li>Track your planning tasks</li>
          <li>Monitor RSVPs from your guests</li>
        </ul>
      </div>
    </div>
  );
}
