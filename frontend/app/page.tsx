"use client";
import { useState } from "react";

export default function HomePage() {
  const [status, setStatus] = useState<string>("");

  async function testConnection() {
    try {
      const res = await fetch("http://localhost:8000");
      if (!res.ok) throw new Error("Backend unreachable");
      const data = await res.json();
      setStatus(`✅ Connection successful: ${data.message}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to connect to FastAPI backend");
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">FastAPI Connection Test</h1>
      <div className="mt-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Connection
        </button>
      </div>
      <p className="mt-6 text-lg">{status}</p>
    </main>
  );
}
