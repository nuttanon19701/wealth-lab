import { ArrowLeft, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createPost,
  getPostById,
  listAllPosts,
  slugify,
  updatePost,
  type Post,
  type PostInput,
  type PostStatus,
} from "@/lib/posts"
import { uploadArticleImage } from "@/lib/uploadImage"

const emptyForm: PostInput = {
  title: "",
  slug: "",
  excerpt: "",
  cover_image_url: "",
  category: "",
  tags: [],
  body_html: "",
  status: "draft",
}

export function AdminEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<PostInput>(emptyForm)
  const [tagsText, setTagsText] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasPublished, setWasPublished] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [coverUploading, setCoverUploading] = useState(false)

  useEffect(() => {
    listAllPosts().then((posts) => {
      const cats = Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c))))
      setExistingCategories(cats)
    })
  }, [])

  useEffect(() => {
    if (!id) return
    getPostById(id).then((post: Post | null) => {
      if (!post) {
        setError("ไม่พบบทความนี้")
        setLoading(false)
        return
      }
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        cover_image_url: post.cover_image_url ?? "",
        category: post.category ?? "",
        tags: post.tags,
        body_html: post.body_html,
        status: post.status,
      })
      setTagsText(post.tags.join(", "))
      setWasPublished(post.status === "published")
      setSlugTouched(true)
      setLoading(false)
    })
  }, [id])

  function updateField<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(title: string) {
    updateField("title", title)
    if (!slugTouched) {
      updateField("slug", slugify(title))
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setCoverUploading(true)
    try {
      const url = await uploadArticleImage(file)
      updateField("cover_image_url", url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ")
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleSave(status: PostStatus) {
    if (!form.title.trim()) {
      setError("กรุณาใส่ชื่อบทความ")
      return
    }
    if (!form.slug.trim()) {
      setError("กรุณาใส่ slug (URL) ของบทความ")
      return
    }
    setSaving(true)
    setError(null)

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: PostInput = { ...form, tags, status }

    try {
      if (isEditing && id) {
        await updatePost(id, payload, wasPublished)
      } else {
        await createPost(payload)
      }
      navigate("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">กำลังโหลด...</div>
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารายการ
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            บันทึกแบบร่าง
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "เผยแพร่"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isEditing ? "แก้ไขบทความ" : "เขียนบทความใหม่"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">ชื่อบทความ</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="เช่น 5 วิธีเริ่มต้นลงทุนสำหรับมือใหม่"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                updateField("slug", slugify(e.target.value))
              }}
            />
            <p className="text-xs text-muted-foreground">/knowledge/{form.slug || "..."}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                list="category-suggestions"
                value={form.category ?? ""}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="เช่น การลงทุน, ภาษี, เกษียณ"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tags">แท็ก (คั่นด้วยจุลภาค)</Label>
              <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="หุ้น, กองทุน, DCA" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="excerpt">คำโปรย (แสดงในหน้ารายการบทความ)</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt ?? ""}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>ภาพหน้าปก</Label>
            {form.cover_image_url && (
              <img
                src={form.cover_image_url}
                alt="ภาพหน้าปก"
                className="h-40 w-full rounded-lg border border-border object-cover"
              />
            )}
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent">
              <Upload className="h-4 w-4" />
              {coverUploading ? "กำลังอัปโหลด..." : form.cover_image_url ? "เปลี่ยนภาพหน้าปก" : "อัปโหลดภาพหน้าปก"}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>เนื้อหาบทความ</Label>
            <RichTextEditor
              key={id ?? "new"}
              initialContent={form.body_html}
              onChange={(html) => updateField("body_html", html)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:w-56">
            <Label>สถานะ</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v as PostStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">แบบร่าง</SelectItem>
                <SelectItem value="published">เผยแพร่แล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
