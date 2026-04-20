"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { HomeAuthActions } from "@/components/home/HomeUserCard";

const navItems = [
  { label: "健康档案", href: "/healthRecords" },
  { label: "AI 健康助手", href: "/healthAnalyzer" },
  { label: "社区", href: "/community" },
  { label: "聊天室", href: "/chat" }
];

export function HomeHeader() {
  return (
    <div className="sticky top-0 z-50 py-4 backdrop-blur-xl bg-black/50">
      <div className="mx-auto w-[96%] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group !text-white no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <Icon icon="healthicons:exercise" className="h-6 w-6" />
          </div>
        </Link>

        {/* 导航 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm !text-white/70 hover:!text-white rounded-lg transition-all duration-300 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-3/4" />
            </Link>
          ))}
        </div>
        <HomeAuthActions />
      </div>
    </div>
  );
}
