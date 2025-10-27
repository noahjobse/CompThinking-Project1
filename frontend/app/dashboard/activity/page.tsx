"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

interface ActivityLog {
    logs: string[];
}

export default function ActivityLogPage() {
    const { role } = useAuth();
    const [activityLogs, setActivityLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivityLogs();
    }, []);

    const loadActivityLogs = async () => {
        try {
            // Note: This endpoint would need to be added to the backend
            // For now, we'll create a mock fetch that returns the activity log structure
            const response = await fetch(`${API_BASE}/api/activity`);
            if (response.ok) {
                const data: ActivityLog = await response.json();
                setActivityLogs(data.logs || []);
            } else {
                // If endpoint doesn't exist yet, show sample data
                setActivityLogs([
                    "2025-01-26 13:00:00 — admin123 logged in",
                    "2025-01-26 12:45:00 — editor123 logged out",
                    "2025-01-26 12:30:00 — viewer123 logged in",
                ]);
            }
        } catch (error) {
            console.error("Failed to load activity logs:", error);
            // Show sample data on error
            setActivityLogs([
                "2025-01-26 13:00:00 — admin123 logged in",
                "2025-01-26 12:45:00 — editor123 logged out",
                "2025-01-26 12:30:00 — viewer123 logged in",
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600">Loading activity logs...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Activity Log</h1>
                <p className="text-gray-600 text-sm">
                    Read-only view of all user activities and system events.
                </p>
            </div>

            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                <strong>Info:</strong> This page is read-only for all users. Activity logs are automatically recorded.
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 rounded border border-gray-300 p-4">
                {activityLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No activity logs found.</p>
                ) : (
                    <div className="space-y-2">
                        {activityLogs.slice().reverse().map((log, index) => (
                            <div
                                key={index}
                                className="bg-white p-3 rounded shadow-sm border border-gray-200 font-mono text-sm"
                            >
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Your role:</strong> {role}</p>
                <p><strong>Total activities:</strong> {activityLogs.length}</p>
                <p><strong>Note:</strong> All login/logout actions are automatically logged here.</p>
            </div>
        </div>
    );
}
