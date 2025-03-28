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
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={(newValue) => onChange(newValue)}
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
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        placeholder: placeholder,
        skin: "oxide-dark",
        content_css: "dark",
        branding: false,
        promotion: false,
        resize: false,
      }}
      // className="border border-zinc-700 rounded-md"
    />
  )
}

