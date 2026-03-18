"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { Avatar, Button, Dropdown } from "antd";

import { useAuthStore } from "@/store/auth-store";
import { UserProfileModal } from "@/components/management/UserProfileModal";

export function HomeAuthActions() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const isAuthed = Boolean(token) && Boolean(user);
  const [open, setOpen] = useState(false);

  const userMenuItems = useMemo(
    () => [
      { key: "edit", label: "编辑资料" },
      { key: "profile", label: "个人中心" },
      { key: "logout", label: "退出登录" },
    ],
    []
  );

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">
          <Button
            color="default"
            variant="filled"
            className="!bg-zinc-600 !text-white hover:!bg-zinc-500"
          >
            登录
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button
            color="default"
            variant="filled"
            className="!bg-zinc-600 !text-white hover:!bg-zinc-500"
          >
            注册
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = user?.name ?? user?.email ;
  const displayEmail = user?.email ?? "未绑定邮箱";

  return (
    <>
      <Dropdown
        menu={{
          items: userMenuItems,
          theme: "dark",
          className: "!bg-black/90 !text-white/80",
          onClick: ({ key }) => {
            if (key === "logout") {
              clear();
            } 
            if (key === "edit") {
              setOpen(true);
            }
          },
        }}
        styles={{
          root: {
            backgroundColor: "#131212",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 12,
          },
          item: {
            color: "rgba(255,255,255,0.88)",
          },
          itemTitle: {
            color: "rgba(255,255,255,0.95)",
          },
        }}
        popupRender={(menu) => (
          <>
            <div className="rounded-xl border border-white/10 bg-black/90 p-2 shadow-xl [&_.ant-dropdown-menu-item]:rounded-lg [&_.ant-dropdown-menu-item:hover]:!bg-white/10 [&_.ant-dropdown-menu-item:hover]:!text-white">
              {menu}
            </div>
          </>
        )}
        
      >
        <button
          type="button"
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-white/90 hover:bg-white/10"
        >
          <Avatar className="bg-zinc-700" size={36} src={user?.avatarUrl}>
            {(displayName || "U").slice(0, 1).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{displayName}</span>
            <span className="text-xs text-white/60">{displayEmail}</span>
          </div>
          <Icon icon="material-symbols:keyboard-arrow-down" className="h-4 w-4" />
        </button>
      </Dropdown>
      <UserProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
