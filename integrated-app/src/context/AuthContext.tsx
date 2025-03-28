import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export type UserRole =
  | "couple"
  | "bestMan"
  | "maidOfHonor"
  | "guest"
  | "developer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[];
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
}

export interface Permissions {
  canViewGuests: boolean;
  canEditGuests: boolean;
  canDeleteGuests: boolean;
  canViewTables: boolean;
  canEditTables: boolean;
  canDeleteTables: boolean;
  canManagePermissions: boolean;
  canSendInvites: boolean;
  canExportData: boolean;
  canViewGuestArea?: boolean;
  canAccessAllAreas?: boolean;
  canSwitchRoles?: boolean;
  canViewAllData?: boolean;
}

// Role-based permissions
export const rolePermissions: Record<UserRole, Permissions> = {
  couple: {
    canViewGuests: true,
    canEditGuests: true,
    canDeleteGuests: true,
    canViewTables: true,
    canEditTables: true,
    canDeleteTables: true,
    canManagePermissions: true,
    canSendInvites: true,
    canExportData: true,
  },
  bestMan: {
    canViewGuests: true,
    canEditGuests: true,
    canDeleteGuests: false,
    canViewTables: true,
    canEditTables: true,
    canDeleteTables: false,
    canManagePermissions: false,
    canSendInvites: true,
    canExportData: false,
  },
  maidOfHonor: {
    canViewGuests: true,
    canEditGuests: true,
    canDeleteGuests: false,
    canViewTables: true,
    canEditTables: true,
    canDeleteTables: false,
    canManagePermissions: false,
    canSendInvites: true,
    canExportData: false,
  },
  guest: {
    canViewGuests: false,
    canEditGuests: false,
    canDeleteGuests: false,
    canViewTables: true,
    canEditTables: false,
    canDeleteTables: false,
    canManagePermissions: false,
    canSendInvites: false,
    canExportData: false,
    canViewGuestArea: true,
  },
  developer: {
    canViewGuests: true,
    canEditGuests: true,
    canDeleteGuests: true,
    canViewTables: true,
    canEditTables: true,
    canDeleteTables: true,
    canManagePermissions: true,
    canSendInvites: true,
    canExportData: true,
    canViewGuestArea: true,
    canAccessAllAreas: true,
    canSwitchRoles: true,
    canViewAllData: true,
  },
};

interface AuthContextType {
  user: User | null;
  permissions: Permissions;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  guestAccess: (accessCode: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  loginAsAdmin: (email: string) => Promise<void>;
  loginAsGuest: (email: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: rolePermissions.guest,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  guestAccess: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Get default permissions for guests
  const [permissions, setPermissions] = useState<Permissions>(
    rolePermissions.guest,
  );

  // Check for saved role in localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedPermissions = localStorage.getItem("userPermissions");
    const savedGuestId = localStorage.getItem("guestId");

    if (user && savedRole) {
      // Update user with saved role if it exists
      const updatedUser = { ...user, role: savedRole as UserRole };

      // Add guest info if applicable
      if (savedRole === "guest" && savedGuestId) {
        updatedUser.guestId = savedGuestId;
      }

      // Update permissions
      if (savedPermissions) {
        try {
          const parsedPermissions = JSON.parse(savedPermissions);
          updatedUser.permissions = parsedPermissions;
        } catch (e) {
          console.error("Error parsing saved permissions", e);
        }
      }

      setUser(updatedUser);

      // Set permissions based on role or saved permissions
      if (savedRole === "developer" && savedPermissions) {
        try {
          const parsedPermissions = JSON.parse(savedPermissions);
          const fullPermissions = { ...rolePermissions.developer };
          parsedPermissions.forEach((perm: string) => {
            if (perm in fullPermissions) {
              fullPermissions[perm as keyof Permissions] = true;
            }
          });
          setPermissions(fullPermissions);
        } catch (e) {
          console.error("Error parsing saved permissions", e);
          setPermissions(rolePermissions[updatedUser.role]);
        }
      } else {
        setPermissions(rolePermissions[updatedUser.role]);
      }
    }
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch user profile from the database
          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          const userData: User = {
            id: user.id,
            email: user.email!,
            name: profileData.name,
            role: profileData.role as UserRole,
            avatar: profileData.avatar_url,
          };

          setUser(userData);
          setPermissions(rolePermissions[userData.role]);
        } else {
          setUser(null);
          setPermissions(rolePermissions.guest);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile from the database
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      const userData: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profileData.name,
        role: profileData.role as UserRole,
        avatar: profileData.avatar_url,
      };

      setUser(userData);
      setPermissions(rolePermissions[userData.role]);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: (err as Error).message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create a profile in the users table
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user?.id,
            email,
            name,
            role,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, "")}`,
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      const userData: User = {
        id: data.user!.id,
        email,
        name,
        role,
        avatar: profileData.avatar_url,
      };

      setUser(userData);
      setPermissions(rolePermissions[userData.role]);

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: (err as Error).message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const guestAccess = async (accessCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // For testing purposes, accept any code
      // Create a guest user without authentication
      const guestUser: User = {
        id: "guest-" + Math.random().toString(36).substring(2, 9),
        email: "guest@example.com",
        name: "Guest User",
        role: "couple", // Give full permissions for testing
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
      };

      setUser(guestUser);
      setPermissions(rolePermissions.couple); // Full permissions for testing

      toast({
        title: "Guest access granted",
        description: "Welcome to the wedding planner!",
      });
    } catch (err) {
      console.error("Guest access error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Access denied",
        description: (err as Error).message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setPermissions(rolePermissions.guest);

      // Clear role and permissions from localStorage
      localStorage.removeItem("userRole");
      localStorage.removeItem("userPermissions");
      localStorage.removeItem("guestId");

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err) {
      console.error("Logout error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create admin user without authentication (for development only)
      const adminUser: User = {
        id: "admin-" + Math.random().toString(36).substring(2, 9),
        email,
        name: "Admin User",
        role: "developer",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
      };

      setUser(adminUser);
      setPermissions(rolePermissions.developer);

      toast({
        title: "Admin login successful",
        description: "Welcome back, Admin!",
      });
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Admin login failed",
        description: (err as Error).message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create guest user without authentication
      const guestUser: User = {
        id: "guest-" + Math.random().toString(36).substring(2, 9),
        email,
        name: "Guest User",
        role: "guest",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
      };

      setUser(guestUser);
      setPermissions(rolePermissions.guest);

      toast({
        title: "Guest login successful",
        description: "Welcome to the wedding planner!",
      });
    } catch (err) {
      console.error("Guest login error:", err);
      setError(err as Error);
      toast({
        variant: "destructive",
        title: "Guest login failed",
        description: (err as Error).message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        error,
        login,
        register,
        guestAccess,
        logout,
        isAuthenticated: !!user,
        setUser,
        loginAsAdmin,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
