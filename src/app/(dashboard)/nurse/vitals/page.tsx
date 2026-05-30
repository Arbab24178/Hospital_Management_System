"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select,
  Table, TableHead, TableBody, TableRow, TableCell, Modal, Badge,
} from "@/components/ui"
import { Plus, Heart, Search } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export default function VitalsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [ipdRecords, setIpdRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    ipdRecordId: "",
    temperature: "",
    bloodPressure: "",
    pulseRate: "",
    observation: "",
    medication: "",
    diet: "",
    notes: "",
  })

  const fetchData = async () => {
    try {
      const [recRes, ipdRes] = await Promise.all([
        fetch("/api/nurse-records"),
        fetch("/api/ipd"),
      ])
      if (recRes.ok) setRecords(await recRes.json())
      if (ipdRes.ok) setIpdRecords(await ipdRes.json())
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
      const res = await fetch("/api/nurse-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ ipdRecordId: "", temperature: "", bloodPressure: "", pulseRate: "", observation: "", medication: "", diet: "", notes: "" })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Vitals Entry</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Record Vitals</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Heart size={48} className="mb-3" />
              <p className="text-lg font-medium">No vitals recorded yet</p>
              <p className="text-sm mt-1">Record patient vitals to get started</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Ward</TableCell>
                  <TableCell header>Temp</TableCell>
                  <TableCell header>BP</TableCell>
                  <TableCell header>Pulse</TableCell>
                  <TableCell header>Nurse</TableCell>
                  <TableCell header>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.ipdRecord?.patient?.name || "-"}</TableCell>
                    <TableCell>{r.ipdRecord?.ward || "-"}</TableCell>
                    <TableCell>{r.temperature || "-"}</TableCell>
                    <TableCell>{r.bloodPressure || "-"}</TableCell>
                    <TableCell>{r.pulseRate || "-"}</TableCell>
                    <TableCell>{r.nurseName}</TableCell>
                    <TableCell>{formatDateTime(r.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Vitals">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="IPD Patient"
            value={form.ipdRecordId}
            onChange={(e) => setForm({ ...form, ipdRecordId: e.target.value })}
            options={ipdRecords
              .filter((r: any) => !r.isDischarged)
              .map((r: any) => ({ label: `${r.patient?.name} - Bed ${r.bedNumber}`, value: r.id }))}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Temperature" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="98.6°F" />
            <Input label="Blood Pressure" value={form.bloodPressure} onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })} placeholder="120/80" />
            <Input label="Pulse Rate" value={form.pulseRate} onChange={(e) => setForm({ ...form, pulseRate: e.target.value })} placeholder="72 bpm" />
          </div>
          <Input label="Observation" value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} placeholder="General observation" />
          <Input label="Medication Given" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} placeholder="Medication administered" />
          <Input label="Diet" value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} placeholder="Diet plan" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Additional notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Vitals"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
