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
import { Plus, Search, Package, AlertTriangle, Edit2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface InventoryItem {
  id: string
  itemName: string
  category: string
  quantity: number
  unitPrice: number
  supplier: string
  reorderLevel: number
}

interface FormData {
  itemName: string
  category: string
  quantity: string
  unitPrice: string
  supplier: string
  reorderLevel: string
  description: string
}

const defaultForm: FormData = {
  itemName: "",
  category: "",
  quantity: "",
  unitPrice: "",
  supplier: "",
  reorderLevel: "",
  description: "",
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [editForm, setEditForm] = useState<FormData>(defaultForm)
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setEditForm({
      itemName: item.itemName || "",
      category: item.category || "",
      quantity: item.quantity?.toString() || "",
      unitPrice: item.unitPrice?.toString() || "",
      supplier: item.supplier || "",
      reorderLevel: item.reorderLevel?.toString() || "",
      description: (item as any).description || "",
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/inventory/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          quantity: parseInt(editForm.quantity),
          unitPrice: parseFloat(editForm.unitPrice),
          reorderLevel: parseInt(editForm.reorderLevel),
        }),
      })
      if (res.ok) {
        const updated = await fetch("/api/inventory").then((r) => r.json())
        setItems(updated)
        setEditOpen(false)
        setEditItem(null)
      }
    } finally {
      setEditSubmitting(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
    if (lowStockOnly) return matchesSearch && item.quantity <= item.reorderLevel
    return matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          unitPrice: parseFloat(form.unitPrice),
          reorderLevel: parseInt(form.reorderLevel),
        }),
      })
      if (res.ok) {
        const updated = await fetch("/api/inventory").then((r) => r.json())
        setItems(updated)
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
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={lowStockOnly ? "primary" : "outline"}
          onClick={() => setLowStockOnly(!lowStockOnly)}
        >
          <AlertTriangle size={16} className="mr-2" />
          Low Stock Only
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={48} className="mb-3" />
              <p className="text-lg font-medium">
                {search || lowStockOnly ? "No items match your criteria" : "No inventory items found"}
              </p>
              <p className="text-sm mt-1">Add your first inventory item to get started</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Item Name</TableCell>
                  <TableCell header>Category</TableCell>
                  <TableCell header>Quantity</TableCell>
                  <TableCell header>Unit Price</TableCell>
                  <TableCell header>Supplier</TableCell>
                  <TableCell header>Reorder Level</TableCell>
                  <TableCell header>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.quantity <= 0
                            ? "danger"
                            : item.quantity <= item.reorderLevel
                              ? "warning"
                              : "success"
                        }
                      >
                        {item.quantity <= 0 ? "Out of Stock" : item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            id="itemName"
            placeholder="Enter item name"
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              id="category"
              placeholder="e.g. Medical Supplies"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <Input
              label="Supplier"
              id="supplier"
              placeholder="Supplier name"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quantity"
              id="quantity"
              type="number"
              min="0"
              placeholder="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <Input
              label="Unit Price"
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
            />
            <Input
              label="Reorder Level"
              id="reorderLevel"
              type="number"
              min="0"
              placeholder="0"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
              required
            />
          </div>
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
              {submitting ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Inventory Item">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Item Name" id="edit-name" value={editForm.itemName} onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" id="edit-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required />
            <Input label="Supplier" id="edit-supplier" value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Quantity" id="edit-quantity" type="number" min="0" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} required />
            <Input label="Unit Price" id="edit-price" type="number" step="0.01" min="0" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })} required />
            <Input label="Reorder Level" id="edit-reorder" type="number" min="0" value={editForm.reorderLevel} onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })} required />
          </div>
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
