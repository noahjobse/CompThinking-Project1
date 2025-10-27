"use client";

import Header from "@/components/ui/Header"
import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";

export default function MenuPage() {
    const router = useRouter();
    
    const handleClick = () => {
        router.push("/dashboard/doc");
    }
    
    return (
        <AuthGuard>
            <div className="flex flex-col h-screen w-screen">
            <Header/>

            {/* Main Content */}
            <div className="flex flex-1  flex-col p-6">
                <h1 className="text-2xl font-bold mb-4">Menu</h1>

                {/* Projects Section*/}
                <div className="flex flex-1 flex-col">
                    <h2 className="text-lg font-bold mb-1.5">Your Projects</h2>
                    
                    {/* Projects List */}
                    <div>
                        <div className="flex flex-wrap gap-4 border border-gray-300 p-2">
                            
                            {/* Project Card Button */}
                            <button 
                                className="bg-amber-400 rounded-xl border border-gray-400 overflow-hidden hover:cursor-pointer hover:brightness-98"
                                onClick={handleClick}
                            >
                                {/* Card */}
                                <div className="flex flex-col shadow-xl  bg-white min-w-46 h-56">
                                    {/* Card Body */}
                                    <div className="flex-1 bg-gray-100"></div>
                                    {/* Card Footer */}
                                    <div className="flex h-16 border-t-2 border-gray-200 items-center bg">
                                        <h3 className="p-4 font-bold text-ellipsis">Main Workspace</h3>

                                    </div>
                                </div>
                            </button>

                        </div>
                    </div>
                </div>
            </div>
            
            </div>
        </AuthGuard>
    )
}
