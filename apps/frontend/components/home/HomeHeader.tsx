"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button, Dropdown } from "antd";
import { HomeAuthActions } from "@/components/home/HomeUserCard";

const navItems = [
  { label: "服务内容", href: "/services", hasMenu: true },
  { label: "资讯活动", href: "/news", hasMenu: true },
  { label: "社区参与", href: "/community", hasMenu: true },
];

const dropdownItems = [
  { key: "overview", label: "平台概览", className: "text-white/80" },
  { key: "cases", label: "案例展示", className: "text-white/80" },
  { key: "contact", label: "联系我们", className: "text-white/80" },
];

export function HomeHeader() {
  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between rounded-xl bg-black/90 px-3 py-3 text-white shadow-[0_12px_40px_-20px_rgba(255,255,255,0.35)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Icon icon="healthicons:exercise" className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="text-base font-semibold">健康社区助手</div>
            <div className="text-xs text-white/50">Healthy Community Assistant</div>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm text-white/70">
          {navItems.map((item) =>
            item.hasMenu ? (
              <Dropdown
                key={item.label}
                menu={{ items: dropdownItems, className: "bg-transparent text-white/80" }}
                popupRender={(menu) => (
                  <div className="rounded-xl border border-white/10 bg-black/90 p-2 shadow-xl">
                    {menu}
                  </div>
                )}
              >
                <Button type="text" className="flex items-center gap-1 !text-white/70">
                  {item.label}
                  <Icon icon="material-symbols:keyboard-arrow-down" className="h-4 w-4" />
                </Button>
              </Dropdown>
            ) : (
              <Link key={item.label} href={item.href}>
                <Button type="text" className="text-white/70">
                  {item.label}
                </Button>
              </Link>
            )
          )}
        </nav>
        <HomeAuthActions />
      </div>
    </div>
  );
}
