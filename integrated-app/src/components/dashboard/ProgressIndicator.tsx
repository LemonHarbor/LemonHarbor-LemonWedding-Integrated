import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface ProgressIndicatorProps {
  progress?: number;
  tasks?: {
    title: string;
    completed: boolean;
  }[];
}

export default function ProgressIndicator({
  progress = 65,
  tasks = [
    { title: "Send invitations", completed: true },
    { title: "Book venue", completed: true },
    { title: "Order flowers", completed: true },
    { title: "Arrange catering", completed: false },
    { title: "Book photographer", completed: false },
  ],
}: ProgressIndicatorProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-white border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
        <CardTitle className="text-blue-800 text-lg font-medium">
          {t("dashboard.progress")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Overall progress</span>
            <span className="text-sm font-medium text-blue-600">
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-blue-100"
            indicatorClassName="bg-blue-500"
          />
        </div>

        <div className="space-y-3 mt-4">
          <h4 className="text-sm font-medium text-gray-700">
            {t("dashboard.tasks")}
          </h4>
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center">
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <CircleDashed className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${task.completed ? "text-gray-500 line-through" : "text-gray-700"}`}
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
