"use client"

import { useState, useEffect, useRef } from "react"

// Default data (fallback)
const defaultTestimonials = [
  {
    nama: "Rina & Budi",
    lokasi: "Jakarta",
    pesan: "Undangannya cantik banget! Tamu-tamu pada kagum dan bilang kayak undangan hotel bintang 5. Padahal harganya terjangkau banget.",
  },
  {
    nama: "Sari Dewi",
    lokasi: "Bandung",
    pesan: "Prosesnya gampang, adminnya sabar banget bantu revisi berkali-kali. Hasilnya memuaskan, recommended!",
  },
  {
    nama: "Ahmad Fauzi",
    lokasi: "Surabaya",
    pesan: "Awalnya ragu undangan digital, tapi setelah lihat hasilnya langsung kagum. Fitur RSVP dan ucapan sangat membantu.",
  },
  {
    nama: "Dinda & Reza",
    lokasi: "Yogyakarta",
    pesan: "Keluarga dari luar kota bisa langsung lihat undangan lewat link. Gak perlu kirim fisik ke mana-mana. Praktis!",
  },
  {
    nama: "Maya Putri",
    lokasi: "Semarang",
    pesan: "Sudah 3x pakai Invitela untuk acara keluarga berbeda. Selalu puas dengan hasilnya.",
  },
  {
    nama: "Hendra & Lisa",
    lokasi: "Medan",
    pesan: "Background musiknya bikin undangan terasa hidup. Tamu-tamu sampai nanya ini buat di vendor mana.",
  },
]

function getInisial(nama: string) {
  return nama
    .split(" ")
    .filter((_, i) => i === 0 || i === nama.split(" ").length - 1)
    .map((n) => n[0])
    .join("")
}

interface TestimonialsSectionProps {
  heading?: string
  subheading?: string
  items?: { nama: string; lokasi: string; pesan: string }[]
}

export function TestimonialsSection({
  heading = "Yang Mereka Katakan",
  subheading = "Kata mereka yang sudah pakai Invitela",
  items,
}: TestimonialsSectionProps) {
  const testimonials = items && items.length > 0 ? items : defaultTestimonials
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  const [isPaused, setIsPaused] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isPaused || !isInitialized || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    let animationFrameId: number
    let isActive = true

    const scroll = () => {
      if (!isActive || !scrollContainer) return

      scrollContainer.scrollLeft += 1
      const maxScroll = scrollContainer.scrollWidth / 3

      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = 0
      }

      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      isActive = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPaused, isInitialized])

  return (
    <section id="testimoni" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            {heading}
          </h2>
          <p className="text-[#6b7280] mt-3">
            {subheading}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Fade kiri kanan */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FAF9EE] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FAF9EE] to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{ scrollBehavior: "auto" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[340px] sm:w-[400px] bg-white rounded-2xl p-7 border border-[rgba(150,167,141,0.12)]"
              >

                {/* Pesan */}
                <p className="text-[#4a4a4a] text-sm leading-relaxed italic min-h-[60px]">
                  &ldquo;{testimonial.pesan}&rdquo;
                </p>

                {/* Profil */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[rgba(150,167,141,0.1)]">
                  <div className="w-9 h-9 rounded-full bg-[#D9E9CF] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#96A78D] text-xs font-bold">
                      {getInisial(testimonial.nama)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#1a1a1a] text-sm font-semibold">
                      {testimonial.nama}
                    </p>
                    <p className="text-[#96A78D] text-xs">
                      {testimonial.lokasi}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}