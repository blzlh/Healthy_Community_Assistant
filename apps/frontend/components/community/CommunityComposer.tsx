"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "antd";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";

import { CommunityPostEditor } from "@/components/community/CommunityPostEditor";
import { Toast } from "@/components/ui/Toast/Toast";
import { useCommunity } from "@/hooks/use-community";
import { useAuthStore } from "@/store/auth-store";

type PostDraft = {
  contentJson: JSONContent;
  contentText: string;
  isEmpty: boolean;
};

export function CommunityComposer({
  postId,
  initialData,
}: {
  postId?: string;
  initialData?: {
    contentJson: JSONContent;
    contentText: string;
    images: string[];
  };
}) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const { publishing, publishPost, editPost } = useCommunity();
  const [resetSignal, setResetSignal] = useState(0);
  const [draft, setDraft] = useState<PostDraft>(
    initialData
      ? {
          contentJson: initialData.contentJson,
          contentText: initialData.contentText,
          isEmpty: false,
        }
      : {
          contentJson: { type: "doc", content: [] },
          contentText: "",
          isEmpty: true,
        }
  );
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);

  const handleEditorChange = useCallback(
    ({ contentJson, contentText, isEmpty }: PostDraft) => {
      setDraft({ contentJson, contentText, isEmpty });
    },
    []
  );

  // 处理图片上传预览（Base64 方案）
  const handleBeforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
    return false; // 拦截 antd 默认上传行为，由发布按钮统一提交
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        正在加载登录状态...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-base font-semibold">
          请先登录后{postId ? "编辑" : "发布"}动态
        </div>
        <Link href="/auth/login" className="mt-2 inline-block text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  if (user?.isBanned) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-200">
        <div className="flex items-center gap-2 text-base font-semibold">
          <Icon icon="lucide:alert-circle" className="h-5 w-5" />
          账号已被封禁
        </div>
        <p className="mt-2 text-sm text-red-200/70">
          您的账号目前处于封禁状态，无法发布动态。如有疑问请联系管理员。
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">
            {postId ? "编辑动态" : "写动态"}
          </h1>
          <p className="mt-1 text-xs text-white/50">
            发布身份：{(user?.name ?? user?.email ?? "匿名用户").trim()}
          </p>
        </div>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          <Icon icon="material-symbols:arrow-back" className="h-4 w-4" />
          返回动态
        </Link>
      </div>

      <CommunityPostEditor
        resetSignal={resetSignal}
        initialContent={initialData?.contentJson}
        onChange={handleEditorChange}
        onImageUpload={handleBeforeUpload}
      />

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="mt-4 grid w-fit grid-cols-3 gap-2 sm:gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative h-28 w-28 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-32 sm:w-32"
            >
              <Image
                src={img}
                alt={`preview-${index}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100 sm:h-6 sm:w-6"
                onClick={() => handleRemoveImage(index)}
              >
                <Icon icon="material-symbols:close" className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          loading={publishing}
          disabled={draft.isEmpty && images.length === 0}
          className="!bg-zinc-800 !text-white hover:!bg-zinc-700 disabled:!opacity-50"
          onClick={async () => {
            const payload = {
              contentJson: draft.contentJson,
              contentText: draft.contentText,
              images,
            };

            const result = postId
              ? await editPost(postId, payload)
              : await publishPost(payload);

            if (!result.ok) {
              Toast.error({
                title: postId ? "编辑失败" : "发布失败",
                message: result.message ?? "请稍后重试",
              });
              return;
            }
            Toast.success({
              message: postId ? "动态更新成功" : "动态发布成功",
            });
            if (!postId) {
              setResetSignal((s) => s + 1);
              setImages([]);
            }
            router.push("/community");
          }}
        >
          {postId ? "保存修改" : "发布"}
        </Button>
      </div>
    </section>
  );
}
