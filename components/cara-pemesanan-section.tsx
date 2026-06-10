// Default data (fallback)
const defaultLangkahList = [
    {
        nomor: "01",
        judul: "Pilih Template",
        deskripsi: "Jelajahi katalog dan pilih desain yang kamu suka",
    },
    {
        nomor: "02",
        judul: "Pesan via WhatsApp",
        deskripsi: "Klik tombol pesan dan hubungi admin kami",
    },
    {
        nomor: "03",
        judul: "Kirim Data",
        deskripsi: "Kirim data pengantin langsung ke admin",
    },
    {
        nomor: "04",
        judul: "Preview & Fix Data",
        deskripsi: "Cek preview undangan, revisi sampai sempurna",
    },
    {
        nomor: "05",
        judul: "Selesai & Share",
        deskripsi: "Undangan siap dibagikan ke semua tamu",
    },
]

function GarisHorizontal() {
    return <div className="hidden sm:block w-6 md:w-12 h-px bg-[#D9E9CF] flex-shrink-0 self-center mt-5" />
}

interface CaraPemesananProps {
    heading?: string
    subheading?: string
    items?: { nomor: string; judul: string; deskripsi: string }[]
}

export function CaraPemesananSection({
    heading = "Cara Pemesanan",
    subheading = "Hanya 5 langkah mudah",
    items,
}: CaraPemesananProps) {
    const langkahList = items && items.length > 0 ? items : defaultLangkahList

    return (
        <section id="order" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                        {heading}
                    </h2>
                    <p className="text-[#6b7280] mt-3">
                        {subheading}
                    </p>
                </div>

                {/* Mobile: vertikal */}
                <div className="sm:hidden relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-[#D9E9CF]" />
                    <div className="flex flex-col gap-8">
                        {langkahList.map((langkah) => (
                            <div key={langkah.nomor} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#96A78D] flex items-center justify-center flex-shrink-0 relative z-10">
                                    <span className="text-white text-xs font-bold">{langkah.nomor}</span>
                                </div>
                                <div className="pt-1.5">
                                    <h3 className="font-semibold text-[#1a1a1a] text-[15px]">{langkah.judul}</h3>
                                    <p className="text-[#6b7280] text-sm mt-1 leading-relaxed">{langkah.deskripsi}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop & Tablet: 3+2 grid */}
                <div className="hidden sm:block">
                    {/* Baris 1 — 3 item */}
                    <div className="flex items-start justify-center">
                        {langkahList.slice(0, 3).map((langkah, i) => (
                            <div key={langkah.nomor} className="flex items-start">
                                <div className="flex flex-col items-center text-center w-[160px] md:w-[200px]">
                                    <div className="w-11 h-11 rounded-full bg-[#96A78D] flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">{langkah.nomor}</span>
                                    </div>
                                    <h3 className="font-semibold text-[#1a1a1a] text-sm md:text-base mt-3">{langkah.judul}</h3>
                                    <p className="text-[#6b7280] text-xs md:text-sm mt-1.5 leading-relaxed">{langkah.deskripsi}</p>
                                </div>
                                {i < 2 && <GarisHorizontal />}
                            </div>
                        ))}
                    </div>

                    {/* Garis vertikal penghubung */}
                    <div className="flex justify-center">
                        <div className="w-px h-6 bg-[#D9E9CF]" />
                    </div>

                    {/* Baris 2 — remaining items (center) */}
                    <div className="flex items-start justify-center">
                        {langkahList.slice(3).map((langkah, i) => (
                            <div key={langkah.nomor} className="flex items-start">
                                <div className="flex flex-col items-center text-center w-[160px] md:w-[200px]">
                                    <div className="w-11 h-11 rounded-full bg-[#96A78D] flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">{langkah.nomor}</span>
                                    </div>
                                    <h3 className="font-semibold text-[#1a1a1a] text-sm md:text-base mt-3">{langkah.judul}</h3>
                                    <p className="text-[#6b7280] text-xs md:text-sm mt-1.5 leading-relaxed">{langkah.deskripsi}</p>
                                </div>
                                {i < langkahList.slice(3).length - 1 && <GarisHorizontal />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}