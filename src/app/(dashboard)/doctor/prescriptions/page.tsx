"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { Plus, Pill, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    patientId: "", diagnosis: "", notes: "",
    items: [] as { medicineId: string; dosage: string; frequency: string; duration: string; quantity: string }[],
  })

  const fetchData = async () => {
    try {
      const [prescRes, patRes, medRes] = await Promise.all([
        fetch("/api/prescriptions"),
        fetch("/api/patients"),
        fetch("/api/pharmacy"),
      ])
      if (prescRes.ok) setPrescriptions(await prescRes.json())
      if (patRes.ok) setPatients(await patRes.json())
      if (medRes.ok) setMedicines(await medRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { medicineId: "", dosage: "", frequency: "", duration: "", quantity: "1" }],
    }))
  }

  const updateItem = (index: number, field: string, value: string) => {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  const removeItem = (index: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: form.items.map(item => ({ ...item, quantity: parseInt(item.quantity) })),
        }),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ patientId: "", diagnosis: "", notes: "", items: [] })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = prescriptions.filter((p) =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Write Prescription</Button>
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
              <Pill size={48} className="mb-3" />
              <p className="text-lg font-medium">No prescriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Diagnosis</TableCell>
                  <TableCell header>Items</TableCell>
                  <TableCell header>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.patient?.name || "-"}</TableCell>
                    <TableCell>{p.doctor?.user?.name || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{p.diagnosis || "-"}</TableCell>
                    <TableCell>{p.items?.length || 0}</TableCell>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Write Prescription">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient" value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            options={patients.map((p: any) => ({ label: p.name, value: p.id }))} required
          />
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Medicines</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Medicine</Button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-500">Item #{i + 1}</span>
                  <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={item.medicineId}
                    onChange={(e) => updateItem(i, "medicineId", e.target.value)}
                    options={medicines.map((m: any) => ({ label: m.name, value: m.id }))}
                    required
                  />
                  <Input placeholder="Dosage" value={item.dosage} onChange={(e) => updateItem(i, "dosage", e.target.value)} required />
                  <Input placeholder="Frequency" value={item.frequency} onChange={(e) => updateItem(i, "frequency", e.target.value)} required />
                  <Input placeholder="Duration" value={item.duration} onChange={(e) => updateItem(i, "duration", e.target.value)} required />
                  <Input placeholder="Qty" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} required />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Optional notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Prescription"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
