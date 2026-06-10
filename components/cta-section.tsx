import { MessageCircle, ArrowDown } from "lucide-react"

interface CTASectionProps {
    heading?: string
    subheading?: string
    button_1_text?: string
    button_1_link?: string
    button_2_text?: string
    button_2_link?: string
}

export function CTASection({
    heading = "Undangan Spesial Untuk Momen Spesial Mu",
    subheading = "Mulai dari Rp 100.000. Proses mudah, hasil memukau.",
    button_1_text = "Pesan via WhatsApp",
    button_1_link = "https://wa.me/NOMOR_WA_ADMIN",
    button_2_text = "Lihat Template",
    button_2_link = "#template",
}: CTASectionProps) {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto bg-[#96A78D] rounded-3xl px-8 py-16 text-center">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                    {heading}
                </h2>
                <p className="text-[rgba(255,255,255,0.8)] mt-4 max-w-md mx-auto text-sm">
                    {subheading}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <a
                        href={button_1_link}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 bg-white text-[#96A78D] font-medium text-sm px-6 py-3 rounded-lg hover:bg-[#FAF9EE] transition-colors"
                    >
                        <MessageCircle size={16} />
                        {button_1_text}
                    </a>
                    <a
                        href={button_2_link}
                        className="inline-flex items-center justify-center gap-2 border border-white text-white font-medium text-sm px-6 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                        <ArrowDown size={16} />
                        {button_2_text}
                    </a>
                </div>
            </div>
        </section>
    )
}