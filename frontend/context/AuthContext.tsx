"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE } from "@/lib/api";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // -----------------------
  // Revalidate existing session
  // -----------------------
  const revalidateSession = async () => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (!savedSession) {
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(savedSession);

      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const json = await response.json();
      const users: BackendUser[] = json.data; // backend returns {status, data:[…]}

      const userExists = users.some(
        (u) => u.username === session.username && u.role === session.role
      );

      if (userExists) {
        setUser(session);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        if (pathname !== "/login") router.push("/login");
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      if (pathname !== "/login") router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------
  // Login
  // -----------------------
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();
      if (!response.ok || json.status !== "success") {
        throw new Error(json.detail || "Invalid username or password");
      }

      const { username: name, role } = json.data;
      const userData: User = { username: name, role };

      // Save locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      // Redirect to menu
      router.push("/menu");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // -----------------------
  // Logout
  // -----------------------
  const logout = async () => {
    try {
      if (user) {
        await fetch(`${API_BASE}/api/users/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
      }

      localStorage.clear();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      setUser(null);
      router.push("/login");
    }
  };

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

// -----------------------
// Hook
// -----------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
