"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Button, StatCard } from "@/components/ui"
import { Users, CalendarCheck, UserPlus, ClipboardList, Phone, Clock } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
}

interface Appointment {
  id: string
  patient: { name: string }
  doctor: { name: string }
  timeSlot: string
  status: string
}

export default function ReceptionistDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch(`/api/appointments?date=${today}`).then((r) => r.json()),
    ])
      .then(([statsData, appointmentsData]) => {
        setStats(statsData)
        setAppointments(appointmentsData)
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

  const receptionistSlides = [
    { icon: <ClipboardList size={28} />, title: "Patient Registration", description: "Quick and accurate patient intake process" },
    { icon: <Phone size={28} />, title: "Appointment Calls", description: "Manage inbound inquiries and scheduling" },
    { icon: <Clock size={28} />, title: "Walk-in Management", description: "Handle unscheduled visits smoothly" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={receptionistSlides} className="mb-2" />
      <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} icon={<Users size={24} />} color="blue" delay={0} />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} icon={<CalendarCheck size={24} />} color="green" delay={100} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments today.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{apt.timeSlot} — Dr. {apt.doctor?.name || "N/A"}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Register New Patient", href: "/patients/new", icon: <UserPlus size={20} className="mr-2" /> },
          { label: "Create Appointment", href: "/appointments", icon: <CalendarCheck size={20} className="mr-2" /> },
        ].map((action, index) => (
          <div
            key={action.label}
            className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <Button variant="outline" className="h-14 text-base font-medium w-full hover:border-primary-300 hover:text-primary-700 transition-all duration-200" onClick={() => router.push(action.href)}>
              {action.icon} {action.label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
