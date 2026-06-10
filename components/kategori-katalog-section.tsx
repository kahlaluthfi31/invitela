"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

type KategoriRow = {
  id: string
  nama: string
  urutan: number
  status?: boolean
}

type TemplateRow = {
  id: string
  nama: string
  slug: string | null
  harga: number
  badge: string | null
  thumbnail: string | null
  kategori: { nama: string } | { nama: string }[] | null
}

type TemplateItem = {
  id: string
  nama: string
  kategori: string
  badge: string | null
  thumbnail: string | null
  slug: string | null
}

function getKategoriNama(kategori: TemplateRow["kategori"]): string {
  if (!kategori) return ""
  if (Array.isArray(kategori)) return kategori[0]?.nama ?? ""
  return kategori.nama ?? ""
}

export function KategoriKatalogSection() {
  const [kategoriList, setKategoriList] = useState<string[]>(["Semua"])
  const [templateList, setTemplateList] = useState<TemplateItem[]>([])
  const [waAdmin, setWaAdmin] = useState("")
  const [kategoriAktif, setKategoriAktif] = useState("Semua")
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    async function fetchKategori() {
      const withStatus = await supabase
        .from("kategori")
        .select("*")
        .eq("status", true)
        .order("urutan")

      if (withStatus.error?.message?.includes("status")) {
        return supabase.from("kategori").select("*").order("urutan")
      }
      return withStatus
    }

    async function fetchTemplates() {
      const withCreatedAt = await supabase
        .from("templates")
        .select("*, kategori(*)")
        .eq("status", true)
        .order("created_at", { ascending: false })

      if (withCreatedAt.error?.message?.includes("created_at")) {
        return supabase
          .from("templates")
          .select("*, kategori(*)")
          .eq("status", true)
          .order("id", { ascending: false })
      }
      return withCreatedAt
    }

    async function fetchData() {
      setLoading(true)
      setFetchError(false)

      const [kategoriResult, templatesResult, settingsResult] = await Promise.all([
        fetchKategori(),
        fetchTemplates(),
        supabase.from("settings").select("value").eq("key", "wa_admin").maybeSingle(),
      ])

      if (kategoriResult.error || templatesResult.error) {
        console.warn(
          "katalog fetch:",
          kategoriResult.error?.message,
          templatesResult.error?.message
        )
        setFetchError(true)
        setKategoriList(["Semua"])
        setTemplateList([])
        setLoading(false)
        return
      }

      const kategoriRows = (kategoriResult.data ?? []) as KategoriRow[]
      const activeKategori = kategoriRows.filter((k) => k.status !== false)
      setKategoriList(["Semua", ...activeKategori.map((k) => k.nama)])

      const templates = (templatesResult.data ?? []) as TemplateRow[]
      setTemplateList(
        templates.map((t) => ({
          id: t.id,
          nama: t.nama,
          kategori: getKategoriNama(t.kategori),
          badge: t.badge,
          thumbnail: t.thumbnail,
          slug: t.slug,
        }))
      )

      if (settingsResult.data?.value) {
        setWaAdmin(String(settingsResult.data.value).replace(/\D/g, ""))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredTemplates =
    kategoriAktif === "Semua"
      ? templateList
      : templateList.filter((t) => t.kategori === kategoriAktif)

  const waBase = waAdmin || "NOMOR_WA_ADMIN"

  return (
    <section id="template" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            Template Undangan Kami
          </h2>
          <p className="text-[#6b7280] mt-3">
            Pilih desain tema yang sesuai dengan momenmu
          </p>
        </div>

        {!fetchError && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {kategoriList.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setKategoriAktif(kategori)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  kategoriAktif === kategori
                    ? "bg-[#96A78D] text-white"
                    : "bg-white text-[#4a4a4a] border border-[rgba(150,167,141,0.2)] hover:border-[#96A78D]"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[200px] h-[400px] rounded-[24px] bg-[#e8e8e8] animate-pulse" />
                <div className="w-32 h-4 mt-5 rounded bg-[#e8e8e8] animate-pulse" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-16">
            <p className="text-[#6b7280]">Gagal memuat template</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="group">
                  <div className="relative mx-auto w-[200px] h-[400px] rounded-[24px] border-2 border-[rgba(150,167,141,0.2)] overflow-hidden bg-[#f5f5f5] transition-all duration-300 group-hover:border-[#96A78D] group-hover:shadow-lg">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[50px] h-[5px] rounded-full bg-[rgba(0,0,0,0.1)] z-10" />
                    {template.thumbnail ? (
                      <div className="w-full h-full">
                        <img
                          src={template.thumbnail}
                          alt={template.nama}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-[#e8e8e8] flex items-center justify-center">
                        <span className="text-[#aaa] text-sm">Preview</span>
                      </div>
                    )}

                    {template.badge && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-white bg-[#ef4444]">
                        {template.badge}
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-5">
                    <h3 className="font-medium text-[#1a1a1a] text-[15px]">
                      {template.nama}
                    </h3>
                  </div>

                  <div className="flex gap-2 justify-center mt-4">
                    {template.slug ? (
                      <Link
                        href={`/undangan/${template.slug}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[rgba(150,167,141,0.2)] text-[#4a4a4a] hover:bg-[#D9E9CF] transition-colors"
                      >
                        <Eye size={14} />
                        Preview
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[rgba(150,167,141,0.1)] text-[#ccc] cursor-not-allowed"
                      >
                        <Eye size={14} />
                        Segera Hadir
                      </button>
                    )}

                    <a
                      href={`https://wa.me/${waBase}?text=Halo%20kak%2C%20saya%20ingin%20pesan%20undangan%20${encodeURIComponent(template.nama)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#96A78D] text-white hover:bg-[#7a8f72] transition-colors"
                    >
                      <MessageCircle size={14} />
                      Order
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#6b7280]">
                  Belum ada template untuk kategori ini.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
