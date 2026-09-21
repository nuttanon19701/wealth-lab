import ImageExtension from "@tiptap/extension-image"
import LinkExtension from "@tiptap/extension-link"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadArticleImage } from "@/lib/uploadImage"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  initialContent: string
  onChange: (html: string) => void
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingRef = useRef(false)
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkValue, setLinkValue] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[300px] rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm focus:outline-none",
      },
    },
  })

  if (!editor) return null

  function openLinkPopover() {
    const currentUrl = editor?.getAttributes("link").href as string | undefined
    setLinkValue(currentUrl ?? "https://")
    setLinkPopoverOpen(true)
  }

  function applyLink() {
    const url = linkValue.trim()
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    setLinkPopoverOpen(false)
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setLinkPopoverOpen(false)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || uploadingRef.current) return
    uploadingRef.current = true
    try {
      const url = await uploadArticleImage(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ")
    } finally {
      uploadingRef.current = false
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative flex flex-wrap items-center gap-0.5 rounded-t-md border border-input bg-muted/40 p-1">
        <ToolbarButton
          label="ตัวหนา"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="ตัวเอียง"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="หัวข้อใหญ่"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="หัวข้อย่อย"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="รายการแบบจุด"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="รายการแบบเลข"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="คำพูดอ้างอิง"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="ใส่ลิงก์" active={editor.isActive("link")} onClick={openLinkPopover}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {linkPopoverOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 flex items-center gap-1.5 rounded-md border border-border bg-popover p-2 shadow-md">
            <Input
              autoFocus
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applyLink()
                } else if (e.key === "Escape") {
                  setLinkPopoverOpen(false)
                }
              }}
              placeholder="https://example.com"
              className="h-8 w-56 text-sm"
            />
            <Button type="button" size="sm" onClick={applyLink} className="h-8">
              ใส่ลิงก์
            </Button>
            {editor.isActive("link") && (
              <Button type="button" size="sm" variant="ghost" onClick={removeLink} className="h-8">
                ลบลิงก์
              </Button>
            )}
          </div>
        )}
        <ToolbarButton label="แทรกรูปภาพ" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton label="ย้อนกลับ" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="ทำซ้ำ" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
