"use client";

import { useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "warning", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === "error" ? "bg-red-100 border-red-400" : 
                  type === "warning" ? "bg-yellow-100 border-yellow-400" : 
                  "bg-blue-100 border-blue-400";
  
  const textColor = type === "error" ? "text-red-700" : 
                    type === "warning" ? "text-yellow-700" : 
                    "text-blue-700";

  return (
    <div className={`fixed top-20 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded shadow-lg max-w-md flex items-start gap-3 animate-slide-in`}>
      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}
