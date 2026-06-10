"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  FileText,
  Layout,
  FolderOpen,
  SlidersHorizontal,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const navItems = [
  { label: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { label: "Landing Page", icon: FileText, href: "/admin/dashboard/landing-page" },
  { label: "Template", icon: Layout, href: "/admin/dashboard/template" },
  { label: "Kategori", icon: FolderOpen, href: "/admin/dashboard/kategori" },
  { label: "Pesanan", icon: ClipboardList, href: "/admin/dashboard/pesanan" },
  { label: "Pengaturan", icon: Settings, href: "/admin/dashboard/pengaturan" },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  function handleNav(href: string) {
    router.push(href)
    onClose()
  }

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid rgba(150,167,141,0.2)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(150,167,141,0.12)" }}
        >
          <span
            className="font-serif text-2xl font-semibold tracking-wide select-none"
            style={{ color: "#96A78D" }}
          >
            Invitela
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map(({ label, icon: Icon, href }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <button
                    onClick={() => handleNav(href)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150 text-left
                      ${
                        active
                          ? "font-semibold"
                          : "font-normal hover:bg-[#FAF9EE]"
                      }
                    `}
                    style={
                      active
                        ? {
                            backgroundColor: "#D9E9CF",
                            color: "#96A78D",
                          }
                        : { color: "#4a4a4a" }
                    }
                  >
                    <Icon
                      size={17}
                      className="shrink-0"
                      style={active ? { color: "#96A78D" } : { color: "#6b7280" }}
                    />
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid rgba(150,167,141,0.2)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
              font-normal text-red-400 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut size={17} className="shrink-0 text-red-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

// Hamburger button untuk dipakai di header mobile
export function SidebarToggle({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-[#FAF9EE] transition-colors"
      aria-label="Buka menu"
    >
      <Menu size={20} />
    </button>
  )
}
