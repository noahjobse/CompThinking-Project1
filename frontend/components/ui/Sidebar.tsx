import NavLink from "./NavLink";

export default function Sidebar() {
    
    const links = [
        { href: "/dashboard/doc", label: "Document" },
        { href: "/dashboard/board", label: "Task Board" },
        { href: "/dashboard/users", label: "Users" },
        { href: "/dashboard/activity", label: "Activity Log" }
    ]

    return (
        <aside className="w-60 bg-gray-100 p-4 min-h-screen">
            {/* Dashboard Links */}
            <nav className="flex flex-col gap-3">
                {links.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label}/>
                ))}
            </nav>
        </aside>
    );
}