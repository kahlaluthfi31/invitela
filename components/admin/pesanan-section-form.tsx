"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { PesananSectionType } from "@/lib/pesanan-sections"

const inputStyle = {
  borderColor: "rgba(150,167,141,0.35)",
  backgroundColor: "#FAFAF8",
}

type SectionRecord = {
  id: string
  section_type: PesananSectionType
  aktif: boolean
  urutan: number
  data: Record<string, unknown>
  background: string | null
}

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
      <Label className="text-xs text-gray-500">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} className="text-sm" />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={inputStyle} className="text-sm" />
    </div>
  )
}

function getStr(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "string" ? data[key] : ""
}

function getBool(data: Record<string, unknown>, key: string) {
  return Boolean(data[key])
}

function getObj(data: Record<string, unknown>, key: string): Record<string, unknown> {
  const val = data[key]
  return val && typeof val === "object" && !Array.isArray(val) ? (val as Record<string, unknown>) : {}
}

function getArr<T>(data: Record<string, unknown>, key: string): T[] {
  return Array.isArray(data[key]) ? (data[key] as T[]) : []
}

export function PesananSectionFormFields({
  sectionType,
  data,
  onChange,
}: {
  sectionType: PesananSectionType
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}) {
  function set(key: string, val: unknown) {
    onChange({ ...data, [key]: val })
  }

  switch (sectionType) {
    case "buka_undangan":
      return (
        <p className="text-sm text-gray-500 italic">
          Data tamu diambil otomatis dari parameter URL <code className="text-xs">?to=</code>.
        </p>
      )

    case "ayat_agama":
      return (
        <div className="flex flex-col gap-4">
          <TextAreaField label="Ayat" value={getStr(data, "ayat")} onChange={(v) => set("ayat", v)} />
          <TextField label="Surat" value={getStr(data, "surat")} onChange={(v) => set("surat", v)} />
        </div>
      )

    case "mempelai":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-400 uppercase">Mempelai Pria</p>
          <TextField label="Nama Pria" value={getStr(data, "nama_pria")} onChange={(v) => set("nama_pria", v)} />
          <TextField label="Ayah Pria" value={getStr(data, "ayah_pria")} onChange={(v) => set("ayah_pria", v)} />
          <TextField label="Ibu Pria" value={getStr(data, "ibu_pria")} onChange={(v) => set("ibu_pria", v)} />
          <TextField label="IG Pria" value={getStr(data, "ig_pria")} onChange={(v) => set("ig_pria", v)} />
          <p className="text-xs font-semibold text-gray-400 uppercase pt-2">Mempelai Wanita</p>
          <TextField label="Nama Wanita" value={getStr(data, "nama_wanita")} onChange={(v) => set("nama_wanita", v)} />
          <TextField label="Ayah Wanita" value={getStr(data, "ayah_wanita")} onChange={(v) => set("ayah_wanita", v)} />
          <TextField label="Ibu Wanita" value={getStr(data, "ibu_wanita")} onChange={(v) => set("ibu_wanita", v)} />
          <TextField label="IG Wanita" value={getStr(data, "ig_wanita")} onChange={(v) => set("ig_wanita", v)} />
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm text-gray-600">Tampilkan wanita dulu</Label>
            <Switch
              checked={getBool(data, "wanita_dulu")}
              onCheckedChange={(v) => set("wanita_dulu", v)}
              className="data-[state=checked]:bg-[#96A78D]"
            />
          </div>
        </div>
      )

    case "save_the_date":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Tanggal Akad" value={getStr(data, "tanggal_akad")} onChange={(v) => set("tanggal_akad", v)} />
          <TextField label="Jam Akad" value={getStr(data, "jam_akad")} onChange={(v) => set("jam_akad", v)} />
          <TextField label="Tanggal Resepsi" value={getStr(data, "tanggal_resepsi")} onChange={(v) => set("tanggal_resepsi", v)} />
          <TextField label="Jam Resepsi" value={getStr(data, "jam_resepsi")} onChange={(v) => set("jam_resepsi", v)} />
        </div>
      )

    case "lokasi":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-400 uppercase">Akad</p>
          <TextField label="Nama Venue Akad" value={getStr(data, "nama_venue_akad")} onChange={(v) => set("nama_venue_akad", v)} />
          <TextAreaField label="Alamat Akad" value={getStr(data, "alamat_akad")} onChange={(v) => set("alamat_akad", v)} />
          <TextField label="Maps Akad" value={getStr(data, "maps_akad")} onChange={(v) => set("maps_akad", v)} />
          <TextField label="Jam Akad" value={getStr(data, "jam_akad")} onChange={(v) => set("jam_akad", v)} />
          <p className="text-xs font-semibold text-gray-400 uppercase pt-2">Resepsi</p>
          <TextField label="Nama Venue Resepsi" value={getStr(data, "nama_venue_resepsi")} onChange={(v) => set("nama_venue_resepsi", v)} />
          <TextAreaField label="Alamat Resepsi" value={getStr(data, "alamat_resepsi")} onChange={(v) => set("alamat_resepsi", v)} />
          <TextField label="Maps Resepsi" value={getStr(data, "maps_resepsi")} onChange={(v) => set("maps_resepsi", v)} />
          <TextField label="Jam Resepsi" value={getStr(data, "jam_resepsi")} onChange={(v) => set("jam_resepsi", v)} />
          <TextField label="Dresscode" value={getStr(data, "dresscode")} onChange={(v) => set("dresscode", v)} />
        </div>
      )

    case "live_streaming":
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm text-gray-600">Streaming aktif</Label>
            <Switch
              checked={getBool(data, "aktif")}
              onCheckedChange={(v) => set("aktif", v)}
              className="data-[state=checked]:bg-[#96A78D]"
            />
          </div>
          <TextField label="URL Live" value={getStr(data, "url")} onChange={(v) => set("url", v)} />
        </div>
      )

    case "video_foto":
      return (
        <div className="flex flex-col gap-4">
          <TextField label="URL Video Prewed" value={getStr(data, "url_video_prewed")} onChange={(v) => set("url_video_prewed", v)} />
          <TextAreaField
            label="Foto Prewed (URL per baris, max 20)"
            value={getArr<string>(data, "foto_prewed").join("\n")}
            onChange={(v) => {
              const lines = v.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 20)
              set("foto_prewed", lines)
            }}
            rows={6}
          />
        </div>
      )

    case "written_the_stars": {
      const pertemuan = getObj(data, "pertemuan")
      const lamaran = getObj(data, "lamaran")
      const pernikahan = getObj(data, "pernikahan")
      return (
        <div className="flex flex-col gap-6">
          {(
            [
              ["pertemuan", "Pertemuan", pertemuan],
              ["lamaran", "Lamaran", lamaran],
              ["pernikahan", "Pernikahan", pernikahan],
            ] as const
          ).map(([key, label, obj]) => (
            <div key={key} className="flex flex-col gap-3 pb-4 border-b border-[rgba(150,167,141,0.12)] last:border-0">
              <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
              <TextAreaField
                label="Cerita"
                value={getStr(obj, "cerita")}
                onChange={(v) => set(key, { ...obj, cerita: v })}
              />
              <TextField
                label="Tanggal"
                value={getStr(obj, "tanggal")}
                onChange={(v) => set(key, { ...obj, tanggal: v })}
              />
            </div>
          ))}
        </div>
      )
    }

    case "wedding_gift": {
      const rekening = getArr<{ bank: string; nomor: string; atas_nama: string }>(data, "rekening")
      const ewallet = getArr<{ nama: string; nomor: string }>(data, "ewallet")
      return (
        <div className="flex flex-col gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Rekening</Label>
            {rekening.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 py-3 border-b border-[rgba(150,167,141,0.08)]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Rekening {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => set("rekening", rekening.filter((_, i) => i !== idx))}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Input
                  placeholder="Bank"
                  value={item.bank ?? ""}
                  onChange={(e) => {
                    const next = [...rekening]
                    next[idx] = { ...item, bank: e.target.value }
                    set("rekening", next)
                  }}
                  style={inputStyle}
                  className="text-sm"
                />
                <Input
                  placeholder="Nomor"
                  value={item.nomor ?? ""}
                  onChange={(e) => {
                    const next = [...rekening]
                    next[idx] = { ...item, nomor: e.target.value }
                    set("rekening", next)
                  }}
                  style={inputStyle}
                  className="text-sm"
                />
                <Input
                  placeholder="Atas Nama"
                  value={item.atas_nama ?? ""}
                  onChange={(e) => {
                    const next = [...rekening]
                    next[idx] = { ...item, atas_nama: e.target.value }
                    set("rekening", next)
                  }}
                  style={inputStyle}
                  className="text-sm"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-dashed"
              onClick={() => set("rekening", [...rekening, { bank: "", nomor: "", atas_nama: "" }])}
            >
              <Plus size={14} className="mr-1" /> Tambah Rekening
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">E-Wallet</Label>
            {ewallet.map((item, idx) => (
              <div key={idx} className="flex gap-2 py-2 items-center border-b border-[rgba(150,167,141,0.08)]">
                <Input
                  placeholder="Nama"
                  value={item.nama ?? ""}
                  onChange={(e) => {
                    const next = [...ewallet]
                    next[idx] = { ...item, nama: e.target.value }
                    set("ewallet", next)
                  }}
                  style={inputStyle}
                  className="text-sm flex-1"
                />
                <Input
                  placeholder="Nomor"
                  value={item.nomor ?? ""}
                  onChange={(e) => {
                    const next = [...ewallet]
                    next[idx] = { ...item, nomor: e.target.value }
                    set("ewallet", next)
                  }}
                  style={inputStyle}
                  className="text-sm flex-1"
                />
                <button
                  type="button"
                  onClick={() => set("ewallet", ewallet.filter((_, i) => i !== idx))}
                  className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-dashed"
              onClick={() => set("ewallet", [...ewallet, { nama: "", nomor: "" }])}
            >
              <Plus size={14} className="mr-1" /> Tambah E-Wallet
            </Button>
          </div>
        </div>
      )
    }

    case "ucapan_doa":
      return (
        <p className="text-sm text-gray-500 italic">
          Ucapan & doa diisi otomatis oleh tamu melalui form undangan.
        </p>
      )

    case "penutup":
      return (
        <p className="text-sm text-gray-500 italic">
          Section penutup menggunakan teks default dari template.
        </p>
      )

    default:
      return null
  }
}

export type { SectionRecord }
