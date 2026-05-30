"use client"

import { Card, CardContent, CardHeader, Button, Input, Select } from "@/components/ui"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewAppointmentPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [form, setForm] = useState({
    patientId: "", doctorId: "", date: "", timeSlot: "", type: "OPD", reason: "", notes: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/doctors").then(r => r.json()),
    ]).then(([patientsData, doctorsData]) => {
      setPatients(patientsData)
      setDoctors(doctorsData)
    }).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create appointment")
      }
      router.push("/appointments")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/appointments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Appointment</h1>
      </div>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Appointment Details</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Patient" name="patientId" value={form.patientId} onChange={handleChange} required
                options={[{ label: "Select patient...", value: "" }, ...patients.map((p: any) => ({ label: `${p.name} (${p.patientId})`, value: p.id }))]}
              />
              <Select
                label="Doctor" name="doctorId" value={form.doctorId} onChange={handleChange} required
                options={[{ label: "Select doctor...", value: "" }, ...doctors.map((d: any) => ({ label: d.user?.name || d.name, value: d.id }))]}
              />
              <Input label="Date" name="date" type="date" min={today} value={form.date} onChange={handleChange} required />
              <Input label="Time Slot" name="timeSlot" type="time" value={form.timeSlot} onChange={handleChange} required />
              <Select
                label="Type" name="type" value={form.type} onChange={handleChange} required
                options={[{ label: "OPD", value: "OPD" }, { label: "IPD", value: "IPD" }, { label: "Follow-up", value: "FOLLOW_UP" }]}
              />
            </div>
            <Input label="Reason" name="reason" value={form.reason} onChange={handleChange} placeholder="Reason for visit" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Optional notes" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Appointment"}</Button>
              <Link href="/appointments"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
