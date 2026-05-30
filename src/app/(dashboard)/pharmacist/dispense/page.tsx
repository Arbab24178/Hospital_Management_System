"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, Button, Input, Badge, Select,
  Table, TableHead, TableBody, TableRow, TableCell, Modal,
} from "@/components/ui"
import { Plus, Pill, Search, Package } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function DispensePage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/prescriptions")
      if (res.ok) setPrescriptions(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = prescriptions.filter((p) =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dispense Medicines</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search prescriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-500">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Pill size={48} className="mb-3" />
              <p className="text-lg font-medium">No prescriptions to dispense</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Patient</TableCell>
                  <TableCell header>Doctor</TableCell>
                  <TableCell header>Diagnosis</TableCell>
                  <TableCell header>Items</TableCell>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.patient?.name || "-"}</TableCell>
                    <TableCell>{p.doctor?.user?.name || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{p.diagnosis || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="info">{p.items?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPrescription(p); setDetailOpen(true) }}>
                        View Items
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedPrescription(null) }} title="Prescription Details">
        {selectedPrescription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Patient</p>
                <p className="font-medium">{selectedPrescription.patient?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-medium">{selectedPrescription.doctor?.user?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Diagnosis</p>
                <p className="font-medium">{selectedPrescription.diagnosis || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDate(selectedPrescription.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Prescribed Medicines</p>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Medicine</TableCell>
                    <TableCell header>Dosage</TableCell>
                    <TableCell header>Frequency</TableCell>
                    <TableCell header>Duration</TableCell>
                    <TableCell header>Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPrescription.items?.map((item: any, i: number) => (
                    <TableRow key={item.id || i}>
                      <TableCell>{item.medicine?.name || "-"}</TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedPrescription.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => { setDetailOpen(false); setSelectedPrescription(null) }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
