"use client";

import { CommunityPostContent } from "@/components/community/CommunityPostContent";
import { CommentComposer, CommentList } from "@/components/community/feed/CommentSection";
import { CommentButton, LikeButton } from "@/components/community/feed/PostActions";
import { PostHeader } from "@/components/community/feed/PostHeader";
import type { CommunityPost } from "@/services/community";

export function PostCard({
  post,
  isOwnPost,
  isCommentsOpen,
  commentText,
  commentSubmitting,
  onToggleLike,
  onToggleComments,
  onChangeCommentText,
  onSubmitComment,
}: {
  post: CommunityPost;
  isOwnPost: boolean;
  isCommentsOpen: boolean;
  commentText: string;
  commentSubmitting: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onChangeCommentText: (value: string) => void;
  onSubmitComment: () => void;
}) {
  return (
    <article className="group relative rounded-xl border border-white/10 bg-black/30 p-4 transition-colors hover:bg-white/5">
      <PostHeader
        postId={post.id}
        authorName={post.author.name}
        authorAvatarUrl={post.author.avatarUrl}
        createdAt={post.createdAt}
        isOwnPost={isOwnPost}
      />

      <CommunityPostContent content={post.contentJson} images={post.images} />

      <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
        <LikeButton isLiked={post.isLiked} likesCount={post.likesCount} onClick={onToggleLike} />
        <CommentButton
          isOpen={isCommentsOpen}
          commentsCount={post.commentsCount}
          onClick={onToggleComments}
        />
      </div>

      <CommentList comments={post.comments} />
      <CommentComposer
        visible={isCommentsOpen}
        value={commentText}
        submitting={commentSubmitting}
        onChange={onChangeCommentText}
        onSubmit={onSubmitComment}
      />
    </article>
  );
}

