"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/react";

type CommunityPostEditorProps = {
  onChange: (payload: { contentJson: JSONContent; contentText: string; isEmpty: boolean }) => void;
  resetSignal: number;
};

function ActionButton({
  active,
  icon,
  onClick,
}: {
  active: boolean;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md border text-white transition ${
        active
          ? "border-white/30 bg-white/20"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <Icon icon={icon} className="h-4 w-4" />
    </button>
  );
}

export function CommunityPostEditor({ onChange, resetSignal }: CommunityPostEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-36 w-full rounded-b-xl border border-t-0 border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ul]:list-disc [&_ol]:list-decimal",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange({
        contentJson: instance.getJSON(),
        contentText: instance.getText().trim(),
        isEmpty: instance.isEmpty,
      });
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.clearContent();
    onChange({
      contentJson: editor.getJSON(),
      contentText: "",
      isEmpty: true,
    });
  }, [editor, onChange, resetSignal]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <ActionButton
          active={editor.isActive("bold")}
          icon="material-symbols:format-bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ActionButton
          active={editor.isActive("italic")}
          icon="material-symbols:format-italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ActionButton
          active={editor.isActive("bulletList")}
          icon="material-symbols:format-list-bulleted"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ActionButton
          active={editor.isActive("orderedList")}
          icon="material-symbols:format-list-numbered"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ActionButton
          active={editor.isActive("blockquote")}
          icon="material-symbols:format-quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
