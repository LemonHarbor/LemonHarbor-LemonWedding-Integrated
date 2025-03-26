import { useState } from "react";
import { useDevModeStore } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { DevModePanel } from "@/components/DevModePanel";
import { Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/useTranslation";

export function DevModeToggle() {
  const { t } = useTranslation();
  const { enabled } = useDevModeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (
    import.meta.env.MODE !== "development" &&
    !import.meta.env.VITE_FORCE_DEV_TOOLS
  ) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 shadow-md ${enabled ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-gray-100"}`}
          title={t("Developer Mode")}
        >
          <Wrench
            className={`h-5 w-5 ${enabled ? "text-blue-600" : "text-gray-600"}`}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
        <DevModePanel onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
