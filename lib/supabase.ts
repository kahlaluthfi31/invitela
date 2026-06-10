import { createBrowserClient } from "@supabase/ssr"

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const THUMBNAIL_BUCKET = "thumbnails"

export async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const safeExt = ["png", "jpeg", "jpg", "webp"].includes(ext) ? ext : "jpg"
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}
