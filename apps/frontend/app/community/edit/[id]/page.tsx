"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CommunityComposer } from "@/components/community/CommunityComposer";
import { useCommunity } from "@/hooks/use-community";
import { Spin, Modal } from "antd";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/ui/Toast/Toast";
import { useAuthStore } from "@/store/auth-store";

export default function CommunityEditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);

  // 从 hook 获取 posts（来自 store）和方法
  const { posts, loadPosts, deletePost } = useCommunity();

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  // 使用 ref 防止重复请求
  const hasLoadedRef = useRef(false);

  const modalCancelButtonClass =
    "!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20";
  const modalDangerOkButtonClass =
    "!bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20 hover:!border-red-500/30";

  // 从 store 的 posts 中查找当前要编辑的帖子
  const post = posts.find((p) => p.id === postId);

  useEffect(() => {
    // 等待认证状态加载完成
    if (!hydrated) return;

    // 未登录则直接返回
    if (!token) {
      setLoading(false);
      return;
    }

    // 如果已经加载过，不再重复请求
    if (hasLoadedRef.current) return;

    // 如果 store 中已经有数据，不需要重新请求
    if (posts.length > 0) {
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    async function fetchPost() {
      hasLoadedRef.current = true;
      await loadPosts("mine");
      setLoading(false);
    }
    fetchPost();
  }, [hydrated, token, posts.length, loadPosts]);

  const handleDelete = () => {
    Modal.confirm({
      centered: true,
      title: <span className="text-white">确定要删除这篇动态吗？</span>,
      content: <span className="text-white/70">删除后将无法恢复，请谨慎操作。</span>,
      icon: <Icon icon="ep:warn-triangle-filled" className="text-2xl text-yellow-400 pr-2 h-8 w-8" />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      okButtonProps: {
        className: modalDangerOkButtonClass,
      },
      cancelButtonProps: {
        className: modalCancelButtonClass,
      },
      onOk: async () => {
        setIsDeleting(true);
        const result = await deletePost(postId);
        if (result.ok) {
          Toast.success({
            title: "动态已删除",
          });
          router.push("/community");
        } else {
          Toast.error({
            title: "删除失败",
            message: result.message || "删除失败，请稍后重试",
          });
        }
        setIsDeleting(false);
      },
      classNames: {
        container: "!bg-[#131212] border border-white/10 ",
        header: "bg-[#131212] border-b border-white/10",
        body: "bg-[#131212] text-white",
        title: "text-white",
        wrapper: "text-white",
      },
      styles: {
        mask: {
          background: "rgba(0,0,0,0.65)",
        },
      },
    });
  };

  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Spin size="large" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">动态不存在或无权编辑</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <CommunityComposer
          postId={postId}
          initialData={{
            contentJson: post.contentJson,
            contentText: post.contentText,
            images: post.images,
          }}
          showDeleteButton
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
