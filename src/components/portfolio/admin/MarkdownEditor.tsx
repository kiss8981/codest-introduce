"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Markdown],
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getMarkdown()),
  });

  if (!editor) return <div className="min-h-48 rounded-lg border border-[#cbd5df] bg-white" />;

  const controls = [
    { label: "굵게", action: () => editor.chain().focus().toggleBold().run() },
    { label: "기울임", action: () => editor.chain().focus().toggleItalic().run() },
    { label: "제목", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "소제목", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "목록", action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "번호 목록", action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "인용", action: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  function addLink() {
    if (!editor) return;
    const href = window.prompt("링크 주소를 입력해 주세요. (https://)");
    if (!href) return;
    if (!href.startsWith("https://")) {
      window.alert("https:// 주소만 사용할 수 있습니다.");
      return;
    }
    editor.chain().focus().setLink({ href }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#cbd5df] bg-white">
      <div
        className="flex flex-wrap gap-1 border-b border-[#dce4ea] bg-[#f8fafc] p-2"
        aria-label="소개글 서식"
      >
        {controls.map((control) => (
          <button
            key={control.label}
            type="button"
            onClick={control.action}
            className="rounded-md px-3 py-2 text-xs font-semibold text-[#284052] hover:bg-[#e5eef4]"
          >
            {control.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="rounded-md px-3 py-2 text-xs font-semibold text-[#284052] hover:bg-[#e5eef4]"
        >
          링크
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="rounded-md px-3 py-2 text-xs font-semibold text-[#284052] hover:bg-[#e5eef4]"
        >
          되돌리기
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-48 px-5 py-3 text-[15px] leading-7 text-[#253846] [&_.ProseMirror]:min-h-44 [&_.ProseMirror]:outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-[#9ab8c9] [&_blockquote]:pl-4 [&_h2]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
}
