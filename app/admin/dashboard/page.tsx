"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Wallet,
  TrendingUp,
  ClipboardList,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  PEMBAYARAN_STATUS_STYLES,
  type PembayaranStatus,
} from "@/lib/pesanan-sections"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  value,
  loading,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  sublabel?: string
  value: string | number
  loading: boolean
}) {
  return (
    <Card
      className="rounded-xl shadow-none"
      style={{
        border: "1px solid rgba(150,167,141,0.18)",
        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
      }}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 48, height: 48, backgroundColor: iconBg }}
        >
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="h-7 w-28 rounded animate-pulse" style={{ backgroundColor: "rgba(150,167,141,0.12)" }} />
          ) : (
            <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{value}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
          {sublabel && <p className="text-[10px] text-gray-300 leading-tight">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [pesananList, setPesananList] = useState<PesananWithTemplate[]>([])
  const [loading, setLoading] = useState(true)

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

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPesanan = pesananList.length
  const pesananLunas = pesananList.filter((p) => p.pembayaran === "lunas")
  const pesananDP = pesananList.filter((p) => p.pembayaran === "baru_dp")
  const pesananBelumBayar = pesananList.filter((p) => p.pembayaran === "belum_bayar")

  const totalPendapatan = pesananLunas.reduce(
    (sum, p) => sum + (p.templates?.harga ?? 0),
    0
  )
  const pendapatanHariIni = pesananLunas
    .filter((p) => isToday(p.created_at))
    .reduce((sum, p) => sum + (p.templates?.harga ?? 0), 0)

  // Top 5 templates
  const templateCounts: Record<string, { nama: string; count: number }> = {}
  pesananList.forEach((p) => {
    if (p.templates?.nama) {
      const key = p.templates.nama
      if (!templateCounts[key]) templateCounts[key] = { nama: key, count: 0 }
      templateCounts[key].count++
    }
  })
  const topTemplates = Object.values(templateCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const maxTemplateCount = topTemplates.length > 0 ? topTemplates[0].count : 1

  // Latest 5
  const latestPesanan = pesananList.slice(0, 5)

  // Today
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div>
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      {/* ── Row 1: Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Wallet}
          iconBg="#D9E9CF"
          iconColor="#3D6B33"
          label="Total Pendapatan"
          sublabel="Total dari pesanan lunas"
          value={formatRupiah(totalPendapatan)}
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          iconBg="#DBEAFE"
          iconColor="#1D4ED8"
          label="Pendapatan Hari Ini"
          value={formatRupiah(pendapatanHariIni)}
          loading={loading}
        />
        <StatCard
          icon={ClipboardList}
          iconBg="#F7E8DB"
          iconColor="#C8956C"
          label="Total Pesanan"
          value={totalPesanan}
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          iconBg="#D9E9CF"
          iconColor="#3D6B33"
          label="Pesanan Lunas"
          value={pesananLunas.length}
          loading={loading}
        />
      </div>

      {/* ── Row 2: Pesanan Terbaru + Template Terpopuler ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Pesanan Terbaru (2/3) */}
        <Card
          className="lg:col-span-2 rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-0">
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
            >
              <h2 className="text-sm font-semibold text-gray-700">Pesanan Terbaru</h2>
              <Link
                href="/admin/dashboard/pesanan"
                className="text-xs font-medium text-[#96A78D] hover:text-[#3D6B33] transition-colors inline-flex items-center gap-1"
              >
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="px-5 py-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded animate-pulse"
                    style={{ backgroundColor: "rgba(150,167,141,0.08)" }}
                  />
                ))}
              </div>
            ) : latestPesanan.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-400">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="text-[11px] text-gray-400 uppercase tracking-wider"
                      style={{ backgroundColor: "#FAF9EE" }}
                    >
                      <th className="text-left px-5 py-2.5 font-semibold">Customer</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Template</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Pembayaran</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "rgba(150,167,141,0.08)" }}>
                    {latestPesanan.map((p) => {
                      const pembayaranKey = (p.pembayaran ?? "belum_bayar") as PembayaranStatus
                      const pStyle = PEMBAYARAN_STATUS_STYLES[pembayaranKey] ?? PEMBAYARAN_STATUS_STYLES.belum_bayar
                      return (
                        <tr key={p.id} className="hover:bg-[#FAF9EE]/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-800 truncate max-w-[160px]">
                              {p.nama_customer}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-gray-500 truncate max-w-[140px]">
                            {p.templates?.nama ?? "—"}
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              className="border-0 text-[10px]"
                              style={{ backgroundColor: pStyle.bg, color: pStyle.color }}
                            >
                              {pStyle.label}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(p.created_at)}
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

        {/* Template Terpopuler (1/3) */}
        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-0">
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
            >
              <h2 className="text-sm font-semibold text-gray-700">Template Terpopuler</h2>
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
            ) : topTemplates.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-400">Belum ada data</p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                {topTemplates.map((t, idx) => {
                  const widthPercent = Math.max(
                    (t.count / maxTemplateCount) * 100,
                    8
                  )
                  return (
                    <div key={t.nama}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate max-w-[160px]">
                          <span className="text-gray-300 text-xs mr-1.5">{idx + 1}.</span>
                          {t.nama}
                        </span>
                        <Badge
                          className="border-0 text-[10px] shrink-0 ml-2"
                          style={{ backgroundColor: "#D9E9CF", color: "#3D6B33" }}
                        >
                          {t.count} pesanan
                        </Badge>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: "rgba(150,167,141,0.12)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: "#96A78D",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Status Pembayaran ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Belum Bayar */}
        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#F3F4F6" }}
            >
              <span className="text-lg font-bold" style={{ color: "#6B7280" }}>
                {loading ? "–" : pesananBelumBayar.length}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Belum Bayar</p>
              <Badge
                className="border-0 text-[10px] mt-1"
                style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
              >
                Menunggu pembayaran
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Baru DP */}
        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#FEF9C3" }}
            >
              <span className="text-lg font-bold" style={{ color: "#A16207" }}>
                {loading ? "–" : pesananDP.length}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Baru DP</p>
              <Badge
                className="border-0 text-[10px] mt-1"
                style={{ backgroundColor: "#FEF9C3", color: "#A16207" }}
              >
                Menunggu pelunasan
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lunas */}
        <Card
          className="rounded-xl shadow-none"
          style={{ border: "1px solid rgba(150,167,141,0.18)" }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 42, height: 42, backgroundColor: "#D9E9CF" }}
            >
              <span className="text-lg font-bold" style={{ color: "#3D6B33" }}>
                {loading ? "–" : pesananLunas.length}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Lunas</p>
              <Badge
                className="border-0 text-[10px] mt-1"
                style={{ backgroundColor: "#D9E9CF", color: "#3D6B33" }}
              >
                Pembayaran selesai
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
