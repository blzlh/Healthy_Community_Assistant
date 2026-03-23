"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CommunityComposer } from "@/components/community/CommunityComposer";
import { useCommunity } from "@/hooks/use-community";
import { Spin, Modal } from "antd";
import type { CommunityPost } from "@/services/community";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/ui/Toast/Toast";

export default function CommunityEditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { loadPosts, deletePost } = useCommunity();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalCancelButtonClass =
    "!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20";
  const modalDangerOkButtonClass =
    "!bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20 hover:!border-red-500/30";

  useEffect(() => {
    async function fetchPost() {
      const result = await loadPosts("mine");
      if (result.ok) {
        const found = result.posts?.find((p) => p.id === postId);
        if (found) {
          setPost(found);
        }
      }
      setLoading(false);
    }
    fetchPost();
  }, [postId, loadPosts]);

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

  if (loading) {
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
