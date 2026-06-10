"use client"

import { VintageSunset, UndanganData } from "@/templates/vintage-sunset"
import { useSearchParams } from "next/navigation"
import { Suspense, use } from "react"

function Content() {
    const searchParams = useSearchParams()
    const namaTamu = searchParams.get("to") || "Bapak/Ibu/Saudara/i"

    const data: UndanganData = {
        namaTamu,
        wanitaDulu: false,
        ayatAgama: "Dan di antara tanda-tanda (kekuasaan)-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
        suratAyat: "Ar-Rum: 21",
        namaPria: "Ahmad Fauzi",
        ayahPria: "Bapak H. Muhammad Rizki",
        ibuPria: "Ibu Hj. Siti Aminah",
        igPria: "@ahmadfauzi",
        namaWanita: "Rina Kartika",
        ayahWanita: "Bapak H. Bambang Suryadi",
        ibuWanita: "Ibu Hj. Sri Wahyuni",
        igWanita: "@rinakartika",
        tanggalAkad: "2025-08-15",
        jamAkad: "08:00",
        tanggalResepsi: "2025-08-15",
        jamResepsi: "11:00",
        namaVenueAkad: "Masjid Al-Ikhlas",
        alamatAkad: "Jl. Kebahagiaan No. 1, Jakarta Selatan",
        mapsAkad: "https://maps.google.com/?q=-6.2,106.8",
        namaVenueResepsi: "The Glass House",
        alamatResepsi: "Jl. Sudirman No. 123, Jakarta Selatan",
        mapsResepsi: "https://maps.google.com/?q=-6.2,106.8",
        dresscode: "Hitam & Gold",
        showLiveStreaming: false,
        urlVideoPrewed: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        fotoPrewed: [],
        ceritaPertemuan: "Kami bertemu pertama kali di kampus saat acara organisasi. Senyumnya yang membuat hati ini bergetar.",
        tanggalPertemuan: "2022-03-15",
        ceritaLamaran: "Setelah 2 tahun bersama, akhirnya lamaran dilakukan secara intim di rumah keluarga wanita.",
        tanggalLamaran: "2024-12-20",
        ceritaPernikahan: "Alhamdulillah, pernikahan kami dilaksanakan dengan penuh kebahagiaan.",
        tanggalPernikahan: "2025-08-15",
        rekening: [
            { bank: "BCA", nomor: "1234567890", atasNama: "Ahmad Fauzi" },
            { bank: "Mandiri", nomor: "0987654321", atasNama: "Rina Kartika" },
        ],
        ewallet: [
            { nama: "GoPay", nomor: "081234567890" },
            { nama: "DANA", nomor: "081234567890" },
        ],
    }

    return <VintageSunset {...data} />
}

export default function DemoVintagePage() {
    return (
        <Suspense>
            <Content />
        </Suspense>
    )
}