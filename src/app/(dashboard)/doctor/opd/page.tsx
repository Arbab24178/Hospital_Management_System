"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { Plus, FileText, Search } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function OPDPage() {
  const [records, setRecords] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    patientId: "", complaint: "", diagnosis: "", vitals: "", fee: "", followUpDate: "", notes: "",
  })

  const fetchData = async () => {
    try {
      const [recRes, patRes] = await Promise.all([
        fetch("/api/opd"),
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
      const res = await fetch("/api/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fee: parseFloat(form.fee || "0") }),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ patientId: "", complaint: "", diagnosis: "", vitals: "", fee: "", followUpDate: "", notes: "" })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = records.filter((r) =>
    r.patient?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge = (r: any) => {
    if (r.diagnosis) return <Badge variant="success">Completed</Badge>
    return <Badge variant="warning">Pending</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">OPD Records</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> New OPD Record</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText size={48} className="mb-3" />
              <p className="text-lg font-medium">No OPD records found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Complaint</TableCell>
                  <TableCell header>Diagnosis</TableCell>
                  <TableCell header>Fee</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient?.name || "-"}</TableCell>
                    <TableCell>{r.doctor?.user?.name || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.complaint}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.diagnosis || "-"}</TableCell>
                    <TableCell>{formatCurrency(r.fee || 0)}</TableCell>
                    <TableCell>{statusBadge(r)}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New OPD Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient" value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            options={patients.map((p: any) => ({ label: p.name, value: p.id }))} required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Complaint</label>
            <textarea value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Patient's complaint" required />
          </div>
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis" />
          <Input label="Vitals" value={form.vitals} onChange={(e) => setForm({ ...form, vitals: e.target.value })} placeholder="BP, pulse, temp etc." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fee ($)" type="number" min="0" step="0.01" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="0.00" />
            <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Optional notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Record"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
