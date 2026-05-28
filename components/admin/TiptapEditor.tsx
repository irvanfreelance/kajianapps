"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { List, ListOrdered, Bold, Italic } from "lucide-react";

interface TiptapEditorProps {
  value: string;             // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TiptapEditor({ value, onChange, placeholder = "Tulis instruksi...", minHeight = 140 }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. when modal opens with existing data)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value && value !== undefined) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const btnBase: React.CSSProperties = {
    background: "none", border: "1px solid #E2E8F0", borderRadius: 6,
    padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center",
    gap: 4, fontSize: 12, fontWeight: 600, color: "#475569",
    transition: "all 0.15s",
  };
  const btnActive: React.CSSProperties = {
    ...btnBase, background: "#ECFEFF", borderColor: "#67E8F9", color: "#0891B2",
  };

  return (
    <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", gap: 6, padding: "8px 10px",
        background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap",
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={editor.isActive("bold") ? btnActive : btnBase}
          title="Bold"
        >
          <Bold size={13} /> Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={editor.isActive("italic") ? btnActive : btnBase}
          title="Italic"
        >
          <Italic size={13} /> Italic
        </button>
        <div style={{ width: 1, background: "#E2E8F0", margin: "0 2px" }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={editor.isActive("orderedList") ? btnActive : btnBase}
          title="Ordered List"
        >
          <ListOrdered size={14} /> Numbered
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={editor.isActive("bulletList") ? btnActive : btnBase}
          title="Bullet List"
        >
          <List size={14} /> Bullet
        </button>
      </div>

      {/* Editor Content Area */}
      <div style={{ minHeight, padding: "10px 12px" }}>
        <style>{`
          .tiptap-editor .tiptap { outline: none; min-height: ${minHeight - 20}px; font-size: 14px; color: #1E293B; line-height: 1.65; }
          .tiptap-editor .tiptap p { margin: 0 0 4px; }
          .tiptap-editor .tiptap ol { margin: 4px 0 4px 20px; padding: 0; list-style: decimal; }
          .tiptap-editor .tiptap ul { margin: 4px 0 4px 20px; padding: 0; list-style: disc; }
          .tiptap-editor .tiptap li { margin-bottom: 3px; }
          .tiptap-editor .tiptap strong { font-weight: 700; }
          .tiptap-editor .tiptap em { font-style: italic; }
          .tiptap-editor .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left; color: #CBD5E1; pointer-events: none; height: 0;
          }
        `}</style>
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
