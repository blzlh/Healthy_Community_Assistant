"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/react";

import Image from "next/image";

export function CommunityPostContent({
  content,
  images = [],
}: {
  content: JSONContent;
  images?: string[];
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "text-sm text-white/90 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ul]:list-disc [&_ol]:list-decimal",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const imageCount = images.length;
  const isSingle = imageCount === 1;

  return (
    <div className="flex flex-col gap-4">
      {/* 文本内容：使用 Tiptap 只读模式渲染 */}
      <EditorContent editor={editor} />
      
      {/* 图片内容：类似微信朋友圈的网格布局 */}
      {images && imageCount > 0 && (
        <div
          className={
            isSingle
              ? "max-w-[80%] sm:max-w-[30%]" // 单张图限制宽度，保持原始比例
              : "grid w-fit grid-cols-3 gap-1.5" // 多张图强制 3 列网格，自动换行
          }
        >
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border border-white/10 bg-white/5 ${
                isSingle ? "w-full" : "aspect-square w-28 sm:w-36"
              }`}
            >
              {isSingle ? (
                // 单张图不裁剪，完整显示
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={`post-image-${index}`}
                  className="h-auto w-full rounded-lg object-contain"
                />
              ) : (
                // 多张图正方形裁切
                <Image
                  src={img}
                  alt={`post-image-${index}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
