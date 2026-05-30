export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  todayAppointments: number
  pendingBills: number
  monthlyRevenue: number
  occupancyRate: number
  pendingLabTests: number
  lowStockItems: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface SelectOption {
  label: string
  value: string
}
