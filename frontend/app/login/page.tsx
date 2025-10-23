"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const handleLogin = () => {
        router.push("/menu");
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
            {/* Login Card */}
            <div className="flex flex-col shadow-xl p-8 rounded-xl bg-white max-w-xs w-full sm:max-w-sm md:max-w-md">
                <h1 className="self-center mb-5 font-bold text-2xl">Login</h1>
                <label htmlFor="username">Username</label>
                <input 
                    className="mt-1 mb-4 p-1.5 border-2 rounded border-gray-300 "
                    type="text"
                    id="username"
                    placeholder="Enter Username"
                />
                <label htmlFor="password">Password</label>
                <input 
                    className="mt-1 mb-4 p-1.5 border-2 rounded border-gray-300 "
                    type="password"
                    id="password"
                    placeholder="Enter Password"
                />
                <button
                    className="mt-4.5 p-2 rounded font-bold text-white bg-gray-600 hover:bg-gray-700 hover:cursor-pointer"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
);
}