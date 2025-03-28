import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useAuth } from "@/context/AuthContext";

export function DeveloperPanel() {
  const { loginAsAdmin, loginAsGuest } = useAuth();
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [guestEmail, setGuestEmail] = useState("guest@example.com");

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="space-y-2">
        <Label>Admin Login</Label>
        <Input 
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Admin email"
        />
        <Button 
          onClick={() => loginAsAdmin(adminEmail)}
          className="w-full"
        >
          Login as Admin
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Guest Login</Label>
        <Input 
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Guest email"
        />
        <Button 
          onClick={() => loginAsGuest(guestEmail)}
          className="w-full"
        >
          Login as Guest
        </Button>
      </div>
    </div>
  );
}
