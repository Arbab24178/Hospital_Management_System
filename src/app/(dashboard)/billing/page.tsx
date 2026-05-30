"use client"

import { Card, CardContent, CardHeader, Button, Input, Select, Badge, Table, TableHead, TableBody, TableRow, TableCell, Modal } from "@/components/ui"
import { Plus, Search, Receipt, DollarSign, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"

const statusVariant: Record<string, string> = {
  PENDING: "warning",
  PARTIAL: "warning",
  PAID: "success",
  CANCELLED: "danger",
  REFUNDED: "default",
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const [formPatientId, setFormPatientId] = useState("")
  const [formTotalAmount, setFormTotalAmount] = useState("")
  const [formItems, setFormItems] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editInvoice, setEditInvoice] = useState<any>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editPaid, setEditPaid] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [invRes, patRes] = await Promise.all([
        fetch("/api/billing"),
        fetch("/api/patients"),
      ])
      if (invRes.ok) setInvoices(await invRes.json())
      if (patRes.ok) setPatients(await patRes.json())
    } catch (err) {
      console.error("Failed to load data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openEdit = (inv: any) => {
    setEditInvoice(inv)
    setEditStatus(inv.status)
    setEditPaid(inv.paidAmount?.toString() || "0")
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editInvoice) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/billing/${editInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, paidAmount: parseFloat(editPaid) }),
      })
      if (res.ok) fetchData()
      setEditOpen(false)
      setEditInvoice(null)
    } finally {
      setEditSubmitting(false)
    }
  }

  const filtered = invoices.filter((inv) => {
    if (filterStatus && inv.status !== filterStatus) return false
    if (search && !inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) && !inv.patientName?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSum = filtered.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formPatientId,
          totalAmount: parseFloat(formTotalAmount),
          items: formItems,
          notes: formNotes,
        }),
      })
      if (res.ok) {
        setModalOpen(false)
        setFormPatientId("")
        setFormTotalAmount("")
        setFormItems("")
        setFormNotes("")
        fetchData()
      }
    } catch (err) {
      console.error("Failed to create invoice", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading billing...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Billing</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice or patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56"
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: "All Statuses", value: "" },
                { label: "Pending", value: "PENDING" },
                { label: "Paid", value: "PAID" },
                { label: "Partial", value: "PARTIAL" },
                { label: "Cancelled", value: "CANCELLED" },
                { label: "Refunded", value: "REFUNDED" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices found</p>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Paid Amount</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>&nbsp;</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((inv: any) => {
                    const due = (inv.totalAmount || 0) - (inv.paidAmount || 0)
                    return (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.invoiceNo}</TableCell>
                        <TableCell>{inv.patientName || inv.patientId}</TableCell>
                        <TableCell>{formatCurrency(inv.totalAmount || 0)}</TableCell>
                        <TableCell>{formatCurrency(inv.paidAmount || 0)}</TableCell>
                        <TableCell>{formatCurrency(due)}</TableCell>
                        <TableCell>
                          <Badge variant={(statusVariant[inv.status] as any) || "default"}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(inv.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(inv)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-lg font-semibold">{formatCurrency(totalSum)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient"
            value={formPatientId}
            onChange={(e) => setFormPatientId(e.target.value)}
            options={patients.map((p: any) => ({ label: p.name || p.id, value: p.id }))}
            required
          />
          <Input
            label="Total Amount"
            type="number"
            step="0.01"
            value={formTotalAmount}
            onChange={(e) => setFormTotalAmount(e.target.value)}
            required
          />
          <Input
            label="Items"
            value={formItems}
            onChange={(e) => setFormItems(e.target.value)}
            placeholder="e.g. Consultation - $100, Lab - $50"
          />
          <Input
            label="Notes"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Invoice">
        <form onSubmit={handleEditSave} className="space-y-4">
          {editInvoice && (
            <div className="text-sm text-gray-600 space-y-1 mb-2">
              <p><strong>Invoice:</strong> {editInvoice.invoiceNo}</p>
              <p><strong>Patient:</strong> {editInvoice.patientName || editInvoice.patientId}</p>
              <p><strong>Total:</strong> {formatCurrency(editInvoice.totalAmount || 0)}</p>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <Input label="Paid Amount" id="edit-paid" type="number" step="0.01" min="0" value={editPaid} onChange={(e) => setEditPaid(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Updating..." : "Update Invoice"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
