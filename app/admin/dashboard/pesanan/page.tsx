"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  generatePesananSlug,
  createDefaultPesananSections,
  PESANAN_STATUS_STYLES,
  PEMBAYARAN_STATUS_OPTIONS,
  PEMBAYARAN_STATUS_STYLES,
  type PesananStatus,
  type PembayaranStatus,
} from "@/lib/pesanan-sections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

type TemplateOption = { id: string; nama: string }

type PesananRow = {
  id: string
  template_id: string | null
  slug: string
  nama_customer: string
  wa_customer: string
  status: PesananStatus
  pembayaran: PembayaranStatus
  created_at: string
  templates: { nama: string; thumbnail: string | null; harga: number } | null
}

type CreateForm = {
  template_id: string
  nama_customer: string
  wa_customer: string
  slug: string
}

const EMPTY_FORM: CreateForm = {
  template_id: "",
  nama_customer: "",
  wa_customer: "",
  slug: "",
}

const inputStyle = { borderColor: "rgba(150,167,141,0.35)", backgroundColor: "#FAFAF8" }

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
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function PesananPage() {
  const router = useRouter()
  const [list, setList] = useState<PesananRow[]>([])
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateForm, string>>>({})
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setFetching(true)
    const [{ data: pesanan, error: pErr }, { data: templates, error: tErr }] =
      await Promise.all([
        supabase
          .from("pesanan")
          .select("*, templates(nama, thumbnail, harga)")
          .order("created_at", { ascending: false }),
        supabase.from("templates").select("id, nama").eq("status", true).order("nama"),
      ])

    if (!pErr && pesanan) setList(pesanan as PesananRow[])
    else if (pErr) console.warn("pesanan fetch:", pErr.message)

    if (!tErr && templates) setTemplateOptions(templates as TemplateOption[])
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openCreate() {
    setForm(EMPTY_FORM)
    setErrors({})
    setFormOpen(true)
  }

  function handleNamaChange(val: string) {
    setForm((prev) => ({
      ...prev,
      nama_customer: val,
      slug: generatePesananSlug(val),
    }))
  }

  function validate() {
    const e: Partial<Record<keyof CreateForm, string>> = {}
    if (!form.template_id) e.template_id = "Template wajib dipilih"
    if (!form.nama_customer.trim()) e.nama_customer = "Nama customer wajib diisi"
    if (!form.wa_customer.trim()) e.wa_customer = "Nomor WA wajib diisi"
    if (!form.slug.trim()) e.slug = "Slug wajib diisi"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleCreate() {
    if (!validate()) return
    setSaving(true)

    const { data: inserted, error: insertErr } = await supabase
      .from("pesanan")
      .insert({
        template_id: form.template_id,
        slug: form.slug.trim(),
        nama_customer: form.nama_customer.trim(),
        wa_customer: form.wa_customer.trim(),
        status: "baru",
        pembayaran: "belum_bayar",
      })
      .select("id")
      .single()

    if (insertErr || !inserted) {
      setSaving(false)
      showToast(insertErr?.message ?? "Gagal membuat pesanan", "error")
      return
    }

    const sections = createDefaultPesananSections(inserted.id)
    const { error: sectionsErr } = await supabase.from("pesanan_sections").insert(sections)

    setSaving(false)

    if (sectionsErr) {
      showToast(`Pesanan dibuat tapi section gagal: ${sectionsErr.message}`, "error")
      router.push(`/admin/dashboard/pesanan/${inserted.id}`)
      return
    }

    setFormOpen(false)
    showToast("Pesanan berhasil dibuat", "success")
    router.push(`/admin/dashboard/pesanan/${inserted.id}`)
  }

  async function handleUpdatePembayaran(pesananId: string, newStatus: PembayaranStatus) {
    // Optimistic update
    setList((prev) =>
      prev.map((item) => (item.id === pesananId ? { ...item, pembayaran: newStatus } : item))
    )

    const { error } = await supabase
      .from("pesanan")
      .update({ pembayaran: newStatus })
      .eq("id", pesananId)

    if (error) {
      showToast(`Gagal update pembayaran: ${error.message}`, "error")
      fetchData() // Rollback
    } else {
      showToast("Status pembayaran diperbarui", "success")
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pesanan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola pesanan undangan customer</p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 text-white text-sm font-medium"
          style={{ backgroundColor: "#96A78D" }}
        >
          <Plus size={16} />
          Buat Pesanan
        </Button>
      </div>

      <div
        className="rounded-xl overflow-hidden overflow-x-auto"
        style={{ border: "1px solid rgba(150,167,141,0.2)" }}
      >
        <div
          className="grid min-w-[900px] grid-cols-[1.2fr_1fr_100px_130px_100px_90px] gap-3 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style={{ backgroundColor: "#FAF9EE" }}
        >
          <span>Customer</span>
          <span>Template</span>
          <span>Status</span>
          <span>Pembayaran</span>
          <span>Tanggal</span>
          <span className="text-right">Aksi</span>
        </div>

        <div className="bg-white divide-y min-w-[900px]" style={{ borderColor: "rgba(150,167,141,0.12)" }}>
          {fetching ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1.2fr_1fr_100px_130px_100px_90px] gap-3 px-5 py-4 items-center"
              >
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div
                    key={j}
                    className="h-4 rounded animate-pulse"
                    style={{ backgroundColor: "rgba(150,167,141,0.12)" }}
                  />
                ))}
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-sm font-medium text-gray-500">Belum ada pesanan</p>
              <p className="text-xs text-gray-400 mt-1">Klik &quot;+ Buat Pesanan&quot; untuk memulai</p>
            </div>
          ) : (
            list.map((item) => {
              const statusStyle = PESANAN_STATUS_STYLES[item.status] ?? PESANAN_STATUS_STYLES.baru
              const pembayaranKey = (item.pembayaran ?? "belum_bayar") as PembayaranStatus
              const pembayaranStyle = PEMBAYARAN_STATUS_STYLES[pembayaranKey] ?? PEMBAYARAN_STATUS_STYLES.belum_bayar
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1.2fr_1fr_100px_130px_100px_90px] gap-3 px-5 py-3.5 items-center hover:bg-[#FAF9EE] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nama_customer}</p>
                    <p className="text-xs text-gray-400 truncate">{item.wa_customer}</p>
                  </div>
                  <span className="text-sm text-gray-600 truncate">
                    {item.templates?.nama ?? "—"}
                  </span>
                  <span>
                    <Badge
                      className="border-0 text-[11px]"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </Badge>
                  </span>
                  <span>
                    <select
                      value={pembayaranKey}
                      onChange={(e) => handleUpdatePembayaran(item.id, e.target.value as PembayaranStatus)}
                      className="h-7 px-2 text-[11px] font-medium rounded-md border-0 outline-none cursor-pointer transition-colors"
                      style={{
                        backgroundColor: pembayaranStyle.bg,
                        color: pembayaranStyle.color,
                      }}
                    >
                      {PEMBAYARAN_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {PEMBAYARAN_STATUS_STYLES[opt].label}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/dashboard/pesanan/${item.id}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-[#96A78D] hover:bg-[#D9E9CF]/50 transition-colors inline-flex"
                      title="Lihat detail"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Pesanan Baru</DialogTitle>
            <DialogDescription>Isi data customer dan pilih template undangan.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Template <span className="text-red-400">*</span>
              </Label>
              <select
                value={form.template_id}
                onChange={(e) => setForm((p) => ({ ...p, template_id: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border bg-[#FAFAF8] text-gray-700 outline-none focus:ring-2 focus:ring-[#96A78D]/40"
                style={{ borderColor: errors.template_id ? "#F87171" : "rgba(150,167,141,0.35)" }}
              >
                <option value="">— Pilih template —</option>
                {templateOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
              {errors.template_id && <p className="text-xs text-red-500">{errors.template_id}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Nama Customer <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.nama_customer}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="Nama customer"
                style={{ borderColor: errors.nama_customer ? "#F87171" : inputStyle.borderColor }}
              />
              {errors.nama_customer && <p className="text-xs text-red-500">{errors.nama_customer}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Nomor WA <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.wa_customer}
                onChange={(e) => setForm((p) => ({ ...p, wa_customer: e.target.value }))}
                placeholder="628xxxxxxxxxx"
                style={{ borderColor: errors.wa_customer ? "#F87171" : inputStyle.borderColor }}
              />
              {errors.wa_customer && <p className="text-xs text-red-500">{errors.wa_customer}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="nama-customer-123"
                className="font-mono text-sm"
                style={{ borderColor: errors.slug ? "#F87171" : inputStyle.borderColor }}
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              <p className="text-xs text-gray-400">Auto-generate dari nama customer + angka unik.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="text-white"
              style={{ backgroundColor: "#96A78D" }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </>
  )
}
