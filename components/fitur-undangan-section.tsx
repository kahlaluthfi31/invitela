import { Check } from "lucide-react"

// Default data (fallback)
const defaultFiturList = [
    "Nama Tamu Unlimited",
    "20 Foto + 2 Mempelai",
    "Countdown Timer",
    "Info Rekening",
    "Maps Navigation",
    "RSVP Kehadiran",
    "Custom Music",
    "Kisah Cinta",
    "Ucapan & Doa",
    "Video Prewed",
    "Live Wedding",
    "Share ke Sosmed",
]

interface FiturUndanganProps {
    heading?: string
    subheading?: string
    items?: string[]
}

export function FiturUndanganSection({
    heading = "Fitur Lengkap di Setiap Undangan",
    subheading = "Semua yang kamu butuhkan, sudah termasuk",
    items,
}: FiturUndanganProps) {
    const fiturList = items && items.length > 0 ? items : defaultFiturList

    return (
        <section id="feature-us" className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                        {heading}
                    </h2>
                    <p className="text-[#6b7280] mt-3">
                        {subheading}
                    </p>
                </div>

                {/* Fitur Grid — 3 kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fiturList.map((fitur) => (
                        <div
                            key={fitur}
                            className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-[rgba(150,167,141,0.12)]"
                        >
                            <div className="w-7 h-7 rounded-full bg-[#96A78D] flex items-center justify-center flex-shrink-0">
                                <Check size={14} className="text-white" />
                            </div>
                            <span className="text-[#1a1a1a] text-sm font-medium">
                                {fitur}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}