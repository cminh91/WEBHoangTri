"use client"

import { useEffect, useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"

interface AdminEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
}

export default function AdminEditor({ value, onChange, height = 500, placeholder }: AdminEditorProps) {
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full rounded-md border border-zinc-700 bg-zinc-800" style={{ height: `${height}px` }}>
        <div className="h-full w-full animate-pulse bg-zinc-800"></div>
      </div>
    )
  }

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY as string}
      onInit={(evt: unknown, editor: any) => (editorRef.current = editor)}
      value={value}
      onEditorChange={(newValue: string) => onChange(newValue)}
      init={{
        height,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "codesample",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | styleselect fontselect fontsizeselect | " +
          "bold italic underline strikethrough forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | " +
          "link image media anchor codesample table | " +
          "removeformat preview fullscreen | help",
        style_formats: [
          {
            title: "Font chữ",
            items: [
              { title: "Arial", inline: "span", styles: { fontFamily: "Arial, sans-serif" } },
              { title: "Courier New", inline: "span", styles: { fontFamily: "'Courier New', Courier, monospace" } },
              { title: "Georgia", inline: "span", styles: { fontFamily: "Georgia, serif" } },
              { title: "Tahoma", inline: "span", styles: { fontFamily: "Tahoma, sans-serif" } },
              { title: "Times New Roman", inline: "span", styles: { fontFamily: "'Times New Roman', Times, serif" } },
              { title: "Verdana", inline: "span", styles: { fontFamily: "Verdana, sans-serif" } },
            ],
          },
          {
            title: "Kích thước chữ",
            items: [
              { title: "Nhỏ", inline: "span", styles: { fontSize: "12px" } },
              { title: "Bình thường", inline: "span", styles: { fontSize: "14px" } },
              { title: "Lớn", inline: "span", styles: { fontSize: "18px" } },
              { title: "Rất lớn", inline: "span", styles: { fontSize: "24px" } },
            ],
          },
          {
            title: "Tiêu đề",
            items: [
              { title: "Heading 1", block: "h1" },
              { title: "Heading 2", block: "h2" },
              { title: "Heading 3", block: "h3" },
              { title: "Heading 4", block: "h4" },
              { title: "Heading 5", block: "h5" },
              { title: "Heading 6", block: "h6" },
            ],
          },
          {
            title: "Khác",
            items: [
              { title: "Đoạn trích", block: "blockquote" },
              { title: "Đoạn code", block: "pre" },
            ],
          },
        ],
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; }",
        placeholder: placeholder,
        skin: "oxide-dark",
        content_css: "dark",
        branding: false,
        promotion: false,
        resize: false,
      } as Record<string, any>}
      // className="border border-zinc-700 rounded-md"
    />
  )
}

