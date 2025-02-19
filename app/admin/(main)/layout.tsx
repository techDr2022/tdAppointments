"use client";

import { useState } from "react";
import Sidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with state management */}
      <div
        className={`flex-none transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      {/* Dynamic content area with smooth margin transition */}
      <div
        className={`flex-1 overflow-auto transform-gpu transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "pl-1" : "pl-0"
        }`}
        style={{
          willChange: "padding-left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
