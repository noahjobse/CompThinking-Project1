"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import PageShell from "@/components/ui/PageShell";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const router = useRouter();
    const lastDashboardPath = useRef<string | null>(null);
    const cameFromMenu = useRef(false);

  useEffect(() => {
    const currentPath = window.location.pathname;

    // Store last dashboard path
    if (currentPath.startsWith("/dashboard")) {
      lastDashboardPath.current = currentPath;
    }

    const handlePopState = () => {
      const path = window.location.pathname;

      if (path.startsWith("/dashboard")) {
        // Back from a dashboard page --> go to menu
        cameFromMenu.current = true;
        router.back();
      } else if (path === "/menu" && cameFromMenu.current && lastDashboardPath.current) {
        // Forward from /menu --> go to dashboard page
        cameFromMenu.current = false;
        router.push(lastDashboardPath.current);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

    return (
        <div className="flex flex-col h-screen">
            <Header/>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar/>
                <PageShell>{children}</PageShell>
            </div>
            
        </div>
    );
}

