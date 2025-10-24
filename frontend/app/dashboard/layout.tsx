"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import PageShell from "@/components/ui/PageShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const router = useRouter();

    //Go back to /menu instead of nested dashboard pages
    useEffect(() => {
        const handleBackFromDashboard = () => {
            if (window.location.pathname.startsWith("/dashboard")) {
                router.back(); 
            }
        };

        window.addEventListener("popstate", handleBackFromDashboard);
        return () => window.removeEventListener("popstate", handleBackFromDashboard);
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

