import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GuestAccessForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ accessCode: string }>();

  const onSubmit = async (data: { accessCode: string }) => {
    setIsLoading(true);
    try {
      // Verify access code with Supabase
      const { error } = await supabase
        .from('guest_access_codes')
        .select('*')
        .eq('code', data.accessCode)
        .single();

      if (error) throw error;

      // Redirect to guest portal
      window.location.href = `/guest/${data.accessCode}`;
    } catch (error) {
      toast({
        title: t("auth.invalidAccessCode"),
        description: t("auth.checkInvitation"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="accessCode">{t("auth.accessCode")}</Label>
        <Input
          id="accessCode"
          type="text"
          {...register("accessCode", { required: true })}
          placeholder="ABC-123-XYZ"
        />
        {errors.accessCode && (
          <p className="text-sm text-red-500 mt-1">
            {t("auth.accessCodeRequired")}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t("auth.verifying") : t("auth.accessInvitation")}
      </Button>
    </form>
  );
}
