"use client"

import { useEffect, useState, useCallback, useRef, type ChangeEvent } from "react"
import { Pencil, ToggleLeft, ToggleRight, Upload } from "lucide-react"
import { supabase, uploadThumbnail } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

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
  kategori?: { nama: string } | null
}

type FormData = {
  nama: string
  slug: string
  harga: string
  badge: string
  kategori_id: string
  status: boolean
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

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

export default function TemplatePage() {
  const [list, setList] = useState<Template[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [form, setForm] = useState<FormData>({
    nama: "",
    slug: "",
    harga: "",
    badge: "",
    kategori_id: "",
    status: true,
  })
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [slugManual, setSlugManual] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setFetching(true)

    let templatesResult = await supabase
      .from("templates")
      .select("*, kategori(nama)")
      .order("created_at", { ascending: false })

    if (templatesResult.error?.message?.includes("created_at")) {
      templatesResult = await supabase
        .from("templates")
        .select("*, kategori(nama)")
        .order("id", { ascending: false })
    }

    const { data: kategori, error: kErr } = await supabase
      .from("kategori")
      .select("id, nama")
      .order("urutan")

    if (!templatesResult.error && templatesResult.data) {
      setList(templatesResult.data as Template[])
    } else if (templatesResult.error) {
      console.warn("templates fetch:", templatesResult.error.message)
    }

    if (!kErr && kategori) setKategoriOptions(kategori as KategoriOption[])
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openEdit(item: Template) {
    setEditTarget(item)
    setSlugManual(false)
    setForm({
      nama: item.nama,
      slug: item.slug,
      harga: String(item.harga),
      badge: item.badge ?? "",
      kategori_id: item.kategori_id ?? "",
      status: item.status,
    })
    setThumbnailUrl(item.thumbnail ?? "")
    setUploadingThumbnail(false)
    setErrors({})
    setFormOpen(true)
  }

  async function handleThumbnailFile(file: File) {
    const allowed = ["image/png", "image/jpeg", "image/webp"]
    if (!allowed.includes(file.type)) {
      showToast("Format harus PNG, JPEG, atau WebP", "error")
      return
    }

    setUploadingThumbnail(true)
    try {
      const url = await uploadThumbnail(file)
      setThumbnailUrl(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengupload gambar"
      showToast(message, "error")
    } finally {
      setUploadingThumbnail(false)
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
    }
  }

  function handleThumbnailInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleThumbnailFile(file)
  }

  function handleNamaChange(val: string) {
    setForm((prev) => ({
      ...prev,
      nama: val,
      slug: slugManual ? prev.slug : toSlug(val),
    }))
  }

  function handleSlugChange(val: string) {
    setSlugManual(true)
    setForm((prev) => ({ ...prev, slug: toSlug(val) }))
  }

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.nama.trim()) e.nama = "Nama wajib diisi"
    if (!form.slug.trim()) e.slug = "Slug wajib diisi"
    if (!form.kategori_id) e.kategori_id = "Kategori wajib dipilih"
    if (!form.harga.trim() || Number(form.harga) <= 0) e.harga = "Harga wajib diisi"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!editTarget || !validate()) return
    setSaving(true)

    const payload = {
      nama: form.nama.trim(),
      slug: form.slug.trim(),
      harga: Number(form.harga),
      badge: form.badge.trim() || null,
      thumbnail: thumbnailUrl.trim() || null,
      kategori_id: form.kategori_id,
      status: form.status,
    }

    const { error } = await supabase.from("templates").update(payload).eq("id", editTarget.id)

    setSaving(false)
    if (error) {
      showToast("Gagal menyimpan. Coba lagi.", "error")
    } else {
      setFormOpen(false)
      await fetchData()
      showToast("Template diperbarui", "success")
    }
  }

  async function handleToggleStatus(item: Template) {
    const newStatus = !item.status
    setList((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, status: newStatus } : t))
    )
    const { error } = await supabase
      .from("templates")
      .update({ status: newStatus })
      .eq("id", item.id)

    if (error) {
      setList((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: item.status } : t))
      )
      showToast("Gagal mengubah status", "error")
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Template</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Edit metadata template undangan (file code di folder /templates/)
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(150,167,141,0.2)" }}
      >
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
              <p className="text-xs text-gray-400 mt-1">
                Template ditambahkan via file code di folder /templates/
              </p>
            </div>
          ) : (
            list.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.5fr_1fr_100px_80px_90px_110px] gap-3 px-5 py-3.5 items-center hover:bg-[#FAF9EE] transition-colors"
              >
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

                <span className="text-sm text-gray-500 truncate">
                  {item.kategori?.nama ?? <span className="text-gray-300">—</span>}
                </span>

                <span className="text-sm text-gray-700">{formatRupiah(item.harga)}</span>

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

                <span>
                  <Badge
                    className="border-0 text-[11px]"
                    style={
                      item.status
                        ? { backgroundColor: "#D9E9CF", color: "#3D6B33" }
                        : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {item.status ? "Show" : "Hide"}
                  </Badge>
                </span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#96A78D] hover:bg-[#D9E9CF]/50 transition-colors"
                    title={item.status ? "Hide" : "Show"}
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Ubah metadata template. File code tidak bisa diubah dari sini.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-nama" className="text-sm font-medium text-gray-700">
                Nama Template <span className="text-red-400">*</span>
              </Label>
              <Input
                id="t-nama"
                value={form.nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="contoh: Vintage Sunset"
                style={{ borderColor: errors.nama ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-slug" className="text-sm font-medium text-gray-700">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                id="t-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="vintage-sunset"
                className="font-mono text-sm"
                style={{ borderColor: errors.slug ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              <p className="text-xs text-gray-400">Auto-generate dari nama. Bisa diubah manual.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-kategori" className="text-sm font-medium text-gray-700">
                Kategori <span className="text-red-400">*</span>
              </Label>
              <select
                id="t-kategori"
                value={form.kategori_id}
                onChange={(e) => setField("kategori_id", e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border bg-[#FAFAF8] text-gray-700 outline-none focus:ring-2 focus:ring-[#96A78D]/40"
                style={{ borderColor: errors.kategori_id ? "#F87171" : "rgba(150,167,141,0.35)" }}
              >
                <option value="">— Pilih kategori —</option>
                {kategoriOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              {errors.kategori_id && <p className="text-xs text-red-500">{errors.kategori_id}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-harga" className="text-sm font-medium text-gray-700">
                Harga (Rp) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="t-harga"
                type="number"
                min={1}
                value={form.harga}
                onChange={(e) => setField("harga", e.target.value)}
                placeholder="150000"
                style={{ borderColor: errors.harga ? "#F87171" : "rgba(150,167,141,0.35)" }}
              />
              {errors.harga && <p className="text-xs text-red-500">{errors.harga}</p>}
              {form.harga && Number(form.harga) > 0 && (
                <p className="text-xs text-gray-400">{formatRupiah(Number(form.harga))}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-badge" className="text-sm font-medium text-gray-700">
                Badge <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <Input
                id="t-badge"
                value={form.badge}
                onChange={(e) => setField("badge", e.target.value)}
                placeholder="contoh: -20%"
                style={{ borderColor: "rgba(150,167,141,0.35)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Thumbnail <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleThumbnailInputChange}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => !uploadingThumbnail && thumbnailInputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !uploadingThumbnail) {
                    e.preventDefault()
                    thumbnailInputRef.current?.click()
                  }
                }}
                className="flex items-center justify-center rounded-xl border-2 border-dashed cursor-pointer"
                style={{
                  height: "200px",
                  backgroundColor: "#FAF9EE",
                  borderColor: "rgba(150,167,141,0.3)",
                }}
              >
                {uploadingThumbnail ? (
                  <Spinner className="size-8 text-[#96A78D]" />
                ) : thumbnailUrl ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-4">
                    <img
                      src={thumbnailUrl}
                      alt="Preview thumbnail"
                      className="max-h-[200px] object-contain rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        thumbnailInputRef.current?.click()
                      }}
                    >
                      Ganti
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-[#96A78D]" />
                    <span className="text-sm text-[#6b7280]">Klik untuk upload gambar</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Show / Hide</p>
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
              disabled={saving || uploadingThumbnail}
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
