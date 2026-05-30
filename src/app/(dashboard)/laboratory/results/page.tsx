"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { ClipboardList, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface LabRequest {
  id: string
  patient: { name: string; patientId: string }
  doctor: { user: { name: string } }
  test: { name: string }
  status: string
  createdAt: string
  result: string | null
  notes: string | null
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  SAMPLE_COLLECTED: "info",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
}

export default function LabResultsPage() {
  const [requests, setRequests] = useState<LabRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<LabRequest | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async (status = "") => {
    setLoading(true)
    try {
      const params = status ? `?status=${status}` : ""
      const res = await fetch(`/api/laboratory/requests${params}`)
      if (res.ok) setRequests(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const openUpdate = (req: LabRequest) => {
    setSelected(req)
    setResult(req.result || "")
    setModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/laboratory/requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, status: result ? "COMPLETED" : "IN_PROGRESS" }),
      })
      if (res.ok) {
        setModalOpen(false)
        setSelected(null)
        fetchRequests(filter)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter
    ? requests.filter((r) => r.status === filter)
    : requests

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
      </div>

      <div className="flex gap-2">
        {["", "PENDING", "SAMPLE_COLLECTED", "IN_PROGRESS", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); fetchRequests(s) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-primary-50 text-primary-700 border border-primary-500" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList size={48} className="mb-3" />
              <p className="text-lg font-medium">No lab requests found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Test</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Result</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.patient?.name || "-"}</TableCell>
                    <TableCell>{req.test?.name || "-"}</TableCell>
                    <TableCell>{req.doctor?.user?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[req.status] || "default"}>{req.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(req.createdAt)}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.result || "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openUpdate(req)} disabled={req.status === "CANCELLED"}>
                        {req.result ? "Update" : "Add Result"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Lab Result">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Test: <span className="font-medium text-gray-900">{selected?.test?.name}</span></p>
            <p className="text-sm text-gray-500 mb-1">Patient: <span className="font-medium text-gray-900">{selected?.patient?.name}</span></p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Result</label>
            <textarea
              rows={4}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter test results..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Result"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
