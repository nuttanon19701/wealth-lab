import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listPublishedPosts, type Post } from "@/lib/posts"
import { cn } from "@/lib/utils"

export function Knowledge() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    listPublishedPosts()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))),
    [posts],
  )

  const filteredPosts = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">ความรู้ทางการเงิน</h1>
        <p className="max-w-2xl text-muted-foreground">
          บทความและแนวคิดด้านการวางแผนการเงินและการลงทุน อัปเดตเป็นระยะโดยทีมงาน Wealth Lab
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีบทความในหมวดนี้</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/knowledge/${post.slug}`} className="group">
              <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Wealth Lab
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1 gap-2">
                  {post.category && (
                    <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                      {post.category}
                    </span>
                  )}
                  <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                  {post.published_at && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(post.published_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
