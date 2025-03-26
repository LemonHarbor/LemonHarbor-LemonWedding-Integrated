import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarHeart } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface CountdownProps {
  weddingDate?: Date;
}

export default function WeddingCountdown({
  weddingDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
}: CountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = weddingDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Wedding day has passed
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <Card className="bg-white border-rose-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100 pb-2">
        <CardTitle className="flex items-center text-rose-800 text-lg font-medium">
          <CalendarHeart className="h-5 w-5 mr-2 text-rose-600" />
          {t("dashboard.countdown")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-rose-600">
              {timeLeft.days}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t("dashboard.days")}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-rose-600">
              {timeLeft.hours}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t("dashboard.hours")}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-rose-600">
              {timeLeft.minutes}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t("dashboard.minutes")}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-rose-600">
              {timeLeft.seconds}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t("dashboard.seconds")}
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          {timeLeft.days > 0 ? (
            <p>Your special day is approaching!</p>
          ) : (
            <p>Today is your wedding day! Congratulations!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
