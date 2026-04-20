/**
 * 通用页面顶部导航栏组件
 */

"use client";

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
  return (
    <div
      className={cn(
        "sticky top-0 z-50 py-4 backdrop-blur-xl bg-black/50 shrink-0 px-8",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo / 返回按钮 */}
          {showBackButton && (
            <>
              <Link
                href={backHref}
                className="flex items-center gap-2.5 !text-white no-underline hover:opacity-80 transition-opacity"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
                  <Icon icon="healthicons:exercise" className="h-6 w-6" />
                </div>
              </Link>
              <div className="h-5 w-px bg-white/20" />
            </>
          )}

          {/* 页面图标和标题 */}
          <div>
            <div className="text-lg font-semibold leading-tight text-white">
              {title}
            </div>
            {description && (
              <div className="text-sm text-white/50">{description}</div>
            )}
          </div>
        </div>

        {/* 右侧额外内容 */}
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    </div>
  );
}
