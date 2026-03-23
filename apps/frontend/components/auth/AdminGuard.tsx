"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Toast } from "@/components/ui/Toast/Toast";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !user?.isAdmin) {
      Toast.error({
        title: "无权限",
        message: "该页面仅管理员可访问",
      });
      router.replace("/home");
    } else {
      setIsChecking(false);
    }
  }, [hydrated, user, token, router]);

  if (!hydrated || isChecking) {
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
