"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  PESANAN_SECTION_LABELS,
  PESANAN_STATUS_OPTIONS,
  PESANAN_STATUS_STYLES,
  defaultSectionData,
  type PesananStatus,
  type PesananSectionType,
} from "@/lib/pesanan-sections"
import {
  PesananSectionFormFields,
  type SectionRecord,
} from "@/components/admin/pesanan-section-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type PesananDetail = {
  id: string
  template_id: string | null
  slug: string
  nama_customer: string
  wa_customer: string
  status: PesananStatus
  dp_paid: boolean
  pelunasan_paid: boolean
  created_at: string
  templates: {
    id: string
    nama: string
    slug: string
    thumbnail: string | null
    harga: number
  } | null
}

const inputStyle = { borderColor: "rgba(150,167,141,0.35)", backgroundColor: "#FAFAF8" }

const NO_FORM_SECTIONS: PesananSectionType[] = ["buka_undangan", "ucapan_doa", "penutup"]

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export default function PesananDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [pesanan, setPesanan] = useState<PesananDetail | null>(null)
  const [sections, setSections] = useState<SectionRecord[]>([])
  const [statusDraft, setStatusDraft] = useState<PesananStatus>("baru")
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SectionRecord>>({})
  const [fetching, setFetching] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingSection, setSavingSection] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setFetching(true)
    const [{ data: p, error: pErr }, { data: s, error: sErr }] = await Promise.all([
      supabase.from("pesanan").select("*, templates(*)").eq("id", id).single(),
      supabase.from("pesanan_sections").select("*").eq("pesanan_id", id).order("urutan"),
    ])

    if (pErr || !p) {
      console.warn("pesanan detail:", pErr?.message)
      setFetching(false)
      return
    }

    const pesananData = p as PesananDetail
    setPesanan(pesananData)
    setStatusDraft(pesananData.status)

    const sectionList = (s ?? []) as SectionRecord[]
    setSections(sectionList)
    setSectionDrafts(
      Object.fromEntries(
        sectionList.map((sec) => [
          sec.id,
          {
            ...sec,
            data: { ...defaultSectionData(sec.section_type), ...sec.data },
          },
        ])
      )
    )
    setFetching(false)
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleUpdateStatus() {
    if (!pesanan) return
    setSavingStatus(true)
    const { error } = await supabase
      .from("pesanan")
      .update({ status: statusDraft })
      .eq("id", pesanan.id)
      .select("id")

    setSavingStatus(false)
    if (error) {
      showToast(`Gagal update status: ${error.message}`, "error")
    } else {
      setPesanan((prev) => (prev ? { ...prev, status: statusDraft } : prev))
      showToast("Status berhasil diperbarui", "success")
    }
  }

  function updateSectionDraft(sectionId: string, patch: Partial<SectionRecord>) {
    setSectionDrafts((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...patch },
    }))
  }

  async function handleToggleAktif(sectionId: string, aktif: boolean) {
    updateSectionDraft(sectionId, { aktif })
    const { error } = await supabase
      .from("pesanan_sections")
      .update({ aktif })
      .eq("id", sectionId)

    if (error) {
      showToast(`Gagal menyimpan status section: ${error.message}`, "error")
      fetchData()
    } else {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, aktif } : s))
      )
    }
  }

  async function handleSaveSection(sectionId: string) {
    const draft = sectionDrafts[sectionId]
    if (!draft) return

    setSavingSection((prev) => ({ ...prev, [sectionId]: true }))

    const { data, error } = await supabase
      .from("pesanan_sections")
      .upsert(
        {
          id: draft.id,
          pesanan_id: id,
          section_type: draft.section_type,
          aktif: draft.aktif,
          urutan: draft.urutan,
          data: draft.data,
          background: draft.background?.trim() || null,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single()

    setSavingSection((prev) => ({ ...prev, [sectionId]: false }))

    if (error) {
      showToast(`Gagal menyimpan section: ${error.message}`, "error")
    } else if (data) {
      const saved = data as SectionRecord
      setSections((prev) => prev.map((s) => (s.id === sectionId ? saved : s)))
      setSectionDrafts((prev) => ({ ...prev, [sectionId]: saved }))
      showToast(`${PESANAN_SECTION_LABELS[draft.section_type]} disimpan`, "success")
    }
  }

  async function copyLink() {
    if (!pesanan) return
    const url = `${window.location.origin}/undangan/${pesanan.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (fetching) {
    return (
      <div className="max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl animate-pulse"
            style={{ backgroundColor: "rgba(150,167,141,0.08)" }}
          />
        ))}
      </div>
    )
  }

  if (!pesanan) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Pesanan tidak ditemukan</p>
        <Link href="/admin/dashboard/pesanan" className="text-sm text-[#96A78D] mt-2 inline-block">
          Kembali ke daftar pesanan
        </Link>
      </div>
    )
  }

  const statusStyle = PESANAN_STATUS_STYLES[pesanan.status] ?? PESANAN_STATUS_STYLES.baru
  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/undangan/${pesanan.slug}` : `/undangan/${pesanan.slug}`

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/dashboard/pesanan"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#96A78D] mb-4"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Detail Pesanan</h1>
        <p className="text-sm text-gray-400 mt-0.5 font-mono">{pesanan.slug}</p>
      </div>

      <Card className="rounded-2xl shadow-none mb-6" style={{ border: "1px solid rgba(150,167,141,0.2)" }}>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="text-sm font-medium text-gray-800">{pesanan.nama_customer}</p>
              <p className="text-sm text-gray-500">{pesanan.wa_customer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Template</p>
              <p className="text-sm font-medium text-gray-800">{pesanan.templates?.nama ?? "—"}</p>
              {pesanan.templates?.harga != null && (
                <p className="text-sm text-gray-500">{formatRupiah(pesanan.templates.harga)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <Badge
                className="border-0 text-[11px]"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
              >
                {statusStyle.label}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tanggal Dibuat</p>
              <p className="text-sm text-gray-700">{formatDate(pesanan.created_at)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end pt-2 border-t border-[rgba(150,167,141,0.12)]">
            <div className="flex-1 w-full sm:max-w-xs">
              <Label className="text-sm font-medium text-gray-600 mb-1.5 block">Ubah Status</Label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as PesananStatus)}
                className="w-full h-9 px-3 text-sm rounded-md border bg-[#FAFAF8] text-gray-700 outline-none focus:ring-2 focus:ring-[#96A78D]/40"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              >
                {PESANAN_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {PESANAN_STATUS_STYLES[s].label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={savingStatus || statusDraft === pesanan.status}
              className="text-white"
              style={{ backgroundColor: "#96A78D" }}
            >
              {savingStatus ? "Menyimpan..." : "Update Status"}
            </Button>
          </div>

          {pesanan.status === "fix" && (
            <div
              className="rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
              style={{ backgroundColor: "#D9E9CF" }}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#3D6B33] uppercase mb-1">Link Undangan</p>
                <p className="text-sm text-[#3D6B33] break-all font-mono">{inviteUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="shrink-0 bg-white"
              >
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? "Tersalin" : "Copy Link"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Section Undangan</h2>

      <Accordion type="multiple" className="space-y-3">
        {sections.map((section) => {
          const draft = sectionDrafts[section.id] ?? section
          const isSaving = savingSection[section.id] ?? false
          const hasForm = !NO_FORM_SECTIONS.includes(draft.section_type)

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-2xl border px-0 overflow-hidden"
              style={{ borderColor: "rgba(150,167,141,0.2)", backgroundColor: "#fff" }}
            >
              <div className="flex items-center gap-3 px-5 py-3">
                <Switch
                  checked={draft.aktif}
                  onCheckedChange={(val) => handleToggleAktif(section.id, val)}
                  className="data-[state=checked]:bg-[#96A78D] shrink-0"
                />
                <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                  <span className="text-sm font-medium text-gray-800">
                    {PESANAN_SECTION_LABELS[draft.section_type]}
                  </span>
                  <Badge
                    className="ml-3 border-0 text-[10px]"
                    style={
                      draft.aktif
                        ? { backgroundColor: "#D9E9CF", color: "#3D6B33" }
                        : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {draft.aktif ? "Aktif" : "Nonaktif"}
                  </Badge>
                </AccordionTrigger>
              </div>

              <AccordionContent className="px-5 pb-5">
                {draft.aktif ? (
                  <div className="flex flex-col gap-4 pt-2">
                    <PesananSectionFormFields
                      sectionType={draft.section_type}
                      data={draft.data}
                      onChange={(data) =>
                        hasForm ? updateSectionDraft(section.id, { data }) : undefined
                      }
                    />

                    <TextFieldBackground
                      value={draft.background ?? ""}
                      onChange={(v) => updateSectionDraft(section.id, { background: v })}
                    />

                    <Button
                      onClick={() => handleSaveSection(section.id)}
                      disabled={isSaving}
                      className="w-full sm:w-auto text-white"
                      style={{ backgroundColor: "#96A78D" }}
                    >
                      {isSaving ? "Menyimpan..." : "Simpan Section"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pt-2">
                    Aktifkan section untuk mengisi data.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </>
  )
}

function TextFieldBackground({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 pt-2 border-t border-[rgba(150,167,141,0.12)]">
      <Label className="text-xs text-gray-500">Background URL</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        style={inputStyle}
        className="text-sm"
      />
    </div>
  )
}
