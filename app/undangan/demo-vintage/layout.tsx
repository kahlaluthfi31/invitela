export default function UndanganLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

// agar header dan footer tidak muncul di halaman demo, kita buat layout khusus untuk demo ini yang hanya render children tanpa header dan footer