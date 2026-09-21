import { supabase } from "@/lib/supabaseClient"

export type PostStatus = "draft" | "published"

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  category: string | null
  tags: string[]
  body_html: string
  status: PostStatus
  created_at: string
  updated_at: string
  published_at: string | null
}

export type PostInput = Pick<
  Post,
  "title" | "slug" | "excerpt" | "cover_image_url" | "category" | "tags" | "body_html" | "status"
>

export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function listPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase.from("posts").select("*").order("updated_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle()

  if (error) throw error
  return data
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...input,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePost(id: string, input: PostInput, wasPublished: boolean): Promise<Post> {
  const nowPublishing = input.status === "published" && !wasPublished
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...input,
      ...(nowPublishing ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id)
  if (error) throw error
}
