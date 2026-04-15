/**
 * 普通对话模式页面 - 自由对话
 */

import { HealthChatContainer } from "@/components/healthAnalyzer";

export default function HealthChatPage() {
  return (
    <main className="h-screen bg-black text-white overflow-hidden">
      <div className="mx-auto w-full max-w-4xl px-6 py-6 h-full">
        <HealthChatContainer mode="chat" />
      </div>
    </main>
  );
}
