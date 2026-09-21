import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

import { getPublishedPostBySlug, type Post } from "@/lib/posts"

export function KnowledgeArticle() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    setPost(undefined)
    getPublishedPostBySlug(slug).then(setPost)
  }, [slug])

  if (post === undefined) {
    return <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
  }

  if (post === null) {
    return <Navigate to="/knowledge" replace />
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to="/knowledge" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าความรู้ทางการเงิน
      </Link>

      <div className="flex flex-col gap-3">
        {post.category && (
          <span className="w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {post.category}
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{post.title}</h1>
        {post.published_at && (
          <p className="text-sm text-muted-foreground">
            เผยแพร่เมื่อ{" "}
            {new Date(post.published_at).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="w-full rounded-xl border border-border object-cover" />
      )}

      <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.body_html }} />

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
