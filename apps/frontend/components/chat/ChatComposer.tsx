"use client";

import { useState } from "react";
import { Button, Input } from "antd";
import { Icon } from "@iconify/react";

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [text, setText] = useState("");

  const send = () => {
    const next = text.trim();
    if (!next) return;
    onSend(next);
    setText("");
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入消息..."
        onPressEnter={send}
        disabled={disabled}
        className="!bg-black/60 !text-white !border-white/10 placeholder:!text-white/40"
      />
      <Button
        type="primary"
        disabled={disabled}
        onClick={send}
        className="!bg-zinc-800 !text-white hover:!bg-zinc-700"
        icon={<Icon icon="mynaui:send-solid" />}
      />
    </div>
  );
}
