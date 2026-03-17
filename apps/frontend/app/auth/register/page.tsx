"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/login_register/AuthCard";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { loading, message, sendEmailOtp } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await sendEmailOtp(email);
    if (result.ok) {
      const params = new URLSearchParams({ step: "code", email });
      router.push(`/auth/login?${params.toString()}`);
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
          {message ? (
            <div className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
              {message}
            </div>
          ) : null}
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
