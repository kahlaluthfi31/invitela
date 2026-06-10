import { getLandingIcon } from "@/lib/landing-icons"

// Default data (fallback)
const defaultItems = [
    {
        icon: "Sparkles",
        judul: "Desain yang Bikin Beda",
        deskripsi:
            "Tamu kamu bakal mikir kamu hire wedding planner mahal. Padahal cuma mulai dari 100rb!",
    },
    {
        icon: "Headset",
        judul: "Team Support",
        deskripsi:
            "Ditemani hingga hari H. Kami siap membantu jika ada kendala.",
    },
    {
        icon: "Users",
        judul: "Unlimited Tamu",
        deskripsi:
            "Nggak ada yang ketinggalan di hari spesial kamu. Undang sebanyak yang kamu mau, tanpa batas.",
    },
    {
        icon: "Leaf",
        judul: "Ramah Lingkungan",
        deskripsi:
            "Pilihan cerdas generasi kamu. Hemat kertas, hemat biaya, tetap elegan.",
    },
]

interface KenapaPilihKamiProps {
    heading?: string
    subheading?: string
    items?: { icon: string; judul: string; deskripsi: string }[]
}

export function KenapaPilihKamiSection({
    heading = "Kenapa Harus Pilih Kami?",
    subheading = "Bukan cuma undangan, ini pengalaman",
    items,
}: KenapaPilihKamiProps) {
    const data = items && items.length > 0 ? items : defaultItems

    return (
        <section id="why-choose-us" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                        {heading}
                    </h2>
                    <p className="text-[#6b7280] mt-3 max-w-md mx-auto">
                        {subheading}
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((item) => {
                        const IconComp = getLandingIcon(item.icon)
                        return (
                            <div
                                key={item.judul}
                                className="bg-white rounded-2xl p-7 border border-[rgba(150,167,141,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="w-11 h-11 rounded-full bg-[#D9E9CF] flex items-center justify-center mb-5">
                                    <IconComp size={20} className="text-[#96A78D]" />
                                </div>
                                <h3 className="font-semibold text-[#1a1a1a] text-[15px] mb-2">
                                    {item.judul}
                                </h3>
                                <p className="text-[#6b7280] text-sm leading-relaxed">
                                    {item.deskripsi}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}