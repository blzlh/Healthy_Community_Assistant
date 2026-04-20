"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { Avatar, Button, Dropdown } from "antd";
import type { MenuProps } from "antd";

import { useAuthStore } from "@/store/auth-store";
import { UserProfileModal } from "@/components/management/UserProfileModal";

// 菜单项配置
const menuConfig = {
  base: [
    { key: "edit", icon: "solar:pen-bold", label: "编辑资料" },
    { key: "healthRecords", icon: "solar:health-bold", label: "健康档案" },
  ],
  admin: [
    { key: "admin", icon: "solar:users-group-rounded-bold", label: "管理后台" },
    { key: "security", icon: "solar:shield-check-bold", label: "安全管理" },
  ],
  logout: { key: "logout", icon: "solar:logout-2-bold", label: "退出登录", isLogout: true as const },
};

type MenuItemConfig = typeof menuConfig.base[number] | typeof menuConfig.logout;

// 生成菜单项
const createMenuItem = (item: MenuItemConfig) => ({
  key: item.key,
  label: (
    <span className={`flex items-center gap-4 ${'isLogout' in item && item.isLogout ? "text-red-400" : "text-white/80"}`}>
      <Icon icon={item.icon} className="h-4 w-4" />
      {item.label}
    </span>
  ),
});

export function HomeAuthActions() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const isAuthed = Boolean(token) && Boolean(user);
  const [open, setOpen] = useState(false);

  const userMenuItems = useMemo((): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      ...menuConfig.base.map(createMenuItem),
    ];

    if (user?.isAdmin) {
      items.push(...menuConfig.admin.map(createMenuItem));
    }

    items.push({ type: 'divider' });
    items.push(createMenuItem(menuConfig.logout));

    return items;
  }, [user?.isAdmin]);

  const handleMenuClick = (key: string) => {
    const routes: Record<string, string> = {
      healthRecords: "/healthRecords",
      admin: "/admin/users",
      security: "/admin/security",
    };

    if (key === "logout") {
      clear();
      router.push("/");
    } else if (key === "edit") {
      setOpen(true);
    } else if (routes[key]) {
      router.push(routes[key]);
    }
  };

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button
            type="text"
            className="!border-2 !border-[#292929] !text-white hover:!text-white hover:!bg-white/10 hover:!border-white/30 hover:!scale-105 !rounded-lg !h-9 transition-all"
          >
            登录
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button className="!border-2 !border-[#292929] !bg-white !text-black hover:!bg-white/80 hover:!border-white/30 hover:!scale-105 !rounded-lg !h-9 !font-medium transition-all">
            注册
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "用户";

  return (
    <>
      <Dropdown
        menu={{
          items: userMenuItems,
          onClick: ({ key }) => handleMenuClick(key),
          className: "[&_.ant-dropdown-menu-item]:!bg-transparent [&_.ant-dropdown-menu-item:hover]:!bg-white/5 [&_.ant-dropdown-menu-item]:!rounded-lg [&_.ant-dropdown-menu-item]:!border-b-0 [&_.ant-dropdown-menu-item]:!my-0 [&_.ant-dropdown-menu-item]:!mx-0 [&_.ant-dropdown-menu-item]:!px-3",
        }}
        trigger={["click"]}
        popupRender={(menu) => (
          <div className="rounded-xl border border-white/10 bg-zinc-900 backdrop-blur-xl shadow-xl [&_.ant-dropdown-menu]:!bg-transparent [&_.ant-dropdown-menu-item-divider]:!bg-white/10">
            {menu}
          </div>
        )}
      >
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Avatar
            className="bg-white text-black"
            size={28}
            src={user?.avatarUrl}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-white">{displayName}</span>
          {user?.isAdmin && (
            <span className="hidden md:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
              管理员
            </span>
          )}
          <Icon icon="solar:alt-arrow-down-bold" className="h-4 w-4 text-white/40" />
        </button>
      </Dropdown>
      <UserProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
