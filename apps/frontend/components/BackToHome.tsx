/**
 * 返回主页按钮组件
 * 统一的返回主页按钮，用于 chat、community、healthAnalyzer 等页面
 */

"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface BackToHomeProps {
  /** 自定义类名 */
  className?: string;
  /** 按钮文字，默认"返回主页" */
  label?: string;
  /** 是否显示图标，默认 true */
  showIcon?: boolean;
  /** 自定义返回路径，默认 "/" */
  href?: string;
  /** 按钮尺寸：sm | md | lg */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

const iconSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function BackToHome({
  className,
  label = "返回主页",
  showIcon = true,
  href = "/home",
  size = "md",
}: BackToHomeProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-lg border border-white/10 bg-white/5 text-white/80",
        "hover:bg-white/10 hover:border-white/20 hover:text-white",
        "transition-all duration-200",
        sizeStyles[size],
        className
      )}
    >
      {showIcon && (
        <Icon icon="lucide:home" className={iconSizes[size]} />
      )}
      <span>{label}</span>
    </Link>
  );
}
