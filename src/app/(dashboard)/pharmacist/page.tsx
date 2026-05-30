"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Button, StatCard, Table, TableHead, TableBody, TableRow, TableCell, Badge } from "@/components/ui"
import { Package, AlertTriangle, Pill, ShoppingCart, AlertCircle, Refrigerator, Container } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"

export default function PharmacistDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/inventory?lowStock=true").then(r => r.json()),
      fetch("/api/pharmacy").then(r => r.json()),
    ]).then(([dashData, invData, pharmData]) => {
      const medCount = Array.isArray(pharmData) ? pharmData.length : 0
      setStats({ ...dashData, totalMedicines: medCount })
      setLowStockItems(Array.isArray(invData) ? invData : [])
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

  const pharmacistSlides = [
    { icon: <Pill size={28} />, title: "Stock Management", description: "Monitor medicine inventory and reorder levels" },
    { icon: <AlertTriangle size={28} />, title: "Low Stock Alerts", description: "Items below threshold need immediate restock" },
    { icon: <ShoppingCart size={28} />, title: "Dispensing Queue", description: "Pending prescriptions ready for dispensing" },
  ]

  return (
    <div className="space-y-8 p-8">
      <Carousel slides={pharmacistSlides} className="mb-2" />
      <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Medicines" value={stats?.totalMedicines ?? 0} icon={<Pill size={24} />} color="blue" delay={0} />
        <StatCard title="Low Stock Items" value={stats?.lowStockItems ?? 0} icon={<AlertTriangle size={24} />} color="red" delay={100} />
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Items Below Reorder Level</h2>
            </div>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-500">Stock: {item.quantity} | Reorder at: {item.reorderLevel}</p>
                  </div>
                  <Badge variant="danger">{item.quantity} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Medicine Stock", href: "/pharmacy", icon: <Pill size={20} className="mr-2" /> },
          { label: "Inventory", href: "/inventory", icon: <Package size={20} className="mr-2" /> },
          { label: "Dispense", href: "/pharmacist/dispense", icon: <ShoppingCart size={20} className="mr-2" /> },
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
