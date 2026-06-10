"use client"

import { useEffect, useState, useCallback } from "react"
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

// ── Types ──────────────────────────────────────────────────────────────────────
type KategoriOption = { id: string; nama: string }

type Template = {
  id: string
  nama: string
  slug: string
  kategori_id: string | null
  harga: number
  badge: string | null
  thumbnail: string | null
  status: boolean
  created_at: string
  kategori?: { nama: string } | null
}

type FormData = {
  nama: string
  slug: string
  harga: string
  badge: string
  thumbnail: string
  kategori_id: string
  status: boolean
}

const EMPTY_FORM: FormData = {
  nama: "",
  slug: "",
  harga: "",
  badge: "",
  thumbnail: "",
  kategori_id: "",
  status: true,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

// ── Toast ─────────────────────────────────────────────────────────────────────
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
export default function TemplatePage() {
  const [list, setList] = useState<Template[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setFetching(true)
    const [{ data: templates, error: tErr }, { data: kategori, error: kErr }] =
      await Promise.all([
        supabase
          .from("templates")
          .select("*, kategori(nama)")
          .order("created_at", { ascending: false }),
        supabase.from("kategori").select("id, nama").order("urutan"),
      ])

    if (!tErr && templates) setList(templates as Template[])
    else if (tErr) console.warn("templates fetch:", tErr.message)

    if (!kErr && kategori) setKategoriOptions(kategori as KategoriOption[])
    else if (kErr) console.warn("kategori fetch:", kErr.message)

    setFetching(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Open modals ───────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(item: Template) {
    setEditTarget(item)
    setForm({
      nama: item.nama,
      slug: item.slug,
      harga: String(item.harga),
      badge: item.badge ?? "",
      thumbnail: item.thumbnail ?? "",
      kategori_id: item.kategori_id ?? "",
      status: item.status,
    })
    setErrors({})
    setFormOpen(true)
  }

  function openDelete(item: Template) {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  // ── Form change ───────────────────────────────────────────────────────────
  function handleNamaChange(val: string) {
    setForm((prev) => ({
      ...prev,
      nama: val,
      slug: editTarget ? prev.slug : toSlug(val),
    }))
  }

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.nama.trim()) e.nama = "Nama wajib diisi"
    if (!form.slug.trim()) e.slug = "Slug wajib diisi"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const payload = {
      nama: form.nama.trim(),
      slug: form.slug.trim(),
      harga: Number(form.harga) || 0,
      badge: form.badge.trim() || null,
      thumbnail: form.thumbnail.trim() || null,
      kategori_id: form.kategori_id || null,
      status: form.status,
    }

    let error
    if (editTarget) {
      ;({ error } = await supabase.from("templates").update(payload).eq("id", editTarget.id))
    } else {
      ;({ error } = await supabase.from("templates").insert(payload))
    }

    setSaving(false)
    if (error) {
      showToast("Gagal menyimpan. Coba lagi.", "error")
    } else {
      setFormOpen(false)
      await fetchData()
      showToast(editTarget ? "Template diperbarui" : "Template ditambahkan", "success")
    }
  }

  // ── Toggle status ─────────────────────────────────────────────────────────
  async function handleToggleStatus(item: Template) {
    const newStatus = !item.status
    // Optimistic
    setList((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, status: newStatus } : t))
    )
    const { error } = await supabase
      .from("templates")
      .update({ status: newStatus })
      .eq("id", item.id)

    if (error) {
      // Rollback
      setList((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: item.status } : t))
      )
      showToast("Gagal mengubah status", "error")
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await supabase.from("templates").delete().eq("id", deleteTarget.id)
    setSaving(false)
    if (error) {
      showToast("Gagal menghapus. Coba lagi.", "error")
    } else {
      setDeleteOpen(false)
      await fetchData()
      showToast("Template dihapus", "success")
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Heading */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Template</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola template undangan digital</p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm font-medium"
          style={{ backgroundColor: "#96A78D" }}
        >
          <Plus size={16} />
          Tambah Template
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(150,167,141,0.2)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1.5fr_1fr_100px_80px_90px_110px] gap-3 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style={{ backgroundColor: "#FAF9EE" }}
        >
          <span>Nama</span>
          <span>Kategori</span>
          <span>Harga</span>
          <span>Badge</span>
          <span>Status</span>
          <span className="text-right">Aksi</span>
        </div>

        {/* Rows */}
        <div className="bg-white divide-y" style={{ borderColor: "rgba(150,167,141,0.12)" }}>
          {fetching ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5fr_1fr_100px_80px_90px_110px] gap-3 px-5 py-4 items-center"
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
              <p className="text-sm font-medium text-gray-500">Belum ada template</p>
              <p className="text-xs text-gray-400 mt-1">Klik "+ Tambah Template" untuk memulai</p>
            </div>
          ) : (
            list.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.5fr_1fr_100px_80px_90px_110px] gap-3 px-5 py-3.5 items-center hover:bg-[#FAF9EE] transition-colors"
              >
                {/* Nama */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.nama}
                      className="w-8 h-8 rounded object-cover shrink-0"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}
                  <span className="text-sm font-medium text-gray-800 truncate">{item.nama}</span>
                </div>

                {/* Kategori */}
                <span className="text-sm text-gray-500 truncate">
                  {item.kategori?.nama ?? <span className="text-gray-300">—</span>}
                </span>

                {/* Harga */}
                <span className="text-sm text-gray-700">{formatRupiah(item.harga)}</span>

                {/* Badge */}
                <span>
                  {item.badge ? (
                    <Badge
                      className="text-[11px] border-0"
                      style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                    >
                      {item.badge}
                    </Badge>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </span>

                {/* Status */}
                <span>
                  <Badge
                    className="border-0 text-[11px]"
                    style={
                      item.status
                        ? { backgroundColor: "#D9E9CF", color: "#3D6B33" }
                        : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {item.status ? "Aktif" : "Nonaktif"}
                  </Badge>
                </span>

                {/* Aksi */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#96A78D] hover:bg-[#D9E9CF]/50 transition-colors"
                    title={item.status ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {item.status ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#96A78D] hover:bg-[#D9E9CF]/50 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => openDelete(item)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Form Modal ── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Template" : "Tambah Template"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Ubah detail template." : "Isi detail template baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Nama */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-nama" className="text-sm font-medium text-gray-700">
                Nama <span className="text-red-400">*</span>
              </Label>
              <Input
                id="t-nama"
                value={form.nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="contoh: Elegan Ivory"
                style={{ borderColor: errors.nama ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-slug" className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                id="t-slug"
                value={form.slug}
                onChange={(e) => setField("slug", toSlug(e.target.value))}
                placeholder="elegan-ivory"
                className="font-mono text-sm"
                style={{ borderColor: errors.slug ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-kategori" className="text-sm font-medium text-gray-700">
                Kategori
              </Label>
              <select
                id="t-kategori"
                value={form.kategori_id}
                onChange={(e) => setField("kategori_id", e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border bg-[#FAFAF8] text-gray-700 outline-none focus:ring-2 focus:ring-[#96A78D]/40"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              >
                <option value="">— Tanpa kategori —</option>
                {kategoriOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Harga */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-harga" className="text-sm font-medium text-gray-700">
                Harga (Rp)
              </Label>
              <Input
                id="t-harga"
                type="number"
                min={0}
                value={form.harga}
                onChange={(e) => setField("harga", e.target.value)}
                placeholder="150000"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              />
              {form.harga && (
                <p className="text-xs text-gray-400">{formatRupiah(Number(form.harga))}</p>
              )}
            </div>

            {/* Badge */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-badge" className="text-sm font-medium text-gray-700">
                Badge <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <Input
                id="t-badge"
                value={form.badge}
                onChange={(e) => setField("badge", e.target.value)}
                placeholder="contoh: Terlaris, Baru"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              />
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-thumbnail" className="text-sm font-medium text-gray-700">
                Thumbnail URL <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <Input
                id="t-thumbnail"
                value={form.thumbnail}
                onChange={(e) => setField("thumbnail", e.target.value)}
                placeholder="https://..."
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Status Aktif</p>
                <p className="text-xs text-gray-400">Template tampil di halaman publik</p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(val) => setField("status", val)}
                className="data-[state=checked]:bg-[#96A78D]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="text-white"
              style={{ backgroundColor: "#96A78D" }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Template</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus template{" "}
              <span className="font-semibold text-gray-700">"{deleteTarget?.nama}"</span>?
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {saving ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </>
  )
}
