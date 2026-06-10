"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { LANDING_ICON_OPTIONS, getLandingIcon } from "@/lib/landing-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────
type Section = {
  id: number
  section_key: string
  label: string
  content: Record<string, unknown>
  is_active?: boolean
}

type SavingState = Record<string, boolean>

// ── Input styles ───────────────────────────────────────────────────────────────
const inputStyle = {
  borderColor: "rgba(150,167,141,0.35)",
  backgroundColor: "#FAFAF8",
}

// ── Toast ──────────────────────────────────────────────────────────────────────
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

// ── Field renderers ────────────────────────────────────────────────────────────

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-600">{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-600">{label}</Label>
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={inputStyle}
      />
    </div>
  )
}

// ── Dynamic list helper ────────────────────────────────────────────────────────
function DynamicList<T extends Record<string, string>>({
  items,
  onChange,
  fields,
  emptyItem,
}: {
  items: T[]
  onChange: (newItems: T[]) => void
  fields: { key: keyof T; label: string; type?: "text" | "textarea" }[]
  emptyItem: T
}) {
  function addItem() {
    onChange([...items, { ...emptyItem }])
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, key: keyof T, val: string) {
    const updated = items.map((item, i) => (i === idx ? { ...item, [key]: val } : item))
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-3 py-4 relative"
          style={
            idx < items.length - 1
              ? { borderBottom: "1px solid rgba(150,167,141,0.12)" }
              : undefined
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Item {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Hapus item"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {fields.map(({ key, label, type }) => (
            <div key={String(key)} className="flex flex-col gap-1.5">
              <Label className="text-xs text-gray-500">{label}</Label>
              {type === "textarea" ? (
                <Textarea
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(idx, key, e.target.value)}
                  rows={2}
                  style={inputStyle}
                  className="text-sm"
                />
              ) : (
                <Input
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(idx, key, e.target.value)}
                  style={inputStyle}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mt-2 flex items-center gap-2 text-sm border-dashed"
        style={{ borderColor: "rgba(150,167,141,0.4)", color: "#96A78D" }}
      >
        <Plus size={14} />
        Tambah Item
      </Button>
    </div>
  )
}

type KenapaKamiItem = { icon: string; judul: string; deskripsi: string }

function KenapaKamiItemsList({
  items,
  onChange,
}: {
  items: KenapaKamiItem[]
  onChange: (newItems: KenapaKamiItem[]) => void
}) {
  function addItem() {
    onChange([...items, { icon: "Sparkles", judul: "", deskripsi: "" }])
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, key: keyof KenapaKamiItem, val: string) {
    onChange(items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)))
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, idx) => {
        const IconComp = getLandingIcon(item.icon)
        return (
          <div
            key={idx}
            className="flex flex-col gap-3 py-4 relative"
            style={
              idx < items.length - 1
                ? { borderBottom: "1px solid rgba(150,167,141,0.12)" }
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Item {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Hapus item"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-gray-500">Icon</Label>
              <Select
                value={item.icon || "Sparkles"}
                onValueChange={(val) => updateItem(idx, "icon", val)}
              >
                <SelectTrigger className="w-full" style={inputStyle}>
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <IconComp size={16} className="text-[#96A78D]" />
                      {LANDING_ICON_OPTIONS.find((o) => o.value === item.icon)?.label ?? "Sparkles"}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANDING_ICON_OPTIONS.map(({ value, label }) => {
                    const OptionIcon = getLandingIcon(value)
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <OptionIcon size={16} className="text-[#96A78D]" />
                          {label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-gray-500">Judul</Label>
              <Input
                value={item.judul ?? ""}
                onChange={(e) => updateItem(idx, "judul", e.target.value)}
                style={inputStyle}
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-gray-500">Deskripsi</Label>
              <Textarea
                value={item.deskripsi ?? ""}
                onChange={(e) => updateItem(idx, "deskripsi", e.target.value)}
                rows={2}
                style={inputStyle}
                className="text-sm"
              />
            </div>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mt-2 flex items-center gap-2 text-sm border-dashed"
        style={{ borderColor: "rgba(150,167,141,0.4)", color: "#96A78D" }}
      >
        <Plus size={14} />
        Tambah Item
      </Button>
    </div>
  )
}

// ── Simple string list ─────────────────────────────────────────────────────────
function StringList({
  items,
  onChange,
  label,
}: {
  items: string[]
  onChange: (newItems: string[]) => void
  label: string
}) {
  function addItem() {
    onChange([...items, ""])
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, val: string) {
    onChange(items.map((v, i) => (i === idx ? val : v)))
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 py-2"
          style={
            idx < items.length - 1
              ? { borderBottom: "1px solid rgba(150,167,141,0.08)" }
              : undefined
          }
        >
          <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}.</span>
          <Input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={label}
            style={inputStyle}
            className="text-sm flex-1"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mt-2 flex items-center gap-2 text-sm border-dashed"
        style={{ borderColor: "rgba(150,167,141,0.4)", color: "#96A78D" }}
      >
        <Plus size={14} />
        Tambah Item
      </Button>
    </div>
  )
}

// ── Section form renderer ──────────────────────────────────────────────────────
function SectionForm({
  sectionKey,
  content,
  onChange,
}: {
  sectionKey: string
  content: Record<string, unknown>
  onChange: (updated: Record<string, unknown>) => void
}) {
  function set(key: string, val: unknown) {
    onChange({ ...content, [key]: val })
  }

  switch (sectionKey) {
    case "hero":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <TextAreaField label="Deskripsi" value={content.description as string} onChange={(v) => set("description", v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Teks Tombol 1" value={content.button_text_1 as string} onChange={(v) => set("button_text_1", v)} />
            <TextField label="Link Tombol 1" value={content.button_1_link as string} onChange={(v) => set("button_1_link", v)} />
            <TextField label="Teks Tombol 2" value={content.button_2_text as string} onChange={(v) => set("button_2_text", v)} />
            <TextField label="Link Tombol 2" value={content.button_2_link as string} onChange={(v) => set("button_2_link", v)} />
          </div>
        </div>
      )

    case "kenapa_kami":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Items</Label>
            <KenapaKamiItemsList
              items={(content.items as KenapaKamiItem[]) ?? []}
              onChange={(v) => set("items", v)}
            />
          </div>
        </div>
      )

    case "fitur":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Daftar Fitur</Label>
            <StringList
              items={(content.items as string[]) ?? []}
              onChange={(v) => set("items", v)}
              label="Nama fitur"
            />
          </div>
        </div>
      )

    case "testimoni":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Testimoni</Label>
            <DynamicList
              items={(content.items as { nama: string; lokasi: string; pesan: string }[]) ?? []}
              onChange={(v) => set("items", v)}
              fields={[
                { key: "nama", label: "Nama" },
                { key: "lokasi", label: "Lokasi" },
                { key: "pesan", label: "Pesan", type: "textarea" },
              ]}
              emptyItem={{ nama: "", lokasi: "", pesan: "" }}
            />
          </div>
        </div>
      )

    case "cara_pesan":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Langkah-langkah</Label>
            <DynamicList
              items={(content.items as { nomor: string; judul: string; deskripsi: string }[]) ?? []}
              onChange={(v) => set("items", v)}
              fields={[
                { key: "nomor", label: "Nomor" },
                { key: "judul", label: "Judul" },
                { key: "deskripsi", label: "Deskripsi", type: "textarea" },
              ]}
              emptyItem={{ nomor: "", judul: "", deskripsi: "" }}
            />
          </div>
        </div>
      )

    case "cta":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Heading" value={content.heading as string} onChange={(v) => set("heading", v)} />
          <TextField label="Subheading" value={content.subheading as string} onChange={(v) => set("subheading", v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Teks Tombol 1" value={content.button_1_text as string} onChange={(v) => set("button_1_text", v)} />
            <TextField label="Link Tombol 1" value={content.button_1_link as string} onChange={(v) => set("button_1_link", v)} />
            <TextField label="Teks Tombol 2" value={content.button_2_text as string} onChange={(v) => set("button_2_text", v)} />
            <TextField label="Link Tombol 2" value={content.button_2_link as string} onChange={(v) => set("button_2_link", v)} />
          </div>
        </div>
      )

    case "footer":
      return (
        <div className="flex flex-col gap-4">
          <TextAreaField label="Deskripsi" value={content.deskripsi as string} onChange={(v) => set("deskripsi", v)} />
          <TextField label="Jam Operasional" value={content.jam_operasional as string} onChange={(v) => set("jam_operasional", v)} />
        </div>
      )

    default:
      return (
        <div className="text-sm text-gray-400 italic py-4">
          Section &quot;{sectionKey}&quot; belum memiliki form editor.
        </div>
      )
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
function normalizeSection(raw: Record<string, unknown>): Section {
  return {
    id: raw.id as number,
    section_key: raw.section_key as string,
    label: raw.label as string,
    content: (raw.content as Record<string, unknown>) ?? {},
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : true,
  }
}

export default function LandingPageAdmin() {
  const [sections, setSections] = useState<Section[]>([])
  const [hasIsActiveColumn, setHasIsActiveColumn] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState<SavingState>({})
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }, [])

  // Fetch
  useEffect(() => {
    async function fetchSections() {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .order("id")

      if (!error && data) {
        setHasIsActiveColumn(data.some((row) => "is_active" in row))
        setSections(data.map((row) => normalizeSection(row as Record<string, unknown>)))
      } else if (error) {
        console.warn("landing_sections fetch:", error.message)
      }
      setFetching(false)
    }
    fetchSections()
  }, [])

  // Update local section
  function updateSection(sectionKey: string, updates: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.section_key === sectionKey ? { ...s, ...updates } : s))
    )
  }

  // Save one section
  async function handleSave(section: Section) {
    setSaving((prev) => ({ ...prev, [section.section_key]: true }))

    const updatePayload: { content: Record<string, unknown>; is_active?: boolean } = {
      content: section.content,
    }
    if (hasIsActiveColumn) {
      updatePayload.is_active = section.is_active ?? true
    }

    const { data, error } = await supabase
      .from("landing_sections")
      .update(updatePayload)
      .eq("section_key", section.section_key)
      .select("id")

    setSaving((prev) => ({ ...prev, [section.section_key]: false }))

    if (error) {
      console.error("landing_sections save:", error.message)
      showToast(`Gagal menyimpan: ${error.message}`, "error")
    } else if (!data || data.length === 0) {
      showToast("Gagal menyimpan: tidak ada data yang diperbarui.", "error")
    } else {
      showToast(`${section.label} berhasil disimpan`, "success")
    }
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Landing Page</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Edit konten setiap section di halaman utama website
        </p>
      </div>

      {fetching ? (
        <div className="flex flex-col gap-6 max-w-6xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl animate-pulse"
              style={{ backgroundColor: "rgba(150,167,141,0.08)" }}
            />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-medium text-gray-500">Belum ada section</p>
          <p className="text-xs text-gray-400 mt-1">
            Tambahkan data ke tabel landing_sections di Supabase
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-6xl">
          {sections.map((section) => {
            const isSaving = saving[section.section_key] ?? false
            return (
              <Card
                key={section.section_key}
                className="rounded-2xl shadow-none overflow-hidden"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(150,167,141,0.2)",
                  opacity: section.is_active !== false ? 1 : 0.7,
                }}
              >
                <CardContent className="p-0">
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
                  >
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800">{section.label}</h2>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{section.section_key}</p>
                    </div>
                    {hasIsActiveColumn && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {section.is_active !== false ? "Aktif" : "Nonaktif"}
                        </span>
                        <Switch
                          checked={section.is_active !== false}
                          onCheckedChange={(val) =>
                            updateSection(section.section_key, { is_active: val })
                          }
                          className="data-[state=checked]:bg-[#96A78D]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Form */}
                  <div className="px-6 py-5">
                    <SectionForm
                      sectionKey={section.section_key}
                      content={section.content}
                      onChange={(updated) =>
                        updateSection(section.section_key, { content: updated })
                      }
                    />
                  </div>

                  {/* Save button */}
                  <div className="px-6 pb-5">
                    <Button
                      onClick={() => handleSave(section)}
                      disabled={isSaving}
                      className="w-full text-white font-medium"
                      style={{ backgroundColor: "#96A78D" }}
                    >
                      {isSaving ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </>
  )
}
