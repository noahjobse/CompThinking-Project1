"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE } from "@/lib/api";

// Define types
type Role = "Admin" | "Editor" | "Viewer";

interface User {
  username: string;
  role: Role;
}

interface BackendUser {
  id: number;
  username: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  revalidateSession: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEY = "auth_session";

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Revalidate session with backend
  const revalidateSession = async () => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      
      if (!savedSession) {
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(savedSession);
      
      // Verify user still exists in backend
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const users: BackendUser[] = await response.json();
      const userExists = users.some(
        (u) => u.username === session.username && u.role === session.role
      );

      if (userExists) {
        setUser(session);
      } else {
        // User no longer exists or role changed, clear session
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        
        // Redirect to login if not already there
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      
      // Redirect to login if not already there
      if (pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();
      const userData: User = {
        username: data.username,
        role: data.role,
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      // Log activity
      await fetch(`${API_BASE}/api/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userData.username,
          action: "logged in",
        }),
      });

      // Redirect to menu
      router.push("/menu");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Log activity before clearing session
      if (user) {
        await fetch(`${API_BASE}/api/activity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.username,
            action: "logged out",
          }),
        });
      }

      // Clear all localStorage data
      localStorage.clear();
      setUser(null);

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local data even if backend logging fails
      localStorage.clear();
      setUser(null);
      router.push("/login");
    }
  };

  // Validate session on mount
  useEffect(() => {
    revalidateSession();
  }, []);

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isLoading,
    login,
    logout,
    revalidateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
