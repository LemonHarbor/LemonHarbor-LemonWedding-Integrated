import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import GuestAccessForm from "@/components/auth/GuestAccessForm";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLoginSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
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
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccessSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // In a real app, this would validate the access code and log in the guest
      console.log("Guest access submitted:", values);
      // Simulate guest login with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Guest access error:", error);
    } finally {
      setIsLoading(false);
    }
    return Promise.resolve();
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // In a real app, this would trigger a password reset flow
  };

  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Wedding Planner</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Plan your perfect wedding day with our comprehensive tools
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
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="guest">Guest Access</TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="login">
                  <LoginForm
                    onSubmit={handleLoginSubmit}
                    onForgotPassword={handleForgotPassword}
                    onRegister={() => setActiveTab("register")}
                  />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm
                    onSubmit={handleRegisterSubmit}
                    isLoading={isLoading}
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
            By using this service, you agree to our{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
