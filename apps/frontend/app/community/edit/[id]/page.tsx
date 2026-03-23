"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CommunityComposer } from "@/components/community/CommunityComposer";
import { useCommunity } from "@/hooks/use-community";
import { Spin } from "antd";
import type { CommunityPost } from "@/services/community";

export default function CommunityEditPage() {
  const params = useParams();
  const postId = params.id as string;
  const { loadPosts } = useCommunity();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);

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
        />
      </div>
    </main>
  );
}
