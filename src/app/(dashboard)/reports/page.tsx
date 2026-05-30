"use client"

import { Card, CardContent, CardHeader, Button, Input, Select, Badge } from "@/components/ui"
import { FileBarChart, TrendingUp, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

const reportTypes = [
  { key: "appointments", label: "Appointments", icon: FileBarChart },
  { key: "revenue", label: "Revenue", icon: TrendingUp },
  { key: "patients", label: "Patients", icon: FileBarChart },
  { key: "doctors", label: "Doctors", icon: FileBarChart },
]

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedType) return
    const fetchReport = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ type: selectedType })
        if (fromDate) params.append("from", fromDate)
        if (toDate) params.append("to", toDate)
        const res = await fetch(`/api/reports?${params}`)
        if (res.ok) setData(await res.json())
      } catch (err) {
        console.error("Failed to load report", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [selectedType, fromDate, toDate])

  const renderReport = () => {
    if (!data) return null

    switch (selectedType) {
      case "appointments":
        return (
          <div className="space-y-3">
            {["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map((status) => {
              const item = data.data?.find((d: any) => d.status === status)
              return (
                <div key={status} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">{status.replace("_", " ")}</span>
                  <Badge variant="info">{item?.count || 0}</Badge>
                </div>
              )
            })}
          </div>
        )

      case "revenue":
        return (
          <div className="space-y-3">
            {Array.isArray(data.data) && data.data.length > 0 ? (
              <>
                {data.data.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">{entry.date}</span>
                    <span className="text-sm font-semibold">{formatCurrency(entry.total || 0)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-base font-bold">{formatCurrency(data.data.reduce((s: number, e: any) => s + (e.total || 0), 0))}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No revenue data</p>
            )}
          </div>
        )

      case "patients":
        return (
          <div className="space-y-3">
            {["MALE", "FEMALE", "OTHER"].map((gender) => {
              const item = data.data?.find((d: any) => d.gender === gender)
              return (
                <div key={gender} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">{gender.charAt(0) + gender.slice(1).toLowerCase()}</span>
                  <Badge variant="info">{item?.count || 0}</Badge>
                </div>
              )
            })}
          </div>
        )

      case "doctors":
        return (
          <div className="space-y-3">
            {Array.isArray(data.data) && data.data.length > 0 ? (
              data.data.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">{doc.name}</span>
                  <Badge variant="info">{doc.appointmentCount || 0}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No doctor data</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileBarChart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {reportTypes.map((rt) => (
          <Button
            key={rt.key}
            variant={selectedType === rt.key ? "primary" : "secondary"}
            onClick={() => setSelectedType(rt.key)}
          >
            <rt.icon className="mr-2 h-4 w-4" /> {rt.label}
          </Button>
        ))}
      </div>

      {selectedType && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <Input
                type="date"
                label="From"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-44"
              />
              <Input
                type="date"
                label="To"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-44"
              />
              <div className="flex items-center gap-2 self-end">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {reportTypes.find((rt) => rt.key === selectedType)?.label} Report
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading report...</p>
            ) : data ? (
              renderReport()
            ) : (
              <p className="text-center text-muted-foreground py-8">Select date range to view data</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
