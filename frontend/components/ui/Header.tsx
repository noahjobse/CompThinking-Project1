"use client";

import Dropdown from "./Dropdown";
import {Bell} from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [isExpanded, setIsExpanded] = useState(false);

    const notifications = [
        "This is a really cool notification with important stuff.",
      
    ]

    const handleNotificationDropdown = () => {
        setIsExpanded(prev => !prev);
    }

    return (
        <header className="flex justify-between items-center bg-gray-300 p-4">
            {/* Add logo placeholder */}

            {/* App Name */}
            <h1 className="text-2xl font-bold text-gray-950">A Cool Name</h1>

            {/* User Role and Notifications Icon */}
            <div className="flex items-center gap-4">

                {/* Role */}
                <p className="text-md font-bold text-gray-700">Role: Admin</p>

                {/* Notifications Icon and Dropdown */}
                <div className="relative">
                    {/* Notifications Icon */}
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