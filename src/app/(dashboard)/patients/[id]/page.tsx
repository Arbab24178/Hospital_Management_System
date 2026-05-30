"use client"

import { Card, CardContent, CardHeader, Button, Badge, Input, Table, TableHead, TableBody, TableRow, TableCell, Modal } from "@/components/ui"
import { ArrowLeft, Edit2, Trash2, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"

const genderColors: Record<string, string> = {
  MALE: "bg-blue-100 text-blue-800",
  FEMALE: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-cyan-100 text-cyan-800",
  CHECKED_IN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
}

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${params.id}`)
        if (res.ok) setPatient(await res.json())
      } catch (err) {
        console.error("Failed to load patient", err)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchPatient()
  }, [params.id])

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A"
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const openEdit = () => {
    setEditForm({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      dob: patient.dob ? patient.dob.slice(0, 10) : "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
    })
    setEditError("")
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSubmitting(true)
    setEditError("")
    try {
      const res = await fetch(`/api/patients/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) {
        const data = await res.json()
        setEditError(data.error || "Failed to update patient")
        return
      }
      const updated = await res.json()
      setPatient(updated)
      setEditOpen(false)
    } catch {
      setEditError("An error occurred")
    } finally {
      setEditSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading patient details...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Edit2 className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="danger" size="sm">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patient.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{calculateAge(patient.dob)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <Badge className={genderColors[patient.gender] || ""}>{patient.gender}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{patient.bloodGroup?.replace(/_/g, " ") || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{patient.address || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Emergency Contact</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Contact Name</p>
              <p className="font-medium">{patient.emergencyContact || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Phone</p>
              <p className="font-medium">{patient.emergencyPhone || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Appointments</h2>
        </CardHeader>
        <CardContent>
          {patient.appointments && patient.appointments.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.appointments.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                    <TableCell>{a.doctor?.user?.name || a.doctor?.name || a.doctorId}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[a.status] || ""}>{a.status}</Badge>
                    </TableCell>
                    <TableCell>{a.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No appointments found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Invoices</h2>
        </CardHeader>
        <CardContent>
          {patient.invoices && patient.invoices.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoiceNo}</TableCell>
                    <TableCell>${inv.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[inv.status] || ""}>{inv.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No invoices found</p>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Patient">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <Input label="Email" id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
            <Input label="Date of Birth" id="edit-dob" type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">Select...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select value={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">Select...</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Emergency Contact" id="edit-emergency-contact" value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
            <Input label="Emergency Phone" id="edit-emergency-phone" value={editForm.emergencyPhone} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} />
          </div>
          {editError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{editError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={editSubmitting}>
              <Save className="h-4 w-4 mr-1" /> {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
