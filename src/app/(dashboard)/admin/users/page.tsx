"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
} from "@/components/ui"
import { Plus, Search, UserCog, Shield, ShieldOff, Edit2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  isActive: boolean
  createdAt: string
}

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "NURSE", label: "Nurse" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
]

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  DOCTOR: "bg-blue-100 text-blue-800",
  NURSE: "bg-green-100 text-green-800",
  RECEPTIONIST: "bg-purple-100 text-purple-800",
  PHARMACIST: "bg-yellow-100 text-yellow-800",
  ACCOUNTANT: "bg-orange-100 text-orange-800",
  LAB_TECHNICIAN: "bg-cyan-100 text-cyan-800",
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PHARMACIST: "Pharmacist",
  ACCOUNTANT: "Accountant",
  LAB_TECHNICIAN: "Lab Technician",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "", phone: "" })
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", phone: "", password: "", isActive: true })
  const [editSubmitting, setEditSubmitting] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (res.ok) {
          setModalOpen(false)
          setForm({ name: "", email: "", password: "", role: "", phone: "" })
          fetchUsers()
        }
      })
      .catch(console.error)
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, phone: user.phone || "", password: "", isActive: user.isActive })
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setEditSubmitting(true)
    try {
      const body: any = { ...editForm }
      if (!body.password) delete body.password
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        fetchUsers()
        setEditOpen(false)
        setEditUser(null)
      }
    } finally {
      setEditSubmitting(false)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all system users</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchUsers}>
            <UserCog className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-muted-foreground text-lg">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <p className="text-muted-foreground text-lg">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Name</TableCell>
                  <TableCell header>Email</TableCell>
                  <TableCell header>Role</TableCell>
                  <TableCell header>Phone</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Created</TableCell>
                  <TableCell header>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role] || "bg-gray-100 text-gray-800"}`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <ShieldOff className="mr-1 h-3 w-3" />
                        )}
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            id="name"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Select
            label="Role"
            id="role"
            options={roleOptions}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          />
          <Input
            label="Phone"
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <Input label="Email" id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" id="edit-role" value={editForm.role} onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })} options={roleOptions} required />
            <Input label="Phone" id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </div>
          <Input label="New Password (leave blank to keep)" id="edit-password" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
