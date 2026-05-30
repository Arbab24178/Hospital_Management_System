"use client"

import { Card, CardContent, CardHeader, Button, Input, Select } from "@/components/ui"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewPatientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create patient")
      }

      setSuccess("Patient registered successfully!")
      setTimeout(() => router.push("/patients"), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Register New Patient</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Patient Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                required
              />
              <Select
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                options={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                  { label: "Other", value: "OTHER" },
                ]}
              />
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                options={[
                  { label: "A+", value: "A_POSITIVE" },
                  { label: "A-", value: "A_NEGATIVE" },
                  { label: "B+", value: "B_POSITIVE" },
                  { label: "B-", value: "B_NEGATIVE" },
                  { label: "AB+", value: "AB_POSITIVE" },
                  { label: "AB-", value: "AB_NEGATIVE" },
                  { label: "O+", value: "O_POSITIVE" },
                  { label: "O-", value: "O_NEGATIVE" },
                ]}
              />
              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact name"
              />
              <Input
                label="Emergency Phone"
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
                placeholder="Emergency contact phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter address"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">{success}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register Patient"}
              </Button>
              <Link href="/patients">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
