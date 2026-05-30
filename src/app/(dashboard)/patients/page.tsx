"use client"

import { Card, CardContent, CardHeader, Button, Input, Badge, Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui"
import { Plus, Search, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const genderColors: Record<string, string> = {
  MALE: "bg-blue-100 text-blue-800",
  FEMALE: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
}

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients")
        if (res.ok) setPatients(await res.json())
      } catch (err) {
        console.error("Failed to load patients", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading patients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button onClick={() => router.push("/patients/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No patients found</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.patientId}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      <Badge className={genderColors[p.gender] || ""}>{p.gender}</Badge>
                    </TableCell>
                    <TableCell>{p.bloodGroup?.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Link href={`/patients/${p.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
