"use client";

import { useState } from "react";
import Sidebar from "@/components/AdminSidebar";
import AppointmentsDashboard from "@/components/AppointmentDashboard";

const AdminAppointments = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      {/* Dynamic Dashboard with smooth margin transition */}
      <div
        className={`flex-1 overflow-auto transform-gpu transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "pl-6" : "pl-0"
        }`}
        style={{
          willChange: "padding-left",
        }}
      >
        <AppointmentsDashboard />
      </div>
    </div>
  );
};

export default AdminAppointments;
