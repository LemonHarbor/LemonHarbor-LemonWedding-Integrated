import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeddingDetailsStepProps {
  formData: {
    fullName: string;
    partnerName: string;
    weddingDate: Date;
    venue: string;
    venueAddress: string;
    guestCount?: number;
    ceremonyTime?: string;
    additionalNotes?: string;
    weddingStyle?: string;
  };
  updateFormData: (data: Partial<WeddingDetailsStepProps["formData"]>) => void;
}

export default function WeddingDetailsStep({
  formData,
  updateFormData,
}: WeddingDetailsStepProps) {
  const [date, setDate] = useState<Date | undefined>(formData.weddingDate);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      updateFormData({ weddingDate: newDate });
    }
  };

  const weddingStyles = [
    "Traditional",
    "Modern",
    "Rustic",
    "Beach",
    "Garden",
    "Destination",
    "Vintage",
    "Bohemian",
    "Minimalist",
    "Luxury",
    "Other",
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-serif font-semibold text-rose-800 mb-2 text-center">
        Tell Us About Your Wedding
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Let's start with the basic details of your special day
      </p>

      <div className="space-y-6">
        {/* Couple Information */}
        <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
          <h3 className="text-lg font-medium text-rose-700 mb-3 flex items-center">
            <Users className="mr-2 h-5 w-5" /> Couple Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Your Name</Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
                className="border-rose-200 focus:border-rose-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerName">Partner's Name</Label>
              <Input
                id="partnerName"
                placeholder="Your partner's full name"
                value={formData.partnerName}
                onChange={(e) =>
                  updateFormData({ partnerName: e.target.value })
                }
                className="border-rose-200 focus:border-rose-300"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center">
            <Clock className="mr-2 h-5 w-5" /> Date and Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wedding Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-blue-200",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceremonyTime">Ceremony Time</Label>
              <Input
                id="ceremonyTime"
                type="time"
                value={formData.ceremonyTime || ""}
                onChange={(e) =>
                  updateFormData({ ceremonyTime: e.target.value })
                }
                className="border-blue-200 focus:border-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-lg font-medium text-green-700 mb-3 flex items-center">
            <MapPin className="mr-2 h-5 w-5" /> Venue Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name</Label>
              <Input
                id="venue"
                placeholder="Where will your wedding take place?"
                value={formData.venue}
                onChange={(e) => updateFormData({ venue: e.target.value })}
                className="border-green-200 focus:border-green-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueAddress">Venue Address</Label>
              <Textarea
                id="venueAddress"
                placeholder="Full address of your venue"
                value={formData.venueAddress}
                onChange={(e) =>
                  updateFormData({ venueAddress: e.target.value })
                }
                className="border-green-200 focus:border-green-300"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-lg font-medium text-purple-700 mb-3">
            Additional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestCount">Estimated Guest Count</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="How many guests do you expect?"
                value={formData.guestCount || ""}
                onChange={(e) =>
                  updateFormData({
                    guestCount: parseInt(e.target.value) || undefined,
                  })
                }
                min={0}
                className="border-purple-200 focus:border-purple-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weddingStyle">Wedding Style</Label>
              <Select
                value={formData.weddingStyle || ""}
                onValueChange={(value) =>
                  updateFormData({ weddingStyle: value })
                }
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-300">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {weddingStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any other details you'd like to share about your wedding?"
              value={formData.additionalNotes || ""}
              onChange={(e) =>
                updateFormData({ additionalNotes: e.target.value })
              }
              className="border-purple-200 focus:border-purple-300"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
