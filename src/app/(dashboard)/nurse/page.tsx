"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Button, StatCard } from "@/components/ui"
import { Stethoscope, ClipboardList, Activity, Hospital, Heart, Thermometer, Syringe } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { Carousel } from "@/components/ui/carousel"

export default function NurseDashboard() {
  const router = useRouter()
  const [activeIpd, setActiveIpd] = useState(0)
  const [recentVitals, setRecentVitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/ipd").then(r => r.json()),
      fetch("/api/nurse-records").then(r => r.json()),
    ]).then(([ipdData, vitalsData]) => {
      setActiveIpd(Array.isArray(ipdData) ? ipdData.filter((r: any) => !r.isDischarged).length : 0)
      setRecentVitals(Array.isArray(vitalsData) ? vitalsData.slice(0, 5) : [])
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

  const nurseSlides = [
    { icon: <Thermometer size={28} />, title: "Vitals Monitoring", description: "Track patient vitals and record updates" },
    { icon: <Syringe size={28} />, title: "Medication Rounds", description: "Scheduled medication administration reminders" },
    { icon: <Heart size={28} />, title: "Patient Comfort", description: "Ensure quality care and patient well-being" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={nurseSlides} className="mb-2" />
      <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active IPD Patients" value={activeIpd} icon={<Hospital size={24} />} color="blue" delay={0} />
        <StatCard title="Today's Vitals" value={recentVitals.length} icon={<Heart size={24} />} color="green" delay={100} />
      </div>

      {recentVitals.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Vitals Recorded</h2>
            <div className="space-y-3">
              {recentVitals.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{v.ipdRecord?.patient?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{v.temperature && `Temp: ${v.temperature}`} {v.bloodPressure && `| BP: ${v.bloodPressure}`} {v.pulseRate && `| Pulse: ${v.pulseRate}`}</p>
                  </div>
                  <p className="text-sm text-gray-400">{formatDateTime(v.date)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "IPD Records", href: "/nurse/ipd", icon: <Hospital size={20} className="mr-2" /> },
          { label: "Record Vitals", href: "/nurse/vitals", icon: <Heart size={20} className="mr-2" /> },
          { label: "View Patients", href: "/patients", icon: <Stethoscope size={20} className="mr-2" /> },
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
