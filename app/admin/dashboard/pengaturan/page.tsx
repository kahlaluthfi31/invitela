"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

// ── Field definitions ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    title: "Kontak",
    fields: [
      { key: "wa_admin", label: "Nomor WhatsApp", placeholder: "628xxxxxxxxxx" },
      { key: "instagram", label: "Instagram", placeholder: "@invitela" },
    ],
  },
  {
    title: "Pembayaran",
    fields: [
      { key: "rekening_bca", label: "Rekening BCA", placeholder: "1234567890 a/n Nama" },
    ],
  },
]

type Values = Record<string, string>

// ── Inline Toast ───────────────────────────────────────────────────────────────
function Toast({ show, message, type }: { show: boolean; message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg
        text-sm font-medium transition-all duration-300
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      style={{
        backgroundColor: type === "success" ? "#D9E9CF" : "#FEE2E2",
        color: type === "success" ? "#3D6B33" : "#B91C1C",
        border: `1px solid ${type === "success" ? "rgba(150,167,141,0.4)" : "rgba(239,68,68,0.3)"}`,
      }}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PengaturanPage() {
  const [values, setValues] = useState<Values>({})
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  // Fetch all settings on mount
  useEffect(() => {
    async function fetchSettings() {
      setFetching(true)
      const { data, error } = await supabase.from("settings").select("*")
      if (!error && data) {
        const map: Values = {}
        data.forEach((row: { key: string; value: string }) => {
          map[row.key] = row.value ?? ""
        })
        setValues(map)
      }
      // Jika error (tabel belum ada / RLS), cukup tampilkan form kosong
      if (error) {
        console.warn("settings fetch:", error.message)
      }
      setFetching(false)
    }
    fetchSettings()
  }, [])

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    const rows = Object.entries(values).map(([key, value]) => ({ key, value }))
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" })
    setSaving(false)
    if (error) {
      showToast("Gagal menyimpan. Coba lagi.", "error")
    } else {
      showToast("Berhasil disimpan", "success")
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Pengaturan</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kelola kontak dan informasi pembayaran website</p>
      </div>

      {fetching ? (
        // Skeleton loader
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ backgroundColor: "rgba(150,167,141,0.1)" }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-6xl">
          {SECTIONS.map((section) => (
            <Card
              key={section.title}
              className="rounded-2xl shadow-none"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(150,167,141,0.2)",
              }}
            >
              <CardContent className="p-6">
                {/* Section title */}
                <h2
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "#96A78D" }}
                >
                  {section.title}
                </h2>

                <div className="flex flex-col gap-5">
                  {section.fields.map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <Label htmlFor={key} className="text-sm text-gray-600 font-medium">
                        {label}
                      </Label>
                      <Input
                        id={key}
                        type="text"
                        placeholder={placeholder}
                        value={values[key] ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{
                          borderColor: "rgba(150,167,141,0.35)",
                          backgroundColor: "#FAFAF8",
                        }}
                        className="focus-visible:ring-[#96A78D]/40"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-6 text-white font-medium"
              style={{ backgroundColor: "#96A78D" }}
            >
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </div>
      )}

      {/* Inline Toast */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </>
  )
}
