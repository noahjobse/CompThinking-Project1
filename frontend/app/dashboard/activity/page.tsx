"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

interface ActivityLog {
    timestamp: string;
    user: string;
    action: string;
    details?: string;
}

export default function ActivityLogPage() {
    const { role } = useAuth();
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivityLogs();
    }, []);

    const loadActivityLogs = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/activity`);
            const json = await response.json();
            if (response.ok && json.status === "success") {
                setActivityLogs(json.data || []);
            }
        } catch (error) {
            console.error("Failed to load activity logs:", error);
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
                                {`${log.timestamp} — ${log.user} ${log.action}`}
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
