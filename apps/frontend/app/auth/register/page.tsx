"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { AuthCard } from "@/components/login_register/AuthCard";
import { Toast } from "@/components/ui/Toast/Toast";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { loading, sendEmailOtp } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await sendEmailOtp(email, isAdmin);
    if (result.ok) {
      const params = new URLSearchParams({
        step: "code",
        email,
        isAdmin: isAdmin ? "true" : "false",
      });
      router.push(`/auth/login?${params.toString()}`);
    } else {
      Toast.error({
        title: "发送失败",
        message: result.message ?? "请稍后再试",
      });
    }
  }

  return (
    <AuthCard
      title="创建账号"
      description="使用邮箱验证码快速注册"
      icon="healthicons:exercise"
      footer={
        <>
          <div className="text-sm text-zinc-400">
            已有账号？{" "}
            <Link className="!text-white !underline-offset-4 hover:!underline decoration-white" href="/auth/login">
              去登录
            </Link>
          </div>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-zinc-300">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@work-email.com"
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-300">身份选择</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setIsAdmin(false)}
                className={`flex-1 h-10 transition-all ${!isAdmin
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
              >
                <Icon icon="lucide:user" className="h-4 w-4" />
                普通用户
              </Button>
              <Button
                type="button"
                onClick={() => setIsAdmin(true)}
                className={`flex-1 h-10 transition-all ${isAdmin
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
              >
                <Icon icon="lucide:shield-check" className="h-4 w-4" />
                管理员
              </Button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-white text-black hover:bg-zinc-200"
        >
          <Icon icon="material-symbols:mail-outline" className="h-4 w-4" />
          {loading ? "发送中..." : "发送验证码"}
        </Button>
      </form>
    </AuthCard>
  );
}
