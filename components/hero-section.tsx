"use client"
import { useEffect, useState } from "react"
import { AnimatedText } from "./animated-text"

export interface HeroSectionProps {
  heading?: string
  subheading?: string
}

export function HeroSection({
  heading = "Undangan Spesial",
  subheading = "untuk momen bahagia mu",
}: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let rafId: number
    let currentProgress = 0

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 400
      const targetProgress = Math.min(scrollY / maxScroll, 1)

      const smoothUpdate = () => {
        currentProgress += (targetProgress - currentProgress) * 0.1

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
          setScrollProgress(currentProgress)
          rafId = requestAnimationFrame(smoothUpdate)
        } else {
          setScrollProgress(targetProgress)
        }
      }

      cancelAnimationFrame(rafId)
      smoothUpdate()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section className="pt-32 pb-12 px-6 min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 top-0">
        <div
          className="w-full will-change-transform overflow-hidden"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
          }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover" src="/videos/background-hero.mp4" />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center"
        style={{
          transform: `translateY(${scrollProgress * 150}px)`,
          opacity: 1 - scrollProgress * 0.8,
          height: "100%",
        }}
      >
        <span
          className="block text-white font-bold text-[28vw] sm:text-[25vw] md:text-[22vw] lg:text-[20vw] tracking-tighter select-none text-center leading-none"
          style={{ marginBottom: "0" }}
        >
          Invitela
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <h1 className="font-serif leading-tight w-full px-4 max-w-6xl mx-auto text-center">
          <span className="block text-[#FAF9EE] text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem] 2xl:text-[8rem] font-bold text-center whitespace-nowrap">
            <AnimatedText
              text={heading}
              delay={0.3}
              className="font-bold text-[#FAF9EE] text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[6rem] 2xl:text-[7rem] text-center whitespace-nowrap"
            />
          </span>
          <span className="block text-xl sm:text-2xl md:text-3xl text-[#FAF9EE] my-3 text-center">
            <AnimatedText
              text={subheading}
              delay={0.6}
              className="font-normal text-2xl sm:text-5xl md:text-6xl text-[#FAF9EE] tracking-normal text-center"
            />
          </span>
        </h1>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div
              className={`relative w-[234px] md:w-[281px] lg:w-[351px] will-change-transform transition-all duration-[1500ms] ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
                }`}
            >
              <img src="/images/iphone-frame.png" alt="invitela" className="w-full h-auto relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
