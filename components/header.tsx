"use client"

import type React from "react"
import { useState } from "react"
import { Menu, X, ArrowUpRight, ArrowRight } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = true

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setIsOpen(false)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "px-4 pt-4" : ""}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-2xl ${
          isScrolled
            ? "bg-white/70 backdrop-blur-xl border border-zinc-200 px-6 py-3"
            : "bg-background/90 backdrop-blur-md px-6 py-5"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <img src="/images/logo-invitela-horizontal.png" alt="invitela" className="w-24 h-12" />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#template"
              onClick={(e) => handleSmoothScroll(e, "template")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Template
            </a>
            <a
              href="#why-choose-us"
              onClick={(e) => handleSmoothScroll(e, "why-choose-us")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Keunggulan
            </a>
            <a
              href="#feature-us"
              onClick={(e) => handleSmoothScroll(e, "feature-us")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fitur
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Testimoni
            </a>
            <a
              href="#order"
              onClick={(e) => handleSmoothScroll(e, "order")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pemesanan
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-1">
          </div>

          <button
            className={`md:hidden transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav
            className={`md:hidden mt-6 pb-6 flex flex-col gap-4 border-t pt-6 ${
              isScrolled ? "border-zinc-200" : "border-border"
            }`}
          >
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "how-it-works")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mission
            </a>
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "pricing")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Properties
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviews
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, "faq")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FAQ
            </a>
            <div
              className={`flex flex-col gap-3 mt-4 pt-4 border-t ${isScrolled ? "border-zinc-200" : "border-border"}`}
            >
              <a href="#" className={isScrolled ? "text-black" : "text-foreground"}>
                Login
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
