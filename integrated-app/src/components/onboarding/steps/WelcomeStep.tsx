import { CalendarHeart, Users2, SquareMenu, Wallet, Globe } from "lucide-react";

interface WelcomeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function WelcomeStep({
  formData,
  updateFormData,
}: WelcomeStepProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-serif font-semibold text-rose-800 mb-2">
        Welcome to LemonHarbor
      </h2>
      <p className="text-gray-600 mb-8">
        Let's set up your wedding planning dashboard in just a few steps
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-800">Language</h3>
          <p className="text-sm text-gray-500">
            Choose your preferred language
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center">
          <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
            <CalendarHeart className="h-6 w-6 text-rose-600" />
          </div>
          <h3 className="font-medium text-gray-800">Wedding Details</h3>
          <p className="text-sm text-gray-500">Set your date and venue</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Users2 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-800">Guest Management</h3>
          <p className="text-sm text-gray-500">Add your initial guest list</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <SquareMenu className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-800">Table Planning</h3>
          <p className="text-sm text-gray-500">Arrange your seating plan</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <Wallet className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-800">Budget Tracking</h3>
          <p className="text-sm text-gray-500">Manage your wedding budget</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 italic">
        This will only take a few minutes to complete
      </p>
    </div>
  );
}
