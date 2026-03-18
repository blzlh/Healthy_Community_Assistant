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
  const { loading, sendEmailOtp } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await sendEmailOtp(email);
    if (result.ok) {
      const params = new URLSearchParams({ step: "code", email });
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
            <Link className="text-white underline-offset-4 hover:underline" href="/auth/login">
              去登录
            </Link>
          </div>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
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
