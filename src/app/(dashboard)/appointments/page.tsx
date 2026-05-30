"use client"

import { Card, CardContent, CardHeader, Button, Input, Badge, Table, TableHead, TableBody, TableRow, TableCell, Modal } from "@/components/ui"
import { Plus, Search, CalendarCheck, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  SCHEDULED: "info",
  CONFIRMED: "info",
  CHECKED_IN: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
  NO_SHOW: "default",
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterDoctor, setFilterDoctor] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [editAppt, setEditAppt] = useState<any>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, docRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/doctors"),
        ])
        if (apptRes.ok) setAppointments(await apptRes.json())
        if (docRes.ok) setDoctors(await docRes.json())
      } catch (err) {
        console.error("Failed to load data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const openEdit = (appt: any) => {
    setEditAppt(appt)
    setEditStatus(appt.status)
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editAppt) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/appointments/${editAppt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      })
      if (res.ok) {
        const updated = await fetch("/api/appointments").then((r) => r.json())
        setAppointments(updated)
        setEditOpen(false)
        setEditAppt(null)
      }
    } finally {
      setEditSubmitting(false)
    }
  }

  const filtered = appointments.filter((a: any) => {
    if (filterDate && !a.date?.startsWith(filterDate)) return false
    if (filterDoctor && a.doctorId !== filterDoctor) return false
    if (filterStatus && a.status !== filterStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        </div>
        <Button onClick={() => router.push("/appointments/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-44"
            />
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="block w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Doctors</option>
              {doctors.map((doc: any) => (
                <option key={doc.id} value={doc.id}>
                  {doc.user?.name || doc.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No appointments found</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Patient ID</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Time</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Type</TableCell>
                  <TableCell header>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.patient?.name || a.patientName || "-"}</TableCell>
                    <TableCell>{a.patient?.patientId || a.patientId || "-"}</TableCell>
                    <TableCell>{a.doctor?.user?.name || a.doctorName || "-"}</TableCell>
                    <TableCell>{a.date ? formatDate(a.date) : "-"}</TableCell>
                    <TableCell>{a.timeSlot || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[a.status] as any || "default"}>{a.status}</Badge>
                    </TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Appointment Status">
        <form onSubmit={handleEditSave} className="space-y-4">
          {editAppt && (
            <div className="text-sm text-gray-600 space-y-1 mb-2">
              <p><strong>Patient:</strong> {editAppt.patient?.name || editAppt.patientName || "-"}</p>
              <p><strong>Doctor:</strong> {editAppt.doctor?.user?.name || editAppt.doctorName || "-"}</p>
              <p><strong>Date:</strong> {editAppt.date ? formatDate(editAppt.date) : "-"} at {editAppt.timeSlot || "-"}</p>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Updating..." : "Update Status"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
