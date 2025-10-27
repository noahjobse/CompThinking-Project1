"use client";

import Dropdown from "./Dropdown";
import { Bell, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { role, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    const notifications = [
        "This is a really cool notification with important stuff."
    ]

    const handleNotificationDropdown = () => {
        setIsExpanded(prev => !prev);
    }

    return (
        <header className="flex justify-between items-center bg-gray-300 p-4">
            {/* Logo here */}

            {/* App Name */}
            <h1 className="text-2xl font-bold text-gray-950">A Cool Name</h1>

            <div className="flex items-center gap-4">

                {/* User Role */}
                <p className="text-md font-bold text-gray-700">
                    Role: {role || "Guest"}
                </p>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-semibold">Logout</span>
                </button>

                {/* Notifications Icon and Dropdown */}
                <div className="relative">
                    <Bell 
                        className={`text-gray-600 fill-current hover:cursor-pointer transition-colors hover:scale-110
                            ${isExpanded 
                                ? "text-gray-900" 
                                : "text-gray-600 hover:text-gray-900"
                            }
                        `}
                        onClick={handleNotificationDropdown}
                    />
                    {isExpanded && 
                        <Dropdown notifications={notifications} />
                    }
                </div>
                
                
            </div>
        </header>
    );
}
