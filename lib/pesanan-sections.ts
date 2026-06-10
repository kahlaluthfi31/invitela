export const PESANAN_SECTION_TYPES = [
  "buka_undangan",
  "ayat_agama",
  "mempelai",
  "save_the_date",
  "lokasi",
  "live_streaming",
  "video_foto",
  "written_the_stars",
  "wedding_gift",
  "ucapan_doa",
  "penutup",
] as const

export type PesananSectionType = (typeof PESANAN_SECTION_TYPES)[number]

export const PESANAN_SECTION_LABELS: Record<PesananSectionType, string> = {
  buka_undangan: "Buka Undangan",
  ayat_agama: "Ayat Agama",
  mempelai: "Mempelai",
  save_the_date: "Save The Date",
  lokasi: "Lokasi",
  live_streaming: "Live Streaming",
  video_foto: "Video & Foto",
  written_the_stars: "Written The Stars",
  wedding_gift: "Wedding Gift",
  ucapan_doa: "Ucapan & Doa",
  penutup: "Penutup",
}

export const PESANAN_STATUS_OPTIONS = [
  "baru",
  "proses",
  "review",
  "revisi",
  "fix",
  "selesai",
] as const

export type PesananStatus = (typeof PESANAN_STATUS_OPTIONS)[number]

export const PESANAN_STATUS_STYLES: Record<
  PesananStatus,
  { bg: string; color: string; label: string }
> = {
  baru: { bg: "#F3F4F6", color: "#6B7280", label: "Baru" },
  proses: { bg: "#DBEAFE", color: "#1D4ED8", label: "Proses" },
  review: { bg: "#FEF9C3", color: "#A16207", label: "Review" },
  revisi: { bg: "#FFEDD5", color: "#C2410C", label: "Revisi" },
  fix: { bg: "#D9E9CF", color: "#3D6B33", label: "Fix" },
  selesai: { bg: "#166534", color: "#FFFFFF", label: "Selesai" },
}

// ── Pembayaran Status ────────────────────────────────────────────────────────
export const PEMBAYARAN_STATUS_OPTIONS = [
  "belum_bayar",
  "baru_dp",
  "lunas",
] as const

export type PembayaranStatus = (typeof PEMBAYARAN_STATUS_OPTIONS)[number]

export const PEMBAYARAN_STATUS_STYLES: Record<
  PembayaranStatus,
  { bg: string; color: string; label: string }
> = {
  belum_bayar: { bg: "#F3F4F6", color: "#6B7280", label: "Belum Bayar" },
  baru_dp: { bg: "#FEF9C3", color: "#A16207", label: "Baru DP" },
  lunas: { bg: "#D9E9CF", color: "#3D6B33", label: "Lunas" },
}

export function generatePesananSlug(nama: string): string {
  const base = nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = String(Math.floor(100 + Math.random() * 900))
  return base ? `${base}-${suffix}` : `undangan-${suffix}`
}

export function defaultSectionData(type: PesananSectionType): Record<string, unknown> {
  switch (type) {
    case "ayat_agama":
      return { ayat: "", surat: "" }
    case "mempelai":
      return {
        nama_pria: "",
        ayah_pria: "",
        ibu_pria: "",
        ig_pria: "",
        nama_wanita: "",
        ayah_wanita: "",
        ibu_wanita: "",
        ig_wanita: "",
        wanita_dulu: false,
      }
    case "save_the_date":
      return {
        tanggal_akad: "",
        jam_akad: "",
        tanggal_resepsi: "",
        jam_resepsi: "",
      }
    case "lokasi":
      return {
        nama_venue_akad: "",
        alamat_akad: "",
        maps_akad: "",
        jam_akad: "",
        nama_venue_resepsi: "",
        alamat_resepsi: "",
        maps_resepsi: "",
        jam_resepsi: "",
        dresscode: "",
      }
    case "live_streaming":
      return { aktif: false, url: "" }
    case "video_foto":
      return { url_video_prewed: "", foto_prewed: [] as string[] }
    case "written_the_stars":
      return {
        pertemuan: { cerita: "", tanggal: "" },
        lamaran: { cerita: "", tanggal: "" },
        pernikahan: { cerita: "", tanggal: "" },
      }
    case "wedding_gift":
      return {
        rekening: [] as { bank: string; nomor: string; atas_nama: string }[],
        ewallet: [] as { nama: string; nomor: string }[],
      }
    default:
      return {}
  }
}

export function createDefaultPesananSections(pesananId: string) {
  return PESANAN_SECTION_TYPES.map((section_type, index) => ({
    pesanan_id: pesananId,
    section_type,
    aktif: false,
    urutan: index + 1,
    data: defaultSectionData(section_type),
    background: null as string | null,
  }))
}
