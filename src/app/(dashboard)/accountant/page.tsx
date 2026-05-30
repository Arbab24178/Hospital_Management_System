"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Button, StatCard } from "@/components/ui"
import { DollarSign, Receipt, BarChart3, TrendingUp, Wallet, PiggyBank, FileCheck } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"
import { formatCurrency } from "@/lib/utils"

export default function AccountantDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [paymentsCount, setPaymentsCount] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/payments").then(r => r.json()),
    ]).then(([dashData, paymentsData]) => {
      setStats(dashData)
      if (Array.isArray(paymentsData)) {
        setPaymentsCount(paymentsData.length)
        setTotalCollected(paymentsData.reduce((sum: number, p: any) => sum + (p.amount || 0), 0))
      }
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

  const accountantSlides = [
    { icon: <DollarSign size={28} />, title: "Revenue Tracking", description: "Monitor monthly revenue and billing cycles" },
    { icon: <PiggyBank size={28} />, title: "Expense Management", description: "Track hospital expenses and operational costs" },
    { icon: <FileCheck size={28} />, title: "Invoice Summary", description: "Pending and completed invoices at a glance" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={accountantSlides} className="mb-2" />
      <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Monthly Revenue" value={stats?.monthlyRevenue != null ? formatCurrency(stats.monthlyRevenue) : "$0.00"} icon={<DollarSign size={24} />} color="green" delay={0} />
        <StatCard title="Pending Bills" value={stats?.pendingBills ?? 0} icon={<Receipt size={24} />} color="red" delay={100} />
        <StatCard title="Total Collected" value={formatCurrency(totalCollected)} icon={<Wallet size={24} />} color="blue" delay={200} />
        <StatCard title="Transactions" value={paymentsCount} icon={<TrendingUp size={24} />} color="purple" delay={300} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Billing", href: "/billing", icon: <Receipt size={20} className="mr-2" /> },
          { label: "Payments", href: "/accountant/payments", icon: <Wallet size={20} className="mr-2" /> },
          { label: "Reports", href: "/reports", icon: <BarChart3 size={20} className="mr-2" /> },
        ].map((action, index) => (
          <div
            key={action.label}
            className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: `${500 + index * 100}ms` }}
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
