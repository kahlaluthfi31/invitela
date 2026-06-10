"use client"

import { useState } from "react"
import type React from "react"
import { Sidebar, SidebarToggle } from "@/components/admin/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ backgroundColor: "#FAF9EE" }} className="min-h-screen">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Top header (mobile only) */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid rgba(150,167,141,0.2)",
          }}
        >
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <span
            className="font-serif text-xl font-semibold tracking-wide"
            style={{ color: "#96A78D" }}
          >
            Invitela
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
