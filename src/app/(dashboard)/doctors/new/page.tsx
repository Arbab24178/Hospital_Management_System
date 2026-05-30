"use client"

import { Card, CardContent, CardHeader, Button, Input, Select } from "@/components/ui"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const specializations = [
  "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology",
  "Gastroenterology", "General Surgery", "Internal Medicine", "Neurology",
  "Obstetrics & Gynecology", "Ophthalmology", "Orthopedics", "Pediatrics",
  "Psychiatry", "Pulmonology", "Radiology", "Urology",
]

export default function NewDoctorPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    specialization: "", qualification: "", licenseNumber: "",
    fee: "", experience: "",
    availableDays: [] as string[],
    availableTimeStart: "09:00", availableTimeEnd: "17:00",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const allDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fee: parseFloat(form.fee),
          experience: parseInt(form.experience),
          availableDays: form.availableDays.join(","),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create doctor")
      }

      router.push("/doctors")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/doctors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Doctor</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Doctor Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Dr. John Doe" />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="doctor@hospital.com" />
              <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Initial password" />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
              <Select label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} required options={specializations.map(s => ({ label: s, value: s }))} />
              <Input label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} required placeholder="e.g. MD, MS" />
              <Input label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required placeholder="Medical license #" />
              <Input label="Consultation Fee ($)" name="fee" type="number" min="0" step="0.01" value={form.fee} onChange={handleChange} required placeholder="0.00" />
              <Input label="Experience (years)" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} required placeholder="0" />
              <Input label="Available From" name="availableTimeStart" type="time" value={form.availableTimeStart} onChange={handleChange} required />
              <Input label="Available To" name="availableTimeEnd" type="time" value={form.availableTimeEnd} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {allDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.availableDays.includes(day)
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Doctor"}
              </Button>
              <Link href="/doctors">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
