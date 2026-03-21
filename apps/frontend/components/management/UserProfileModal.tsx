"use client";

import { Icon } from "@iconify/react";
import { Modal } from "antd";

import { useAuthStore } from "@/store/auth-store";
import { useProfile } from "@/hooks/use-profile";
import { UserProfileForm } from "@/components/management/UserProfileForm";
import { Toast } from "@/components/ui/Toast/Toast";

type UserProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const user = useAuthStore((state) => state.user);
  const { loading, saveProfile } = useProfile();

  const handleSubmit = async (payload: { name?: string; avatarUrl?: string | null }) => {
    const nextName = (payload.name ?? "").trim();
    const currentName = (user?.name ?? "").trim();
    const nextAvatar = payload.avatarUrl ?? null;
    const currentAvatar = user?.avatarUrl ?? null;

    if (nextName === currentName && nextAvatar === currentAvatar) {
      Toast.info({
        message: "个人资料未发生变化",
      });
      return;
    }

    const result = await saveProfile(payload);
    if (!result.ok) {
      Toast.error({
        title: "更新失败",
        message: result.message ?? "请稍后再试",
      });
      return;
    }
    Toast.success({
      message: "个人资料已更新",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      title={<span className="text-white">编辑个人资料</span>}
      closeIcon={<Icon icon="material-symbols:close" className="text-white/70 hover:text-white" />}
      classNames={{
        container: "!bg-[#131212] border border-white/10",
        header: "bg-[#131212] border-b border-white/10",
        body: "bg-[#131212] text-white",
        title: "text-white",
        wrapper: "text-white",
      }}
      styles={{
        mask: {
          background: "rgba(0,0,0,0.65)",
        },
      }}
    >
      <UserProfileForm
        name={user?.name}
        email={user?.email}
        avatarUrl={user?.avatarUrl}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
