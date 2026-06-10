import { createServerSupabase } from "@/lib/supabase-server"

export type LandingSection = {
  id: number
  section_key: string
  label: string
  content: Record<string, unknown>
  is_active?: boolean
}

export function hasItems(items: unknown): boolean {
  return Array.isArray(items) && items.length > 0
}

export function isSectionActive(section: LandingSection): boolean {
  return section.is_active !== false
}

export async function fetchLandingSections(): Promise<{
  sectionMap: Record<string, LandingSection> | null
  error: Error | null
}> {
  const supabase = await createServerSupabase()
  const { data: sections, error } = await supabase
    .from("landing_sections")
    .select("*")
    .order("id")

  if (error || !sections || sections.length === 0) {
    return { sectionMap: null, error: error ? new Error(error.message) : null }
  }

  const activeSections = (sections as LandingSection[]).filter(isSectionActive)
  const sectionMap = Object.fromEntries(
    activeSections.map((s) => [s.section_key, s])
  )

  return { sectionMap, error: null }
}

export function getSectionContent(
  sectionMap: Record<string, LandingSection> | null,
  key: string
): Record<string, unknown> | undefined {
  return sectionMap?.[key]?.content
}

/** Returns value if non-empty string, otherwise undefined so component defaults apply. */
export function strOrUndefined(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined
  const trimmed = val.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
