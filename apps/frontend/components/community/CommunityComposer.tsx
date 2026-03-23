"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "antd";
import type { JSONContent } from "@tiptap/react";

import { CommunityPostEditor } from "@/components/community/CommunityPostEditor";
import { Toast } from "@/components/ui/Toast/Toast";
import { useCommunity } from "@/hooks/use-community";
import { useAuthStore } from "@/store/auth-store";

type PostDraft = {
  contentJson: JSONContent;
  contentText: string;
  isEmpty: boolean;
};

export function CommunityComposer() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const { publishing, publishPost } = useCommunity();
  const [resetSignal, setResetSignal] = useState(0);
  const [draft, setDraft] = useState<PostDraft>({
    contentJson: { type: "doc", content: [] },
    contentText: "",
    isEmpty: true,
  });

  const handleEditorChange = useCallback(
    ({ contentJson, contentText, isEmpty }: PostDraft) => {
      setDraft({ contentJson, contentText, isEmpty });
    },
    []
  );

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
        <div className="text-base font-semibold">请先登录后发布动态</div>
        <Link href="/auth/login" className="mt-2 inline-block text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">写动态</h1>
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

      <CommunityPostEditor resetSignal={resetSignal} onChange={handleEditorChange} />

      <div className="mt-3 flex justify-end">
        <Button
          type="primary"
          loading={publishing}
          disabled={draft.isEmpty}
          className="!bg-zinc-800 !text-white hover:!bg-zinc-700"
          onClick={async () => {
            const result = await publishPost({
              contentJson: draft.contentJson,
              contentText: draft.contentText,
            });
            if (!result.ok) {
              Toast.error({
                title: "发布失败",
                message: result.message ?? "请稍后重试",
              });
              return;
            }
            Toast.success({
              message: "动态发布成功",
            });
            setResetSignal((value) => value + 1);
            router.push("/community");
          }}
        >
          发布动态
        </Button>
      </div>
    </section>
  );
}
