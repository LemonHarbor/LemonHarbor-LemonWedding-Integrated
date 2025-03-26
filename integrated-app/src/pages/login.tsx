import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import GuestAccessForm from "@/components/auth/GuestAccessForm";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/lib/language";
import { DeveloperToggle } from "@/components/ui/developer-toggle";
import { DeveloperPanel } from "@/components/ui/developer-panel";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, guestAccess } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLoginSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await register(
        values.email,
        values.password,
        `${values.firstName} ${values.lastName}`,
        values.role || "couple",
      );
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccessSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await guestAccess(values.accessCode);
      navigate("/");
    } catch (error) {
      console.error("Guest access error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would trigger a password reset flow
    console.log("Forgot password clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("app.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("app.description")}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-0">
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                <TabsTrigger value="guest">{t("auth.guestAccess")}</TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="login">
                  <LoginForm
                    onSubmit={handleLoginSubmit}
                    onForgotPassword={handleForgotPassword}
                    onRegister={() => setActiveTab("register")}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm
                    onSubmit={handleRegisterSubmit}
                    isLoading={isLoading}
                    onLogin={() => setActiveTab("login")}
                  />
                </TabsContent>
                <TabsContent value="guest">
                  <GuestAccessForm
                    onSubmit={handleGuestAccessSubmit}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t("auth.termsText")}{" "}
            <Link
              to="/terms"
              className="font-medium text-primary hover:underline"
            >
              {t("auth.termsLink")}
            </Link>{" "}
            {t("auth.andText")}{" "}
            <Link
              to="/privacy"
              className="font-medium text-primary hover:underline"
            >
              {t("auth.privacyLink")}
            </Link>
          </p>
        </div>

        <div className="fixed bottom-4 right-4">
          <DeveloperToggle />
        </div>
      </div>
      <DeveloperPanel />
    </div>
  );
};

export default LoginPage;
