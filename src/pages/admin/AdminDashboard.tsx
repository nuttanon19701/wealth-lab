import { LogOut, Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deletePost, listAllPosts, type Post } from "@/lib/posts"
import { supabase } from "@/lib/supabaseClient"

export function AdminDashboard() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      setPosts(await listAllPosts())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDelete(post: Post) {
    if (!window.confirm(`ลบบทความ "${post.title}" ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้`)) return
    await deletePost(post.id)
    refresh()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">จัดการบทความ</h1>
          <p className="text-sm text-muted-foreground">เขียน แก้ไข และเผยแพร่บทความความรู้ทางการเงิน</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/new">
              <Plus className="h-4 w-4" />
              เขียนบทความใหม่
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">บทความทั้งหมด ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : posts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีบทความ เริ่มเขียนบทความแรกของคุณได้เลย</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อบทความ</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>แก้ไขล่าสุด</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-64 truncate font-medium text-foreground">{post.title}</TableCell>
                      <TableCell className="text-muted-foreground">{post.category || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            post.status === "published"
                              ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
                              : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {post.status === "published" ? "เผยแพร่แล้ว" : "แบบร่าง"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(post.updated_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/admin/edit/${post.id}`} aria-label="แก้ไข">
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(post)}
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
