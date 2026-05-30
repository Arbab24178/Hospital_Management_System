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
import { Plus, Microscope, ClipboardList } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Test {
  id: string
  name: string
  category: string
  price: number
  normalRange: string
}

interface LabRequest {
  id: string
  patient: string
  doctor: string
  test: string
  status: string
  date: string
}

interface Patient {
  id: string
  name: string
}

interface Doctor {
  id: string
  name: string
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  SAMPLE_COLLECTED: "info",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
}

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "requests">("catalog")
  const [tests, setTests] = useState<Test[]>([])
  const [requests, setRequests] = useState<LabRequest[]>([])
  const [loading, setLoading] = useState(true)

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  const [testModal, setTestModal] = useState(false)
  const [requestModal, setRequestModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [testForm, setTestForm] = useState({
    name: "",
    category: "",
    price: "",
    normalRange: "",
    description: "",
  })

  const [requestForm, setRequestForm] = useState({
    patientId: "",
    doctorId: "",
    testId: "",
    notes: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/laboratory").then((r) => r.json()),
      fetch("/api/laboratory/requests?status=PENDING").then((r) => r.json()),
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/doctors").then((r) => r.json()),
    ])
      .then(([testsData, requestsData, patientsData, doctorsData]) => {
        setTests(testsData)
        setRequests(requestsData)
        setPatients(patientsData)
        setDoctors(doctorsData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statusBadge = (status: string) => {
    const variant = (statusVariants[status] || "default") as "success" | "warning" | "danger" | "info" | "default"
    return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>
  }

  const handleNewTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/laboratory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testForm, price: parseFloat(testForm.price) }),
      })
      if (res.ok) {
        const data = await fetch("/api/laboratory").then((r) => r.json())
        setTests(data)
        setTestModal(false)
        setTestForm({ name: "", category: "", price: "", normalRange: "", description: "" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/laboratory/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      })
      if (res.ok) {
        const data = await fetch("/api/laboratory/requests?status=PENDING").then((r) => r.json())
        setRequests(data)
        setRequestModal(false)
        setRequestForm({ patientId: "", doctorId: "", testId: "", notes: "" })
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
        <h1 className="text-2xl font-bold text-gray-900">Laboratory</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setTestModal(true)}>
            <Plus size={16} className="mr-2" />
            New Test
          </Button>
          <Button onClick={() => setRequestModal(true)}>
            <ClipboardList size={16} className="mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "catalog"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("catalog")}
        >
          <Microscope size={16} className="inline mr-2" />
          Test Catalog
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "requests"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          <ClipboardList size={16} className="inline mr-2" />
          Lab Requests
        </button>
      </div>

      {activeTab === "catalog" && (
        <Card>
          <CardContent className="p-0">
            {tests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Microscope size={48} className="mb-3" />
                <p className="text-lg font-medium">No tests in catalog</p>
                <p className="text-sm mt-1">Add your first test to get started</p>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Name</TableCell>
                    <TableCell header>Category</TableCell>
                    <TableCell header>Price</TableCell>
                    <TableCell header>Normal Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.category}</TableCell>
                      <TableCell>{formatCurrency(test.price)}</TableCell>
                      <TableCell>{test.normalRange}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "requests" && (
        <Card>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ClipboardList size={48} className="mb-3" />
                <p className="text-lg font-medium">No pending requests</p>
                <p className="text-sm mt-1">Create a new lab request to get started</p>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Patient</TableCell>
                    <TableCell header>Doctor</TableCell>
                    <TableCell header>Test</TableCell>
                    <TableCell header>Status</TableCell>
                    <TableCell header>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.patient}</TableCell>
                      <TableCell>{req.doctor}</TableCell>
                      <TableCell>{req.test}</TableCell>
                      <TableCell>{statusBadge(req.status)}</TableCell>
                      <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title="Add New Test">
        <form onSubmit={handleNewTest} className="space-y-4">
          <Input
            label="Test Name"
            id="testName"
            placeholder="Enter test name"
            value={testForm.name}
            onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              id="testCategory"
              placeholder="e.g. Hematology"
              value={testForm.category}
              onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
              required
            />
            <Input
              label="Price"
              id="testPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={testForm.price}
              onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
              required
            />
          </div>
          <Input
            label="Normal Range"
            id="normalRange"
            placeholder="e.g. 4.0-11.0 x10³/µL"
            value={testForm.normalRange}
            onChange={(e) => setTestForm({ ...testForm, normalRange: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label htmlFor="testDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="testDescription"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Optional description"
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setTestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Test"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="New Lab Request">
        <form onSubmit={handleNewRequest} className="space-y-4">
          <Select
            label="Patient"
            id="patientId"
            options={patients.map((p) => ({ label: p.name, value: p.id }))}
            value={requestForm.patientId}
            onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
            required
          />
          <Select
            label="Doctor"
            id="doctorId"
            options={doctors.map((d) => ({ label: d.name, value: d.id }))}
            value={requestForm.doctorId}
            onChange={(e) => setRequestForm({ ...requestForm, doctorId: e.target.value })}
            required
          />
          <Select
            label="Test"
            id="testId"
            options={tests.map((t) => ({ label: t.name, value: t.id }))}
            value={requestForm.testId}
            onChange={(e) => setRequestForm({ ...requestForm, testId: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label htmlFor="requestNotes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="requestNotes"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Optional notes"
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setRequestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
