"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Clock,
  CreditCard,
  Package,
  User,
  Menu,
  ChevronLeft,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    {
      name: "All Appointments",
      href: "/admin/all-appointments",
      icon: Calendar,
    },
    { name: "Patients", href: "/admin/patients", icon: Users },
    { name: "Doctors", href: "/admin/doctors", icon: User },
    { name: "Departments", href: "/admin/departments", icon: Building2 },
    { name: "Doctors' Schedule", href: "/admin/schedule", icon: Clock },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
  ];

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen bg-white shadow-md transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="relative h-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
          onClick={onToggle}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>

        <div className="p-4">
          <div
            className={cn(
              "flex items-center gap-2 pb-6 transition-all duration-300",
              isCollapsed && "justify-center"
            )}
          >
            <Image
              src="/techdr logo2.png"
              width={150}
              height={100}
              alt="logo"
              priority
            />
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href} className="block">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full transition-all duration-300",
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-500",
                      isCollapsed
                        ? "justify-center px-2"
                        : "justify-start gap-2"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
