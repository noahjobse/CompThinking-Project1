"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const handleLogin = () => {
        router.push("/menu");
    }


    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <div>
                <h1>Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                />
                <input
                    type="text"
                    placeholder="Password"
                />
                <button
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </main>
);
}