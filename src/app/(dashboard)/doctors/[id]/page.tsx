"use client"

import { Card, CardContent, Button, Badge, Input, Modal } from "@/components/ui"
import { ArrowLeft, Edit2, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function DoctorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${params.id}`)
        if (res.ok) setDoctor(await res.json())
      } catch (err) {
        console.error("Failed to load doctor", err)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchDoctor()
  }, [params.id])

  const openEdit = () => {
    setEditForm({
      name: doctor.user?.name || doctor.name || "",
      email: doctor.user?.email || doctor.email || "",
      phone: doctor.user?.phone || doctor.phone || "",
      password: "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      licenseNumber: doctor.licenseNumber || "",
      fee: doctor.fee?.toString() || "",
      experience: doctor.experience?.toString() || "",
    })
    setEditError("")
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSubmitting(true)
    setEditError("")
    try {
      const body: any = { ...editForm }
      if (!body.password) delete body.password
      body.fee = parseFloat(body.fee)
      body.experience = parseInt(body.experience)
      const res = await fetch(`/api/doctors/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setEditError(data.error || "Failed to update doctor")
        return
      }
      const updated = await res.json()
      setDoctor(updated)
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
        <p className="text-muted-foreground">Loading doctor details...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/doctors">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Doctors
        </Button>
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{doctor.user?.name || doctor.name}</h1>
            <Badge className={doctor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {doctor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{doctor.user?.email || doctor.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{doctor.user?.phone || doctor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-medium">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qualification</p>
              <p className="font-medium">{doctor.qualification}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium">{doctor.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultation Fee</p>
              <p className="font-medium">${doctor.fee}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{doctor.experience} years</p>
            </div>
            {doctor.appointmentCount !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="font-medium">{doctor.appointmentCount}</p>
              </div>
            )}
          </div>
          {doctor.availableDays && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Available Days</p>
              <div className="flex flex-wrap gap-2">
                {doctor.availableDays.split(",").map((day: string) => (
                  <Badge key={day} className="bg-blue-100 text-blue-800">{day}</Badge>
                ))}
              </div>
            </div>
          )}
          {doctor.availableTimeStart && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Available Time</p>
              <p className="font-medium">{doctor.availableTimeStart} - {doctor.availableTimeEnd}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={openEdit}>
          <Edit2 className="h-4 w-4 mr-1" /> Edit Doctor
        </Button>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Doctor">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <Input label="Email" id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <Input label="Password (leave blank to keep)" id="edit-password" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Specialization" id="edit-specialization" value={editForm.specialization} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} required />
            <Input label="Qualification" id="edit-qualification" value={editForm.qualification} onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="License Number" id="edit-license" value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })} required />
            <Input label="Fee ($)" id="edit-fee" type="number" value={editForm.fee} onChange={(e) => setEditForm({ ...editForm, fee: e.target.value })} required />
            <Input label="Experience (years)" id="edit-experience" type="number" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} required />
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
