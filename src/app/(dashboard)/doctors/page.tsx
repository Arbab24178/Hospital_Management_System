"use client"

import { Card, CardContent, CardHeader, Button, Input, Badge, Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui"
import { Plus, Search, Stethoscope, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors")
        if (res.ok) setDoctors(await res.json())
      } catch (err) {
        console.error("Failed to load doctors", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const filtered = doctors.filter((d) =>
    (d.user?.name || d.name)?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Doctors</h1>
        </div>
        <Button onClick={() => router.push("/doctors/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No doctors found</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Qualification</TableCell>
                  <TableCell>License #</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.user?.name || d.name}</TableCell>
                    <TableCell>{d.specialization}</TableCell>
                    <TableCell>{d.qualification}</TableCell>
                    <TableCell>{d.licenseNumber}</TableCell>
                    <TableCell>${d.fee}</TableCell>
                    <TableCell>{d.experience} yrs</TableCell>
                    <TableCell>
                      <Badge className={d.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {d.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/doctors/${d.id}`}>
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
