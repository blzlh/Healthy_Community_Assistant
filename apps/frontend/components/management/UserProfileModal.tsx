"use client";

import { useEffect } from "react";
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
  const { loading, loadProfile, saveProfile } = useProfile();

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open, loadProfile]);

  const handleSubmit = async (payload: { name?: string; avatarUrl?: string }) => {
    const result = await saveProfile(payload);
    if (!result.ok) {
      Toast.error({
        title: "更新失败",
        message: result.message ?? "请稍后再试",
      });
      return;
    }
    Toast.success({
      title: "已更新",
      message: "个人资料已保存",
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
