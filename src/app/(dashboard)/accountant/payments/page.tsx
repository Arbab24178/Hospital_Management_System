"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Select, Badge,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { Plus, DollarSign, Search } from "lucide-react"
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils"

const modeOptions = [
  { label: "Cash", value: "CASH" },
  { label: "Card", value: "CARD" },
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Insurance", value: "INSURANCE" },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    invoiceId: "", amount: "", mode: "CASH", transactionId: "", notes: "",
  })

  const fetchData = async () => {
    try {
      const [payRes, invRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/billing?status=PENDING&status=PARTIAL"),
      ])
      if (payRes.ok) setPayments(await payRes.json())
      if (invRes.ok) setInvoices(await invRes.json())
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
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      if (res.ok) {
        setModalOpen(false)
        setForm({ invoiceId: "", amount: "", mode: "CASH", transactionId: "", notes: "" })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = payments.filter((p) =>
    p.invoice?.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice?.invoiceNo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by invoice or patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <DollarSign size={48} className="mb-3" />
              <p className="text-lg font-medium">No payments recorded</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Invoice</TableCell>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Amount</TableCell>
                  <TableCell header>Mode</TableCell>
                  <TableCell header>Transaction ID</TableCell>
                  <TableCell header>Received By</TableCell>
                  <TableCell header>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.invoice?.invoiceNo || "-"}</TableCell>
                    <TableCell>{p.invoice?.patient?.name || "-"}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="info">{p.mode.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{p.transactionId || "-"}</TableCell>
                    <TableCell>{p.receivedBy || "-"}</TableCell>
                    <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Invoice"
            value={form.invoiceId}
            onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
            options={invoices.map((inv: any) => ({
              label: `${inv.invoiceNo} - ${inv.patient?.name || inv.patientId} (Due: ${formatCurrency((inv.totalAmount || 0) - (inv.paidAmount || 0))})`,
              value: inv.id,
            }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount ($)" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
            <Select label="Payment Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} options={modeOptions} required />
          </div>
          <Input label="Transaction ID" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder="Optional ref number" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Recording..." : "Record Payment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
