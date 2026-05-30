"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Stethoscope,
  Pill,
  Microscope,
  Package,
  Receipt,
  FileBarChart,
  UserCog,
  LogOut,
  X,
} from "lucide-react"

interface SidebarProps {
  role: string
  onClose?: () => void
}

const navItems: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Patients", href: "/patients", icon: <Users size={20} /> },
    { label: "Doctors", href: "/doctors", icon: <Stethoscope size={20} /> },
    { label: "Appointments", href: "/appointments", icon: <CalendarCheck size={20} /> },
    { label: "Pharmacy", href: "/pharmacy", icon: <Pill size={20} /> },
    { label: "Laboratory", href: "/laboratory", icon: <Microscope size={20} /> },
    { label: "Inventory", href: "/inventory", icon: <Package size={20} /> },
    { label: "Billing", href: "/billing", icon: <Receipt size={20} /> },
    { label: "Reports", href: "/reports", icon: <FileBarChart size={20} /> },
    { label: "Users", href: "/admin/users", icon: <UserCog size={20} /> },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/doctor", icon: <LayoutDashboard size={20} /> },
    { label: "My Appointments", href: "/appointments", icon: <CalendarCheck size={20} /> },
    { label: "Patients", href: "/patients", icon: <Users size={20} /> },
    { label: "Prescriptions", href: "/doctor/prescriptions", icon: <Pill size={20} /> },
    { label: "Lab Requests", href: "/laboratory", icon: <Microscope size={20} /> },
    { label: "OPD Records", href: "/doctor/opd", icon: <FileBarChart size={20} /> },
  ],
  RECEPTIONIST: [
    { label: "Dashboard", href: "/receptionist", icon: <LayoutDashboard size={20} /> },
    { label: "Register Patient", href: "/patients/new", icon: <Users size={20} /> },
    { label: "Appointments", href: "/appointments", icon: <CalendarCheck size={20} /> },
    { label: "Patients", href: "/patients", icon: <Users size={20} /> },
  ],
  NURSE: [
    { label: "Dashboard", href: "/nurse", icon: <LayoutDashboard size={20} /> },
    { label: "IPD Records", href: "/nurse/ipd", icon: <Users size={20} /> },
    { label: "Vitals Entry", href: "/nurse/vitals", icon: <FileBarChart size={20} /> },
  ],
  PHARMACIST: [
    { label: "Dashboard", href: "/pharmacist", icon: <LayoutDashboard size={20} /> },
    { label: "Medicine Stock", href: "/pharmacy", icon: <Pill size={20} /> },
    { label: "Inventory", href: "/inventory", icon: <Package size={20} /> },
    { label: "Dispense", href: "/pharmacist/dispense", icon: <Receipt size={20} /> },
  ],
  ACCOUNTANT: [
    { label: "Dashboard", href: "/accountant", icon: <LayoutDashboard size={20} /> },
    { label: "Billing", href: "/billing", icon: <Receipt size={20} /> },
    { label: "Payments", href: "/accountant/payments", icon: <FileBarChart size={20} /> },
    { label: "Reports", href: "/reports", icon: <FileBarChart size={20} /> },
  ],
  LAB_TECHNICIAN: [
    { label: "Dashboard", href: "/lab-technician", icon: <LayoutDashboard size={20} /> },
    { label: "Pending Tests", href: "/laboratory", icon: <Microscope size={20} /> },
    { label: "Update Results", href: "/laboratory/results", icon: <FileBarChart size={20} /> },
  ],
}

export function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname()
  const items = navItems[role] || navItems.ADMIN

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h1 className="text-lg font-bold text-primary-700">MediCore</h1>
          <p className="text-xs text-gray-500">Hospital Management</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-red-50 hover:text-red-700"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-md animate-fade-in" />
              )}
              <span className={cn("transition-transform duration-200", isActive && "scale-110")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-100 p-4">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </aside>
  )
}
