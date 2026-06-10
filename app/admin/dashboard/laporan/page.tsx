"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Wallet,
  CalendarDays,
  CheckCircle,
  XCircle,
  ClipboardList,
  Check,
  Minus,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  PEMBAYARAN_STATUS_OPTIONS,
  PEMBAYARAN_STATUS_STYLES,
  type PembayaranStatus,
} from "@/lib/pesanan-sections"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────────────
type PesananWithTemplate = {
  id: string
  slug: string
  nama_customer: string
  wa_customer: string
  status: string
  pembayaran: PembayaranStatus
  created_at: string
  templates: {
    nama: string
    harga: number
  } | null
}

type FilterStatus = "semua" | PembayaranStatus

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function toDateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDateLong(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Filter Buttons ─────────────────────────────────────────────────────────────
const FILTER_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "belum_bayar", label: "Belum Bayar" },
  { key: "baru_dp", label: "Baru DP" },
  { key: "lunas", label: "Lunas" },
]

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LaporanPage() {
  const [pesananList, setPesananList] = useState<PesananWithTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>("semua")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("pesanan")
      .select("*, templates(nama, harga)")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPesananList(data as PesananWithTemplate[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Derived Data ─────────────────────────────────────────────────────────
  const totalPesanan = pesananList.length
  const pesananLunas = pesananList.filter((p) => p.pembayaran === "lunas")
  const pesananBelumBayar = pesananList.filter((p) => p.pembayaran === "belum_bayar")

  const totalPendapatan = pesananLunas.reduce(
    (sum, p) => sum + (p.templates?.harga ?? 0),
    0
  )

  // Filtered list for table
  const filteredList =
    filter === "semua"
      ? pesananList
      : pesananList.filter((p) => p.pembayaran === filter)

  // Top 5 days with most orders
  const dayCounts: Record<string, number> = {}
  pesananList.forEach((p) => {
    const key = toDateKey(p.created_at)
    dayCounts[key] = (dayCounts[key] ?? 0) + 1
  })
  const topDays = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div>
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Laporan</h1>
        <p className="text-sm text-gray-400 mt-0.5">Ringkasan penjualan dan laporan pesanan</p>
      </div>

      {/* ── Card 1: Total Pendapatan ─────────────────────────────────── */}
      <Card
        className="rounded-2xl shadow-none mb-6"
        style={{
          background: "linear-gradient(135deg, #D9E9CF 0%, #EFF6EC 100%)",
          border: "1px solid rgba(150,167,141,0.25)",
        }}
      >
        <CardContent className="p-6 flex items-center gap-5">
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 56, height: 56, backgroundColor: "rgba(61,107,51,0.15)" }}
          >
            <Wallet size={26} style={{ color: "#3D6B33" }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#3D6B33" }}>
              Total Pendapatan
            </p>
            {loading ? (
              <div className="h-9 w-48 rounded animate-pulse" style={{ backgroundColor: "rgba(61,107,51,0.12)" }} />
            ) : (
              <p className="text-3xl font-bold" style={{ color: "#1a1a1a" }}>
                {formatRupiah(totalPendapatan)}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: "#6B8F63" }}>
              Dari {pesananLunas.length} pesanan yang sudah lunas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 4: Ringkasan (3 angka) ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#F7E8DB" }}
            >
              <ClipboardList size={20} style={{ color: "#C8956C" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "–" : totalPesanan}</p>
              <p className="text-xs text-gray-400">Total Pesanan</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#D9E9CF" }}
            >
              <CheckCircle size={20} style={{ color: "#3D6B33" }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#3D6B33" }}>
                {loading ? "–" : pesananLunas.length}
              </p>
              <p className="text-xs text-gray-400">Sudah Lunas</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#FEE2E2" }}
            >
              <XCircle size={20} style={{ color: "#B91C1C" }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#B91C1C" }}>
                {loading ? "–" : pesananBelumBayar.length}
              </p>
              <p className="text-xs text-gray-400">Belum Bayar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Card 2: Tabel Laporan Penjualan ──────────────────────────── */}
      <Card
        className="rounded-xl shadow-none mb-6"
        style={{ border: "1px solid rgba(150,167,141,0.18)" }}
      >
        <CardContent className="p-0">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
          >
            <h2 className="text-sm font-semibold text-gray-700">Laporan Penjualan</h2>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key)}
                  className="text-xs h-7 px-3"
                  style={
                    filter === key
                      ? { backgroundColor: "#96A78D", color: "#fff", borderColor: "#96A78D" }
                      : { borderColor: "rgba(150,167,141,0.3)", color: "#6B7280" }
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded animate-pulse"
                  style={{ backgroundColor: "rgba(150,167,141,0.08)" }}
                />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-400">Tidak ada data untuk filter ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr
                    className="text-[11px] text-gray-400 uppercase tracking-wider"
                    style={{ backgroundColor: "#FAF9EE" }}
                  >
                    <th className="text-left px-5 py-2.5 font-semibold w-10">No</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Tanggal</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Customer</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Template</th>
                    <th className="text-right px-3 py-2.5 font-semibold">Harga</th>
                    <th className="text-center px-3 py-2.5 font-semibold">Pembayaran</th>
                    <th className="text-center px-3 py-2.5 font-semibold w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(150,167,141,0.08)" }}>
                  {filteredList.map((p, idx) => {
                    const pembayaranKey = (p.pembayaran ?? "belum_bayar") as PembayaranStatus
                    const pStyle =
                      PEMBAYARAN_STATUS_STYLES[pembayaranKey] ??
                      PEMBAYARAN_STATUS_STYLES.belum_bayar
                    const isLunas = pembayaranKey === "lunas"
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF9EE]/50 transition-colors">
                        <td className="px-5 py-3 text-gray-300 text-xs">{idx + 1}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-800 truncate max-w-[160px]">
                            {p.nama_customer}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-gray-500 truncate max-w-[140px]">
                          {p.templates?.nama ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-700 whitespace-nowrap">
                          {p.templates?.harga != null
                            ? formatRupiah(p.templates.harga)
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge
                            className="border-0 text-[10px]"
                            style={{ backgroundColor: pStyle.bg, color: pStyle.color }}
                          >
                            {pStyle.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {isLunas ? (
                            <Check size={16} className="inline-block" style={{ color: "#3D6B33" }} />
                          ) : (
                            <Minus size={16} className="inline-block" style={{ color: "#D1D5DB" }} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Hari Terbanyak Pesanan ───────────────────────────── */}
      <Card
        className="rounded-xl shadow-none"
        style={{ border: "1px solid rgba(150,167,141,0.18)" }}
      >
        <CardContent className="p-0">
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
          >
            <CalendarDays size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Hari Terbanyak Pesanan</h2>
          </div>

          {loading ? (
            <div className="px-5 py-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded animate-pulse"
                  style={{ backgroundColor: "rgba(150,167,141,0.08)" }}
                />
              ))}
            </div>
          ) : topDays.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-400">Belum ada data</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(150,167,141,0.08)" }}>
              {topDays.map(([dateKey, count], idx) => (
                <div
                  key={dateKey}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#FAF9EE]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-5 text-center"
                      style={{ color: idx === 0 ? "#3D6B33" : "#9CA3AF" }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700">{formatDateLong(dateKey)}</span>
                  </div>
                  <Badge
                    className="border-0 text-[10px]"
                    style={{
                      backgroundColor: idx === 0 ? "#D9E9CF" : "#F3F4F6",
                      color: idx === 0 ? "#3D6B33" : "#6B7280",
                    }}
                  >
                    {count} pesanan
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
