import {
  Sparkles,
  Headset,
  Users,
  Leaf,
  Heart,
  Star,
  Shield,
  Clock,
  Zap,
  Gift,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const LANDING_ICON_OPTIONS = [
  { value: "Sparkles", label: "Sparkles" },
  { value: "Headset", label: "Headset" },
  { value: "Users", label: "Users" },
  { value: "Leaf", label: "Leaf" },
  { value: "Heart", label: "Heart" },
  { value: "Star", label: "Star" },
  { value: "Shield", label: "Shield" },
  { value: "Clock", label: "Clock" },
  { value: "Zap", label: "Zap" },
  { value: "Gift", label: "Gift" },
] as const

export type LandingIconName = (typeof LANDING_ICON_OPTIONS)[number]["value"]

export const landingIconMap: Record<string, LucideIcon> = {
  Sparkles,
  Headset,
  Users,
  Leaf,
  Heart,
  Star,
  Shield,
  Clock,
  Zap,
  Gift,
}

export function getLandingIcon(name: string): LucideIcon {
  return landingIconMap[name] ?? Sparkles
}
