"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // If no user session, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If allowedRoles is specified and user's role is not in the list
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.push("/menu");
      return;
    }
  }, [user, role, isLoading, allowedRoles, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If role check fails, don't render children (will redirect)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
