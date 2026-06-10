"use client"

import { useState, useEffect } from "react"

// ============================================
// DATA INTERFACE
// ============================================
export interface UndanganData {
    namaTamu?: string
    wanitaDulu?: boolean

    // Ayat Agama
    ayatAgama?: string
    suratAyat?: string

    // Mempelai
    namaPria: string
    ayahPria: string
    ibuPria: string
    igPria?: string
    fotoPria?: string
    namaWanita: string
    ayahWanita: string
    ibuWanita: string
    igWanita?: string
    fotoWanita?: string

    // Save The Date
    tanggalAkad: string
    jamAkad?: string
    tanggalResepsi?: string
    jamResepsi?: string

    // Lokasi
    namaVenueAkad?: string
    alamatAkad?: string
    mapsAkad?: string
    namaVenueResepsi?: string
    alamatResepsi?: string
    mapsResepsi?: string
    dresscode?: string

    // Live Streaming
    showLiveStreaming?: boolean
    urlLiveStreaming?: string

    // Video & Foto
    urlVideoPrewed?: string
    fotoPrewed?: string[]

    // Written The Stars
    ceritaPertemuan?: string
    tanggalPertemuan?: string
    ceritaLamaran?: string
    tanggalLamaran?: string
    ceritaPernikahan?: string
    tanggalPernikahan?: string

    // Wedding Gift
    rekening?: { bank: string; nomor: string; atasNama: string }[]
    ewallet?: { nama: string; nomor: string }[]

    // Musik
    urlMusik?: string
}

// ============================================
// SECTION 1: BUKA UNDANGAN
// ============================================
function BukaUndangan({ namaTamu = "Bapak/Ibu/Saudara/i" }: { namaTamu: string }) {
    const [opened, setOpened] = useState(false)

    if (opened) return null

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]">
            {/* Background dekoratif — ganti dengan foto nanti */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a3a2a] to-[#1a1a1a]" />

            <div className="relative z-10 text-center px-6">
                <p className="text-[#D9E9CF] text-xs tracking-[0.3em] uppercase mb-4">
                    Kepada Yth.
                </p>
                <h1 className="text-white text-2xl md:text-4xl font-serif mb-2">
                    {namaTamu}
                </h1>
                <p className="text-[#D9E9CF]/60 text-sm mb-10">
                    Anda diundang ke pernikahan
                </p>
                <button
                    onClick={() => setOpened(true)}
                    className="bg-[#96A78D] text-white px-8 py-3 rounded-full text-sm tracking-wider hover:bg-[#7a8f72] transition-colors"
                >
                    〱 BUKA UNDANGAN
                </button>
            </div>
        </section>
    )
}

// ============================================
// SECTION 2: AYAT AGAMA
// ============================================
function AyatAgama({ ayat, surat }: { ayat?: string; surat?: string }) {
    if (!ayat) return null
    return (
        <section className="py-16 px-6 bg-[#FAF9EE]">
            <div className="max-w-md mx-auto text-center">
                <div className="w-12 h-px bg-[#96A78D] mx-auto mb-6" />
                <p className="text-[#4a4a4a] text-sm leading-loose italic font-serif">
                    &ldquo;{ayat}&rdquo;
                </p>
                {surat && (
                    <p className="text-[#96A78D] text-xs mt-4 tracking-wider">
                        — {surat} —
                    </p>
                )}
                <div className="w-12 h-px bg-[#96A78D] mx-auto mt-6" />
            </div>
        </section>
    )
}

// ============================================
// SECTION 3: MEMPELAI
// ============================================
function Mempelai({
    data,
}: {
    data: UndanganData
}) {
    const pria = {
        nama: data.namaPria,
        ayah: data.ayahPria,
        ibu: data.ibuPria,
        ig: data.igPria,
        foto: data.fotoPria,
    }
    const wanita = {
        nama: data.namaWanita,
        ayah: data.ayahWanita,
        ibu: data.ibuWanita,
        ig: data.igWanita,
        foto: data.fotoWanita,
    }

    const first = data.wanitaDulu ? wanita : pria
    const second = data.wanitaDulu ? pria : wanita

    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-lg mx-auto text-center">
                <p className="text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-10">
                    Insya Allah
                </p>

                {/* Mempelai Pertama */}
                <MempelaiCard orang={first} />

                {/* Ampersand */}
                <p className="text-[#96A78D] text-4xl font-serif my-10">&</p>

                {/* Mempelai Kedua */}
                <MempelaiCard orang={second} />
            </div>
        </section>
    )
}

function MempelaiCard({
    orang,
}: {
    orang: { nama: string; ayah: string; ibu: string; ig?: string; foto?: string }
}) {
    return (
        <div>
            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#96A78D] mb-4 bg-[#D9E9CF]">
                {orang.foto ? (
                    <img src={orang.foto} alt={orang.nama} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#96A78D] text-3xl font-serif">
                        {orang.nama[0]}
                    </div>
                )}
            </div>
            <h2 className="text-[#1a1a1a] text-xl md:text-2xl font-serif font-bold">{orang.nama}</h2>
            <p className="text-[#6b7280] text-sm mt-1">Putra/i dari</p>
            <p className="text-[#4a4a4a] text-sm">{orang.ayah} & {orang.ibu}</p>
            {orang.ig && (
                <a
                    href={`https://instagram.com/${orang.ig.replace("@", "")}`}
                    target="_blank"
                    className="inline-block text-[#96A78D] text-xs mt-2 hover:underline"
                >
                    {orang.ig}
                </a>
            )}
        </div>
    )
}

// ============================================
// SECTION 4: SAVE THE DATE + COUNTDOWN
// ============================================
function SaveTheDate({
    tanggalAkad,
    jamAkad,
    tanggalResepsi,
    jamResepsi,
}: {
    tanggalAkad: string
    jamAkad?: string
    tanggalResepsi?: string
    jamResepsi?: string
}) {
    const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 })

    useEffect(() => {
        const target = new Date(tanggalAkad).getTime()
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const diff = target - now
            if (diff <= 0) { clearInterval(interval); return }
            setTimeLeft({
                hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
                jam: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                menit: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                detik: Math.floor((diff % (1000 * 60)) / 1000),
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [tanggalAkad])

    const formatTanggal = (tgl: string) => {
        return new Date(tgl).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const addToCalendar = (tanggal: string, jam: string, judul: string) => {
        const date = new Date(tanggal)
        const [h, m] = jam ? jam.split(":") : ["08", "00"]
        date.setHours(parseInt(h), parseInt(m))
        const end = new Date(date)
        end.setHours(end.getHours() + 3)
        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        window.open(
            `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(judul)}&dates=${fmt(date)}/${fmt(end)}`,
            "_blank"
        )
    }

    return (
        <section className="py-20 px-6 bg-[#FAF9EE]">
            <div className="max-w-lg mx-auto text-center">
                <p className="text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-2">
                    Save The Date
                </p>
                <h2 className="text-[#1a1a1a] text-2xl md:text-3xl font-serif font-bold mb-8">
                    Pernikahan Kami
                </h2>

                {/* Tanggal */}
                <p className="text-[#4a4a4a] text-base">{formatTanggal(tanggalAkad)}</p>
                {jamAkad && <p className="text-[#96A78D] text-sm mt-1">{jamAkad} WIB</p>}

                {tanggalResepsi && tanggalResepsi !== tanggalAkad && (
                    <div className="mt-3">
                        <p className="text-[#4a4a4a] text-base">{formatTanggal(tanggalResepsi)}</p>
                        {jamResepsi && <p className="text-[#96A78D] text-sm mt-1">{jamResepsi} WIB</p>}
                    </div>
                )}

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-3 mt-10">
                    {[
                        { value: timeLeft.hari, label: "Hari" },
                        { value: timeLeft.jam, label: "Jam" },
                        { value: timeLeft.menit, label: "Menit" },
                        { value: timeLeft.detik, label: "Detik" },
                    ].map((item) => (
                        <div key={item.label} className="bg-white rounded-xl py-4 border border-[rgba(150,167,141,0.15)]">
                            <p className="text-[#96A78D] text-2xl md:text-3xl font-bold">{String(item.value).padStart(2, "0")}</p>
                            <p className="text-[#6b7280] text-xs mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tambah ke Kalender */}
                <button
                    onClick={() => addToCalendar(tanggalAkad, jamAkad || "08:00", "Akad Nikah - Pernikahan")}
                    className="mt-6 inline-flex items-center gap-2 text-[#96A78D] text-xs border border-[#96A78D] px-4 py-2 rounded-full hover:bg-[#96A78D] hover:text-white transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Tambah ke Kalender
                </button>
            </div>
        </section>
    )
}

// ============================================
// SECTION 5: LOKASI
// ============================================
function Lokasi(data: UndanganData) {
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-lg mx-auto">
                {data.namaVenueAkad && (
                    <LokasiCard
                        judul="Akad Nikah"
                        nama={data.namaVenueAkad}
                        alamat={data.alamatAkad}
                        maps={data.mapsAkad}
                        jam={data.jamAkad}
                    />
                )}

                {data.namaVenueResepsi && (
                    <div className={data.namaVenueAkad ? "mt-10" : ""}>
                        <LokasiCard
                            judul="Resepsi"
                            nama={data.namaVenueResepsi}
                            alamat={data.alamatResepsi}
                            maps={data.mapsResepsi}
                            jam={data.jamResepsi}
                        />
                    </div>
                )}

                {data.dresscode && (
                    <div className="text-center mt-8">
                        <p className="text-[#6b7280] text-xs tracking-wider uppercase">Dresscode</p>
                        <p className="text-[#1a1a1a] text-sm font-medium mt-1">{data.dresscode}</p>
                    </div>
                )}
            </div>
        </section>
    )
}

function LokasiCard({
    judul, nama, alamat, maps, jam,
}: {
    judul: string
    nama?: string
    alamat?: string
    maps?: string
    jam?: string
}) {
    return (
        <div className="text-center">
            <p className="text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-4">{judul}</p>
            <h3 className="text-[#1a1a1a] text-lg font-serif font-bold">{nama}</h3>
            {jam && <p className="text-[#96A78D] text-sm mt-1">{jam} WIB</p>}
            {alamat && <p className="text-[#6b7280] text-sm mt-2">{alamat}</p>}
            {maps && (
                <a
                    href={maps}
                    target="_blank"
                    className="inline-flex items-center gap-2 mt-4 text-[#96A78D] text-xs border border-[#96A78D] px-4 py-2 rounded-full hover:bg-[#96A78D] hover:text-white transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Lihat di Google Maps
                </a>
            )}
        </div>
    )
}

// ============================================
// SECTION 6: LIVE STREAMING
// ============================================
function LiveStreaming({ show, url }: { show?: boolean; url?: string }) {
    if (!show || !url) return null
    return (
        <section className="py-20 px-6 bg-[#FAF9EE]">
            <div className="max-w-lg mx-auto text-center">
                <p className="text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-4">Live Streaming</p>
                <h2 className="text-[#1a1a1a] text-xl font-serif font-bold mb-6">Hadir Secara Daring</h2>
                <a
                    href={url}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#96A78D] text-white px-6 py-3 rounded-lg text-sm hover:bg-[#7a8f72] transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                    Tonton Live
                </a>
            </div>
        </section>
    )
}

// ============================================
// SECTION 7: VIDEO & FOTO PREWED
// ============================================
function VideoFotoPrewed({
    urlVideo,
    fotoPrewed = [],
}: {
    urlVideo?: string
    fotoPrewed?: string[]
}) {
    if (!urlVideo && fotoPrewed.length === 0) return null
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-3xl mx-auto">
                <p className="text-center text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-10">Galeri</p>

                {/* Video */}
                {urlVideo && (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                        <iframe
                            src={urlVideo.replace("watch?v=", "embed/")}
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                        />
                    </div>
                )}

                {/* Foto Grid */}
                {fotoPrewed.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {fotoPrewed.slice(0, 20).map((foto, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#f5f5f5]">
                                <img src={foto} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

// ============================================
// SECTION 8: WRITTEN THE STARS
// ============================================
function WrittenTheStars({
    ceritaPertemuan,
    tanggalPertemuan,
    ceritaLamaran,
    tanggalLamaran,
    ceritaPernikahan,
    tanggalPernikahan,
}: {
    ceritaPertemuan?: string
    tanggalPertemuan?: string
    ceritaLamaran?: string
    tanggalLamaran?: string
    ceritaPernikahan?: string
    tanggalPernikahan?: string
}) {
    const stories = [
        { judul: "Pertemuan", tanggal: tanggalPertemuan, cerita: ceritaPertemuan },
        { judul: "Lamaran", tanggal: tanggalLamaran, cerita: ceritaLamaran },
        { judul: "Pernikahan", tanggal: tanggalPernikahan, cerita: ceritaPernikahan },
    ].filter((s) => s.cerita)

    if (stories.length === 0) return null

    return (
        <section className="py-20 px-6 bg-[#FAF9EE]">
            <div className="max-w-lg mx-auto">
                <p className="text-center text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-10">Written The Stars</p>

                <div className="space-y-10">
                    {stories.map((story, i) => (
                        <div key={i} className="text-center">
                            <div className="w-10 h-10 rounded-full bg-[#96A78D] text-white flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                                {i + 1}
                            </div>
                            <h3 className="text-[#1a1a1a] text-lg font-serif font-bold">{story.judul}</h3>
                            {story.tanggal && (
                                <p className="text-[#96A78D] text-xs mt-1">
                                    {new Date(story.tanggal).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                                </p>
                            )}
                            <p className="text-[#4a4a4a] text-sm leading-relaxed mt-3">{story.cerita}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ============================================
// SECTION 9: WEDDING GIFT
// ============================================
function WeddingGift({
    rekening = [],
    ewallet = [],
}: {
    rekening?: { bank: string; nomor: string; atasNama: string }[]
    ewallet?: { nama: string; nomor: string }[]
}) {
    if (rekening.length === 0 && ewallet.length === 0) return null
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-lg mx-auto text-center">
                <p className="text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-2">Wedding Gift</p>
                <h2 className="text-[#1a1a1a] text-xl font-serif font-bold mb-2">Amplop Digital</h2>
                <p className="text-[#6b7280] text-sm mb-10">Doa restu Anda merupakan karunia yang sangat berarti bagi kami</p>

                {/* Rekening */}
                {rekening.map((rek, i) => (
                    <GiftCard key={i} judul={rek.bank} nomor={rek.nomor} sub={rek.atasNama} />
                ))}

                {/* E-Wallet */}
                {ewallet.map((ew, i) => (
                    <GiftCard key={i} judul={ew.nama} nomor={ew.nomor} />
                ))}
            </div>
        </section>
    )
}

function GiftCard({ judul, nomor, sub }: { judul: string; nomor: string; sub?: string }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(nomor)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <div className="bg-[#FAF9EE] rounded-xl p-5 mb-3 text-left">
            <p className="text-[#96A78D] text-xs font-medium">{judul}</p>
            <p className="text-[#1a1a1a] text-base font-mono mt-1">{nomor}</p>
            {sub && <p className="text-[#6b7280] text-xs mt-0.5">a.n. {sub}</p>}
            <button
                onClick={copy}
                className="mt-3 text-[#96A78D] text-xs border border-[#96A78D] px-3 py-1 rounded-full hover:bg-[#96A78D] hover:text-white transition-colors"
            >
                {copied ? "Tersalin!" : "Salin"}
            </button>
        </div>
    )
}

// ============================================
// SECTION 10: UCAPAN & DOA
// ============================================
function UcapanDoa({ pesananSlug }: { pesananSlug: string }) {
    const [ucapanList, setUcapanList] = useState<{ nama: string; rsvp: string; pesan: string; waktu: string }[]>([])
    const [form, setForm] = useState({ nama: "", rsvp: "Hadir", pesan: "" })
    const [loading, setLoading] = useState(false)

    const kirim = async () => {
        if (!form.nama || !form.pesan) return
        setLoading(true)
        // Nanti dinamis ke Supabase, sekarang simulasi lokal
        setUcapanList((prev) => [
            { ...form, waktu: new Date().toLocaleString("id-ID") },
            ...prev,
        ])
        setForm({ nama: "", rsvp: "Hadir", pesan: "" })
        setLoading(false)
    }

    return (
        <section className="py-20 px-6 bg-[#FAF9EE]">
            <div className="max-w-lg mx-auto">
                <p className="text-center text-[#96A78D] text-xs tracking-[0.3em] uppercase mb-2">Ucapan & Doa</p>
                <h2 className="text-center text-[#1a1a1a] text-xl font-serif font-bold mb-10">
                    Berikan Ucapan Terbaik
                </h2>

                {/* Form */}
                <div className="bg-white rounded-2xl p-6 border border-[rgba(150,167,141,0.12)] mb-8">
                    <input
                        type="text"
                        placeholder="Nama pengirim"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        className="w-full border border-[rgba(150,167,141,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#aaa] outline-none focus:border-[#96A78D] transition-colors mb-3"
                    />
                    <div className="flex gap-2 mb-3">
                        {["Hadir", "Tidak Hadir"].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setForm({ ...form, rsvp: opt })}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${form.rsvp === opt
                                    ? "bg-[#96A78D] text-white"
                                    : "bg-[#FAF9EE] text-[#4a4a4a] border border-[rgba(150,167,141,0.15)]"
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <textarea
                        placeholder="Ucapan & doa untuk kedua mempelai"
                        value={form.pesan}
                        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                        rows={3}
                        className="w-full border border-[rgba(150,167,141,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#aaa] outline-none focus:border-[#96A78D] transition-colors resize-none mb-3"
                    />
                    <button
                        onClick={kirim}
                        disabled={loading}
                        className="w-full bg-[#96A78D] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#7a8f72] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Mengirim..." : "Kirim Ucapan"}
                    </button>
                </div>

                {/* List Ucapan */}
                <div className="space-y-4">
                    {ucapanList.map((uc, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-[rgba(150,167,141,0.12)]">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[#1a1a1a] text-sm font-semibold">{uc.nama}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${uc.rsvp === "Hadir" ? "bg-[#D9E9CF] text-[#96A78D]" : "bg-[#fee2e2] text-[#ef4444]"
                                    }`}>
                                    {uc.rsvp}
                                </span>
                            </div>
                            <p className="text-[#4a4a4a] text-sm leading-relaxed">{uc.pesan}</p>
                            <p className="text-[#aaa] text-xs mt-2">{uc.waktu}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ============================================
// SECTION 11: PENUTUP
// ============================================
function Penutup() {
    return (
        <section className="py-24 px-6 bg-[#1a1a1a] text-center">
            <div className="max-w-md mx-auto">
                <p className="text-white/80 text-sm leading-relaxed">
                    Merupakan sebuah kehormatan dan kebahagiaan bagi kami apabila
                    Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kami.
                </p>
                <p className="text-white font-serif text-xl mt-6">Terima Kasih</p>
                <div className="w-8 h-px bg-[#96A78D] mx-auto my-8" />
                <p className="text-white/40 text-xs tracking-[0.2em]">
                    INVITELA — DIGITAL INVITATION
                </p>
            </div>
        </section>
    )
}

// ============================================
// MAIN EXPORT — GABUNGAN SEMUA SECTION
// ============================================
export function VintageSunset(data: UndanganData) {
    return (
        <main className="min-h-screen bg-[#FAF9EE]">
            <BukaUndangan namaTamu={data.namaTamu || "Bapak/Ibu/Saudara/i"} />
            <AyatAgama ayat={data.ayatAgama} surat={data.suratAyat} />
            <Mempelai data={data} />
            <SaveTheDate
                tanggalAkad={data.tanggalAkad}
                jamAkad={data.jamAkad}
                tanggalResepsi={data.tanggalResepsi}
                jamResepsi={data.jamResepsi}
            />
            <Lokasi {...data} />
            <LiveStreaming show={data.showLiveStreaming} url={data.urlLiveStreaming} />
            <VideoFotoPrewed urlVideo={data.urlVideoPrewed} fotoPrewed={data.fotoPrewed} />
            <WrittenTheStars
                ceritaPertemuan={data.ceritaPertemuan}
                tanggalPertemuan={data.tanggalPertemuan}
                ceritaLamaran={data.ceritaLamaran}
                tanggalLamaran={data.tanggalLamaran}
                ceritaPernikahan={data.ceritaPernikahan}
                tanggalPernikahan={data.tanggalPernikahan}
            />
            <WeddingGift rekening={data.rekening} ewallet={data.ewallet} />
            <UcapanDoa pesananSlug="demo-vintage" />
            <Penutup />
        </main>
    )
}