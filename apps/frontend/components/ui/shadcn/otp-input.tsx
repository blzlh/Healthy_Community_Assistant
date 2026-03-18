"use client";

import { useMemo, useRef } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/shadcn/input";

type OtpInputProps = {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

export function OtpInput({
  value,
  length = 6,
  onChange,
  disabled,
  autoFocus,
  className,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const padded = useMemo(() => value.padEnd(length, ""), [value, length]);

  const setValueAt = (index: number, nextChar: string) => {
    const chars = padded.split("");
    chars[index] = nextChar;
    onChange(chars.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setValueAt(index, "");
      return;
    }

    if (digits.length === 1) {
      setValueAt(index, digits);
      const next = inputsRef.current[index + 1];
      if (next) next.focus();
      return;
    }

    const chars = padded.split("");
    for (let i = 0; i < digits.length && index + i < length; i += 1) {
      chars[index + i] = digits[i];
    }
    onChange(chars.join("").trimEnd());
    const nextIndex = Math.min(index + digits.length, length - 1);
    const next = inputsRef.current[nextIndex];
    if (next) next.focus();
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "");
    if (!digits) return;
    event.preventDefault();

    const chars = padded.split("");
    for (let i = 0; i < digits.length && index + i < length; i += 1) {
      chars[index + i] = digits[i];
    }
    onChange(chars.join("").trimEnd());
    const nextIndex = Math.min(index + digits.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (padded[index]) {
        setValueAt(index, "");
      } else if (index > 0) {
        setValueAt(index - 1, "");
        inputsRef.current[index - 1]?.focus();
      }
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      return;
    }
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      setValueAt(index, event.key);
      const next = inputsRef.current[index + 1];
      if (next) next.focus();
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={padded[index] ?? ""}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          className="h-12 w-11 rounded-lg border-zinc-800 bg-zinc-950 text-center text-lg text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={`Digit ${index + 1}`}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
        />
      ))}
    </div>
  );
}
