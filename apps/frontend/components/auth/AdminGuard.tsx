"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Toast } from "@/components/ui/Toast/Toast";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hasAccess = useMemo(() => Boolean(token && user?.isAdmin), [token, user?.isAdmin]);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!hasAccess && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      Toast.error({
        title: "无权限",
        message: "该页面仅管理员可访问",
      });
      router.replace("/home");
    }
  }, [hydrated, hasAccess, router]);

  if (!hydrated || !hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          <span className="text-sm font-light tracking-widest uppercase">验证管理员权限</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
