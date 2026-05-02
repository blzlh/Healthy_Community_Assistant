/**
 * 通用页面顶部导航栏组件
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述（可选） */
  description?: string;
  /** 页面图标 */
  icon?: string;
  /** 图标颜色 */
  iconColor?: string;
  /** 图标背景渐变 */
  iconBgGradient?: string;
  /** 返回链接，默认为 /home */
  backHref?: string;
  /** 右侧额外内容 */
  rightContent?: React.ReactNode;
  /** 是否显示返回按钮，默认 true */
  showBackButton?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function PageHeader({
  title,
  description,
  backHref = "/home",
  rightContent,
  showBackButton = true,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-50 py-4 backdrop-blur-xl bg-black/50 shrink-0 px-8",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo - 点击回到首页 */}
          {showBackButton && (
            <>
              <Link
                href="/home"
                className="flex items-center gap-2.5 !text-white no-underline hover:opacity-80 transition-opacity"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
                  <Icon icon="healthicons:exercise" className="h-6 w-6" />
                </div>
              </Link>
              <div className="h-5 w-px bg-white/20" />
            </>
          )}

          {/* 页面标题 */}
          <div>
            <div className="text-lg font-semibold leading-tight text-white">
              {title}
            </div>
            {description && (
              <div className="text-sm text-white/50">{description}</div>
            )}
          </div>
        </div>

        {/* 右侧：返回按钮 + 额外内容 */}
        <div className="flex items-center gap-3 cursor-pointer">
          {rightContent}
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <Icon icon="solar:arrow-left-bold" className="h-4 w-4" />
              <span>返回</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
