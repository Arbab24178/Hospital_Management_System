"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { Plus, Hospital, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

const wardOptions = [
  { label: "General", value: "GENERAL" },
  { label: "Semi-Private", value: "SEMI_PRIVATE" },
  { label: "Private", value: "PRIVATE" },
  { label: "ICU", value: "ICU" },
  { label: "NICU", value: "NICU" },
  { label: "Emergency", value: "EMERGENCY" },
]

export default function IPDPage() {
  const [records, setRecords] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    patientId: "", ward: "GENERAL", bedNumber: "", diagnosis: "", treatment: "", notes: "", expectedDischargeDate: "",
  })

  const fetchData = async () => {
    try {
      const [recRes, patRes] = await Promise.all([
        fetch("/api/ipd"),
        fetch("/api/patients"),
      ])
      if (recRes.ok) setRecords(await recRes.json())
      if (patRes.ok) setPatients(await patRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/ipd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ patientId: "", ward: "GENERAL", bedNumber: "", diagnosis: "", treatment: "", notes: "", expectedDischargeDate: "" })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = records.filter((r) =>
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.bedNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const wardBadge = (ward: string) => {
    const colors: Record<string, string> = {
      ICU: "bg-red-100 text-red-800",
      NICU: "bg-pink-100 text-pink-800",
      EMERGENCY: "bg-orange-100 text-orange-800",
      PRIVATE: "bg-purple-100 text-purple-800",
      SEMI_PRIVATE: "bg-blue-100 text-blue-800",
      GENERAL: "bg-gray-100 text-gray-800",
    }
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[ward] || "bg-gray-100 text-gray-800"}`}>{ward.replace(/_/g, " ")}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hospital className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">IPD Records</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Admission</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search patient or bed..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Hospital size={48} className="mb-3" />
              <p className="text-lg font-medium">No IPD records found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Ward</TableCell>
                  <TableCell header>Bed</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Diagnosis</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Admitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient?.name || "-"}</TableCell>
                    <TableCell>{wardBadge(r.ward)}</TableCell>
                    <TableCell>{r.bedNumber}</TableCell>
                    <TableCell>{r.doctor?.user?.name || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.diagnosis || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={r.isDischarged ? "default" : "info"}>
                        {r.isDischarged ? "Discharged" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(r.admissionDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New IPD Admission">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient" value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            options={patients.map((p: any) => ({ label: p.name, value: p.id }))} required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} options={wardOptions} required />
            <Input label="Bed Number" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} placeholder="e.g. A-101" required />
          </div>
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis" />
          <Input label="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} placeholder="Treatment plan" />
          <Input label="Expected Discharge Date" type="date" value={form.expectedDischargeDate} onChange={(e) => setForm({ ...form, expectedDischargeDate: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Optional notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Admitting..." : "Admit Patient"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
