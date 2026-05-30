"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Button, StatCard, Badge } from "@/components/ui"
import { Microscope, FlaskConical, ClipboardList, CheckCircle, Clock, TestTube, Scan } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"

export default function LabTechnicianDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/laboratory/requests?status=PENDING").then(r => r.json()),
      fetch("/api/laboratory/requests?status=IN_PROGRESS").then(r => r.json()),
      fetch("/api/laboratory/requests?status=COMPLETED").then(r => r.json()),
    ]).then(([dashData, pending, inProgress, completed]) => {
      setStats(dashData)
      setPendingCount(Array.isArray(pending) ? pending.length : 0)
      setInProgressCount(Array.isArray(inProgress) ? inProgress.length : 0)
      setCompletedCount(Array.isArray(completed) ? completed.length : 0)
      setLoading(false)
    }).catch(() => setLoading(false))
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

  const labSlides = [
    { icon: <TestTube size={28} />, title: "Test Processing", description: "Prioritize and process pending lab tests" },
    { icon: <Scan size={28} />, title: "Quality Control", description: "Ensure accurate results and equipment readiness" },
    { icon: <CheckCircle size={28} />, title: "Result Reporting", description: "Update and validate completed test reports" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={labSlides} className="mb-2" />
      <h1 className="text-2xl font-bold text-gray-900">Lab Technician Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Tests" value={pendingCount} icon={<Clock size={24} />} color="yellow" delay={0} />
        <StatCard title="In Progress" value={inProgressCount} icon={<Microscope size={24} />} color="blue" delay={100} />
        <StatCard title="Completed Today" value={completedCount} icon={<CheckCircle size={24} />} color="green" delay={200} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Overview</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">{pendingCount} Pending</Badge>
            <Badge variant="info">{inProgressCount} In Progress</Badge>
            <Badge variant="success">{completedCount} Completed</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Test Catalog & Requests", href: "/laboratory", icon: <FlaskConical size={20} className="mr-2" /> },
          { label: "Update Results", href: "/laboratory/results", icon: <ClipboardList size={20} className="mr-2" /> },
        ].map((action, index) => (
          <div
            key={action.label}
            className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: `${400 + index * 100}ms` }}
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
