"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  StatCard,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui"
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Receipt,
  DollarSign,
  Microscope,
  Package,
  Activity,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  BarChart3,
  Clock,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Carousel } from "@/components/ui/carousel"

interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  todayAppointments: number
  pendingBills: number
  monthlyRevenue: number
  pendingLabTests: number
  lowStockItems: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats?.totalPatients ?? 0,
      icon: <Users size={20} />,
      color: "blue",
    },
    {
      title: "Total Doctors",
      value: stats?.totalDoctors ?? 0,
      icon: <Stethoscope size={20} />,
      color: "green",
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments ?? 0,
      icon: <CalendarCheck size={20} />,
      color: "purple",
    },
    {
      title: "Pending Bills",
      value: stats?.pendingBills ?? 0,
      icon: <Receipt size={20} />,
      color: "red",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyRevenue != null ? formatCurrency(stats.monthlyRevenue) : "$0.00",
      icon: <DollarSign size={20} />,
      color: "green",
    },
    {
      title: "Pending Lab Tests",
      value: stats?.pendingLabTests ?? 0,
      icon: <Microscope size={20} />,
      color: "yellow",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems ?? 0,
      icon: <Package size={20} />,
      color: "orange",
    },
    {
      title: "Occupancy",
      value: "N/A",
      icon: <Activity size={20} />,
      color: "indigo",
    },
  ]

  const quickActions = [
    { label: "Register New Patient", href: "/patients/new" },
    { label: "Create Appointment", href: "#" },
    { label: "View All Patients", href: "/patients" },
    { label: "View Appointments", href: "/appointments" },
  ]

  const adminSlides = [
    { icon: <BarChart3 size={28} />, title: "Hospital Overview", description: "Monitor key metrics across all departments" },
    { icon: <HeartPulse size={28} />, title: "Patient Safety First", description: "Real-time alerts and incident tracking" },
    { icon: <ShieldCheck size={28} />, title: "Compliance Status", description: "Stay audit-ready with automated reports" },
    { icon: <Clock size={28} />, title: "Staff Scheduling", description: "Optimize shift management efficiently" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={adminSlides} className="mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            delay={index * 100}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <div
            key={action.label}
            className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <Button
              variant="outline"
              className="h-14 text-base font-medium w-full hover:border-primary-300 hover:text-primary-700 transition-all duration-200"
              onClick={() => router.push(action.href)}
            >
              {action.label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
