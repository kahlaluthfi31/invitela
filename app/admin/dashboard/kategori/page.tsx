"use client"

import { useEffect, useState, useCallback } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
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

// ── Types ──────────────────────────────────────────────────────────────────────
type Kategori = {
  id: string
  nama: string
  slug: string
  urutan: number
}

type FormData = {
  nama: string
  slug: string
  urutan: string
}

const EMPTY_FORM: FormData = { nama: "", slug: "", urutan: "" }

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({
  show,
  message,
  type,
}: {
  show: boolean
  message: string
  type: "success" | "error"
}) {
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

// ── Slug generator ─────────────────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function KategoriPage() {
  const [list, setList] = useState<Kategori[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Kategori | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .order("urutan")

    if (!error && data) setList(data as Kategori[])
    else if (error) console.warn("kategori fetch:", error.message)
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Open form modal ──────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(item: Kategori) {
    setEditTarget(item)
    setForm({ nama: item.nama, slug: item.slug, urutan: String(item.urutan) })
    setErrors({})
    setFormOpen(true)
  }

  function openDelete(item: Kategori) {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  // ── Form handlers ────────────────────────────────────────────────────────────
  function handleNamaChange(val: string) {
    setForm((prev) => ({
      ...prev,
      nama: val,
      // Auto-generate slug only when adding (not editing)
      slug: editTarget ? prev.slug : toSlug(val),
    }))
  }

  function validate(): boolean {
    const e: Partial<FormData> = {}
    if (!form.nama.trim()) e.nama = "Nama wajib diisi"
    if (!form.slug.trim()) e.slug = "Slug wajib diisi"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const payload = {
      nama: form.nama.trim(),
      slug: form.slug.trim(),
      urutan: Number(form.urutan) || 0,
    }

    let error
    if (editTarget) {
      ;({ error } = await supabase.from("kategori").update(payload).eq("id", editTarget.id))
    } else {
      ;({ error } = await supabase.from("kategori").insert(payload))
    }

    setSaving(false)

    if (error) {
      showToast("Gagal menyimpan. Coba lagi.", "error")
    } else {
      setFormOpen(false)
      await fetchData()
      showToast(editTarget ? "Kategori diperbarui" : "Kategori ditambahkan", "success")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    const { error } = await supabase.from("kategori").delete().eq("id", deleteTarget.id)
    setSaving(false)

    if (error) {
      showToast("Gagal menghapus. Coba lagi.", "error")
    } else {
      setDeleteOpen(false)
      await fetchData()
      showToast("Kategori dihapus", "success")
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page heading */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Kategori</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola kategori template undangan</p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm font-medium"
          style={{ backgroundColor: "#96A78D" }}
        >
          <Plus size={16} />
          Tambah Kategori
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden max-w-6xl"
        style={{ border: "1px solid rgba(150,167,141,0.2)" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_1fr_80px_100px_120px] gap-4 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style={{ backgroundColor: "#FAF9EE" }}
        >
          <span>Nama</span>
          <span>Slug</span>
          <span>Urutan</span>
          <span>Status</span>
          <span className="text-right">Aksi</span>
        </div>

        {/* Rows */}
        <div className="bg-white divide-y" style={{ borderColor: "rgba(150,167,141,0.12)" }}>
          {fetching ? (
            // Skeleton
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_80px_100px_120px] gap-4 px-5 py-4 items-center"
              >
                {[1, 2, 3, 4, 5].map((j) => (
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
              <p className="text-sm font-medium text-gray-500">Belum ada kategori</p>
              <p className="text-xs text-gray-400 mt-1">Klik "+ Tambah Kategori" untuk memulai</p>
            </div>
          ) : (
            list.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1fr_80px_100px_120px] gap-4 px-5 py-3.5 items-center transition-colors hover:bg-[#FAF9EE]"
              >
                <span className="text-sm font-medium text-gray-800 truncate">{item.nama}</span>
                <span className="text-sm text-gray-500 font-mono truncate">{item.slug}</span>
                <span className="text-sm text-gray-500">{item.urutan}</span>
                <span>
                  <Badge
                    className="border-0 text-[11px]"
                    style={{ backgroundColor: "#D9E9CF", color: "#3D6B33" }}
                  >
                    Aktif
                  </Badge>
                </span>
                <div className="flex items-center justify-end gap-1.5">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Ubah detail kategori di bawah ini." : "Isi detail kategori baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Nama */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="k-nama" className="text-sm font-medium text-gray-700">
                Nama <span className="text-red-400">*</span>
              </Label>
              <Input
                id="k-nama"
                value={form.nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="contoh: Pernikahan"
                style={{ borderColor: errors.nama ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="k-slug" className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                id="k-slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: toSlug(e.target.value) }))}
                placeholder="contoh: pernikahan"
                className="font-mono text-sm"
                style={{ borderColor: errors.slug ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              <p className="text-xs text-gray-400">Auto-generate dari nama. Bisa diubah manual.</p>
            </div>

            {/* Urutan */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="k-urutan" className="text-sm font-medium text-gray-700">
                Urutan
              </Label>
              <Input
                id="k-urutan"
                type="number"
                min={0}
                value={form.urutan}
                onChange={(e) => setForm((p) => ({ ...p, urutan: e.target.value }))}
                placeholder="0"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
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

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus kategori{" "}
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
