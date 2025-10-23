"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
    href: string;
    label: string
}

export default function NavLink({href, label}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname == href;

    return (
        <Link
            href={href}
            // Highlights active link
            className={`block px-3 py-2 rounded-md text-sm font-bold transition-colors
                ${isActive 
                    ? "bg-gray-700 text-white font-bold" 
                    : "hover:bg-gray-200 hover:text-gray-900"
                }
            `}
        >
            {label}
        </Link>
    );
}