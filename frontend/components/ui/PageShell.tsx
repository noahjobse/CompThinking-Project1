export default function PageShell({children}: {children: React.ReactNode}) {
    return (
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            {children}
        </div>
    );
}