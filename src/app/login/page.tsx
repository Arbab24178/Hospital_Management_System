"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Card, CardContent } from "@/components/ui"
import { Carousel } from "@/components/ui/carousel"
import { Stethoscope, HeartPulse, Ambulance, Activity, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const slides = [
    { icon: <Stethoscope size={32} />, title: "Expert Care", description: "Connecting you with top healthcare professionals" },
    { icon: <HeartPulse size={32} />, title: "24/7 Monitoring", description: "Round-the-clock patient vitals and records" },
    { icon: <Ambulance size={32} />, title: "Emergency Ready", description: "Instant access to critical patient information" },
    { icon: <Activity size={32} />, title: "Smart Analytics", description: "Data-driven insights for better outcomes" },
    { icon: <ShieldCheck size={32} />, title: "Secure & Compliant", description: "HIPAA-compliant management system" },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-red-100 p-4">
      <div className="w-full max-w-md animate-fade-in-up opacity-0 [animation-fill-mode:forwards] space-y-6">
        <Carousel slides={slides} />
        <Card>
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 animate-pulse-heart">
              <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MediCore HMS</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="admin@medicore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><strong>Admin:</strong> admin@medicore.com / admin123</p>
              <p><strong>Doctor:</strong> doctor@medicore.com / doctor123</p>
              <p><strong>Receptionist:</strong> reception@medicore.com / reception123</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
