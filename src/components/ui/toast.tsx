"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function Toast({ message, type = "info", duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor = 
    type === "success" ? "bg-green-100 border-green-500 text-green-700" :
    type === "error" ? "bg-red-100 border-red-500 text-red-700" :
    "bg-blue-100 border-blue-500 text-blue-700";

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded border ${bgColor} shadow-md max-w-md`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        <button 
          onClick={() => setVisible(false)}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastProvider() {
  return <div id="toast-container" className="fixed bottom-4 right-4 z-50" />;
}