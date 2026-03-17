"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { AuthCard } from "@/components/login_register/AuthCard";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const initialStep = searchParams.get("step") === "code" ? "code" : "email";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">(initialStep);
  const {
    loading,
    resendLoading,
    message,
    sendLoginEmailOtp,
    resendEmailOtp,
    confirmEmailOtp,
  } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "email") {
      const result = await sendLoginEmailOtp(email);
      if (result.ok) {
        setStep("code");
      }
      return;
    }
    await confirmEmailOtp(email, code);
  }

  async function resendCode() {
    if (!email) return;
    const result = await resendEmailOtp(email);
    if (result.ok) {
      setStep("code");
    }
  }

  return (
    <AuthCard
      title="登录"
      description="使用邮箱验证码登录"
      icon="healthicons:exercise"
      footer={
        <>
          {step === "code" ? (
            <Button
              type="button"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
              aria-label="返回"
              onClick={() => setStep("email")}
            >
              <Icon icon="fluent-mdl2:chrome-back" className="h-4 w-4 hover:text-white" />
              返回
            </Button>
          ) : null}
          <div className="text-sm text-zinc-400">
            没有账号？{" "}
            <Link className="text-white underline-offset-4 hover:underline" href="/auth/register">
              去注册
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
          {step === "email" ? (
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
          ) : null}
          <div className="grid gap-3">
            {step === "code" ? (
              <>
                <Label htmlFor="code" className="text-zinc-300">
                  验证码
                </Label>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-4">
                  <OtpInput
                    value={code}
                    onChange={setCode}
                    length={6}
                    autoFocus
                  />
                </div>
                <div className="flex flex-row gap-3 rounded-xl py-2 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center">已发送验证码到 {email || "你的邮箱"}</div>
                  <Button
                    type="button"
                    disabled={resendLoading || !email}
                    onClick={resendCode}
                    className="h-8 w-auto rounded-lg border border-zinc-700 bg-zinc-950 text-xs text-white hover:bg-zinc-900"
                  >
                    {resendLoading ? "发送中..." : "重新发送验证码"}
                  </Button>
                </div>
              </>
            ) : null}
            <Button
            type="submit"
            disabled={loading || resendLoading}
            className="h-11 w-full rounded-lg bg-white text-black hover:bg-zinc-200"
          >
            <Icon icon="material-symbols:mail-outline" className="h-4 w-4" />
            {loading || resendLoading
              ? step === "email"
                ? "发送中..."
                : resendLoading
                ? "发送中..."
                : "登录中..."
              : step === "email"
              ? "发送验证码"
              : "登录"}
          </Button>
          </div>
      </form>
    </AuthCard>
  );
}
