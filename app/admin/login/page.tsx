"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(true)
      setLoading(false)
      return
    }

    router.push("/admin/dashboard")
    router.refresh()
    setLoading(false)
  }

  return (
    <div
      style={{ backgroundColor: "#FAF9EE" }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      {/* Logo */}
      <p
        className="font-serif text-3xl font-semibold tracking-wide mb-8 select-none"
        style={{ color: "#96A78D" }}
      >
        Invitela
      </p>

      {/* Card */}
      <Card
        className="w-full max-w-sm rounded-2xl shadow-sm border-0"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(150,167,141,0.2)",
        }}
      >
        <CardContent className="p-8">
          <h1 className="text-lg font-semibold text-gray-800 mb-1">
            Masuk ke Dashboard
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Akses khusus super admin Invitela
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm text-gray-600">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  borderColor: "rgba(150,167,141,0.35)",
                  backgroundColor: "#FAFAF8",
                }}
                className="focus-visible:ring-[#96A78D]/40"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm text-gray-600">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  borderColor: "rgba(150,167,141,0.35)",
                  backgroundColor: "#FAFAF8",
                }}
                className="focus-visible:ring-[#96A78D]/40"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 text-white font-medium transition-opacity"
              style={{ backgroundColor: "#96A78D" }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 text-center -mt-1">
                Email atau password salah
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
