"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username.trim(), password.trim());
      // redirect handled in AuthContext
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message || "Invalid username or password"
          : "Invalid username or password";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
      <div className="flex flex-col shadow-xl p-8 rounded-xl bg-white max-w-xs w-full sm:max-w-sm md:max-w-md">
        <h1 className="self-center mb-5 font-bold text-2xl">Login</h1>

        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            className="mt-1 mb-4 p-1.5 border-2 rounded border-gray-300 w-full"
            type="text"
            id="username"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />

          <label htmlFor="password">Password</label>
          <input
            className="mt-1 mb-4 p-1.5 border-2 rounded border-gray-300 w-full"
            type="password"
            id="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            className="mt-4 p-2 rounded font-bold text-white bg-gray-600 hover:bg-gray-700 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Test Accounts:</p>
          <p>Admin: admin123 / admin123</p>
          <p>Editor: editor123 / editor123</p>
          <p>Viewer: viewer123 / viewer123</p>
        </div>
      </div>
    </div>
  );
}
