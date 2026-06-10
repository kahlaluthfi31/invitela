import { createBrowserClient } from "@supabase/ssr"

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from("thumbnails").upload(fileName, file)
  if (error) throw error
  const {
    data: { publicUrl },
  } = supabase.storage.from("thumbnails").getPublicUrl(fileName)
  return publicUrl
}
