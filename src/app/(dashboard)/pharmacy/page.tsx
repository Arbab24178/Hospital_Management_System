"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
} from "@/components/ui"
import { Plus, Search, Pill, PackageOpen, Edit2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Medicine {
  id: string
  name: string
  category: string
  manufacturer: string
  price: number
  stock: number
  expiryDate: string | null
}

interface FormData {
  name: string
  category: string
  manufacturer: string
  price: string
  stock: string
  expiryDate: string
  description: string
}

const defaultForm: FormData = {
  name: "",
  category: "",
  manufacturer: "",
  price: "",
  stock: "",
  expiryDate: "",
  description: "",
}

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [editForm, setEditForm] = useState<FormData>(defaultForm)
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/pharmacy")
      .then((res) => res.json())
      .then((data) => {
        setMedicines(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const openEdit = (med: Medicine) => {
    setEditItem(med)
    setEditForm({
      name: med.name || "",
      category: med.category || "",
      manufacturer: med.manufacturer || "",
      price: med.price?.toString() || "",
      stock: med.stock?.toString() || "",
      expiryDate: med.expiryDate ? med.expiryDate.slice(0, 10) : "",
      description: (med as any).description || "",
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/pharmacy/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock) }),
      })
      if (res.ok) {
        const updated = await fetch("/api/pharmacy").then((r) => r.json())
        setMedicines(updated)
        setEditOpen(false)
        setEditItem(null)
      }
    } finally {
      setEditSubmitting(false)
    }
  }

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        }),
      })
      if (res.ok) {
        const updated = await fetch("/api/pharmacy").then((r) => r.json())
        setMedicines(updated)
        setModalOpen(false)
        setForm(defaultForm)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search medicines..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <PackageOpen size={48} className="mb-3" />
              <p className="text-lg font-medium">{search ? "No medicines match your search" : "No medicines found"}</p>
              <p className="text-sm mt-1">Add your first medicine to get started</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Name</TableCell>
                  <TableCell header>Category</TableCell>
                  <TableCell header>Manufacturer</TableCell>
                  <TableCell header>Price</TableCell>
                  <TableCell header>Stock</TableCell>
                  <TableCell header>Expiry</TableCell>
                  <TableCell header>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell>{med.manufacturer}</TableCell>
                    <TableCell>{formatCurrency(med.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          med.stock <= 0 ? "danger" : med.stock <= 10 ? "warning" : "success"
                        }
                      >
                        {med.stock <= 0 ? "Out of Stock" : med.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(med)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Medicine">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Medicine Name"
            id="name"
            placeholder="Enter medicine name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              id="category"
              placeholder="e.g. Antibiotic"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <Input
              label="Manufacturer"
              id="manufacturer"
              placeholder="Manufacturer name"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              label="Stock Quantity"
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
          <Input
            label="Expiry Date"
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Medicine"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Medicine">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Medicine Name" id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" id="edit-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required />
            <Input label="Manufacturer" id="edit-manufacturer" value={editForm.manufacturer} onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" id="edit-price" type="number" step="0.01" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
            <Input label="Stock Quantity" id="edit-stock" type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} required />
          </div>
          <Input label="Expiry Date" id="edit-expiry" type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={3} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
