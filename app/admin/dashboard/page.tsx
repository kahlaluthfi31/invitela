import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { LayoutTemplate, FolderOpen, ShoppingCart, ToggleLeft } from "lucide-react"

async function getStats() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const [templates, kategori, pesanan, fitur] = await Promise.all([
    supabase.from("templates").select("*", { count: "exact", head: true }),
    supabase.from("kategori").select("*", { count: "exact", head: true }),
    supabase.from("pesanan").select("*", { count: "exact", head: true }),
    supabase
      .from("fitur_toggle")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ])

  return {
    templates: templates.count ?? 0,
    kategori: kategori.count ?? 0,
    pesanan: pesanan.count ?? 0,
    fiturAktif: fitur.count ?? 0,
  }
}

const statCards = [
  {
    key: "templates",
    label: "Total Template",
    icon: LayoutTemplate,
    color: "#96A78D",
    bg: "#D9E9CF",
  },
  {
    key: "kategori",
    label: "Total Kategori",
    icon: FolderOpen,
    color: "#7FA8D4",
    bg: "#DAEAF7",
  },
  {
    key: "pesanan",
    label: "Total Pesanan",
    icon: ShoppingCart,
    color: "#C8956C",
    bg: "#F7E8DB",
  },
  {
    key: "fiturAktif",
    label: "Fitur Aktif",
    icon: ToggleLeft,
    color: "#A990C8",
    bg: "#EDE6F5",
  },
]

export default async function DashboardPage() {
  const stats = await getStats()

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => {
          const value = stats[key as keyof typeof stats]
          return (
            <div
              key={key}
              className="flex items-center gap-4 rounded-xl p-5"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(150,167,141,0.18)",
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
              }}
            >
              {/* Icon circle */}
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: bg,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>

              {/* Text */}
              <div>
                <p
                  className="text-3xl font-bold leading-none"
                  style={{ color: "#1a1a1a" }}
                >
                  {value}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Welcome banner */}
      <div
        className="mt-8 rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #D9E9CF 0%, #EFF6EC 100%)",
          border: "1px solid rgba(150,167,141,0.25)",
        }}
      >
        <p
          className="font-serif text-lg font-semibold"
          style={{ color: "#3D6B33" }}
        >
          Selamat datang di panel admin Invitela
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Kelola template, kategori, fitur, dan pesanan undangan digital dari sini.
        </p>
      </div>
    </div>
  )
}
