"use client";

import { useState } from "react";
import { Button, Input } from "antd";

import { AvatarUploader } from "@/components/management/AvatarUploader";

type UserProfileFormProps = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  loading: boolean;
  onSubmit: (payload: { name?: string; avatarUrl?: string | null }) => void;
};

export function UserProfileForm({
  name,
  email,
  avatarUrl,
  loading,
  onSubmit,
}: UserProfileFormProps) {
  const [displayName, setDisplayName] = useState(name ?? "");
  const [avatar, setAvatar] = useState<string | null | undefined>(avatarUrl);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-white/60">头像</div>
        <AvatarUploader value={avatar ?? undefined} onChange={setAvatar} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm text-white/60">姓名</div>
        <Input
          placeholder="请输入姓名"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="!bg-black/60 !text-white !border-white/10 placeholder:!text-white/40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm text-white/60">邮箱</div>
        <Input
          value={email ?? ""}
          disabled
          className="!bg-black/40 !text-white/60 !border-white/10"
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button
          type="primary"
          loading={loading}
          className="!bg-zinc-800 !text-white hover:!bg-zinc-700"
          onClick={() => onSubmit({ name: displayName.trim(), avatarUrl: avatar ?? null })}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
