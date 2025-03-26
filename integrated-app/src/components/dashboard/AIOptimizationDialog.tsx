import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Wand2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { optimizeSeating, OptimizationParams } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";

interface AIOptimizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptimizationComplete: () => void;
}

const AIOptimizationDialog = ({
  open,
  onOpenChange,
  onOptimizationComplete,
}: AIOptimizationDialogProps) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationParams, setOptimizationParams] =
    useState<OptimizationParams>({
      prioritizeFamilies: true,
      avoidConflicts: true,
      balanceTables: true,
      respectDietaryRestrictions: true,
      keepCouplesAndFamiliesTogether: true,
    });

  const handleToggleParam = (param: keyof OptimizationParams) => {
    setOptimizationParams((prev) => ({
      ...prev,
      [param]: !prev[param],
    }));
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    try {
      // Call the optimization service
      const result = await optimizeSeating(optimizationParams);

      // Clear the interval and set progress to 100%
      clearInterval(progressInterval);
      setProgress(100);

      // Wait a moment to show 100% before closing
      setTimeout(() => {
        setIsOptimizing(false);
        onOpenChange(false);

        if (result.success) {
          toast({
            title: "Seating Optimized",
            description: `Successfully optimized seating for ${result.seatAssignments.length} guests.`,
          });
          onOptimizationComplete();
        } else {
          toast({
            variant: "destructive",
            title: "Optimization Failed",
            description: result.message,
          });
        }
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsOptimizing(false);

      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Seating Optimization
          </DialogTitle>
          <DialogDescription>
            Let AI help you create the optimal seating arrangement based on
            guest relationships and preferences.
          </DialogDescription>
        </DialogHeader>

        {isOptimizing ? (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Optimizing Seating Arrangement
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI is analyzing guest relationships and preferences to
                create the best possible seating arrangement.
              </p>
            </div>
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-sm text-center text-muted-foreground">
              {progress < 100 ? "Processing..." : "Optimization complete!"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                  Our AI analyzes guest relationships, categories, and
                  preferences to create an optimal seating arrangement. Select
                  your preferences below.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="prioritize-families">
                      Prioritize Families
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Keep family members seated together when possible
                    </p>
                  </div>
                  <Switch
                    id="prioritize-families"
                    checked={optimizationParams.prioritizeFamilies}
                    onCheckedChange={() =>
                      handleToggleParam("prioritizeFamilies")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="avoid-conflicts">Avoid Conflicts</Label>
                    <p className="text-sm text-muted-foreground">
                      Separate guests who might not get along well
                    </p>
                  </div>
                  <Switch
                    id="avoid-conflicts"
                    checked={optimizationParams.avoidConflicts}
                    onCheckedChange={() => handleToggleParam("avoidConflicts")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="balance-tables">Balance Tables</Label>
                    <p className="text-sm text-muted-foreground">
                      Distribute guests evenly across tables
                    </p>
                  </div>
                  <Switch
                    id="balance-tables"
                    checked={optimizationParams.balanceTables}
                    onCheckedChange={() => handleToggleParam("balanceTables")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dietary-restrictions">
                      Consider Dietary Restrictions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Group guests with similar dietary needs
                    </p>
                  </div>
                  <Switch
                    id="dietary-restrictions"
                    checked={optimizationParams.respectDietaryRestrictions}
                    onCheckedChange={() =>
                      handleToggleParam("respectDietaryRestrictions")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="keep-couples">Keep Couples Together</Label>
                    <p className="text-sm text-muted-foreground">
                      Ensure couples and families sit at the same table
                    </p>
                  </div>
                  <Switch
                    id="keep-couples"
                    checked={optimizationParams.keepCouplesAndFamiliesTogether}
                    onCheckedChange={() =>
                      handleToggleParam("keepCouplesAndFamiliesTogether")
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleOptimize}>
                <Wand2 className="mr-2 h-4 w-4" />
                Optimize Seating
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIOptimizationDialog;
