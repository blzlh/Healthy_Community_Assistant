/**
 * 普通对话模式页面 - 自由对话
 */

import { PageHeader } from "@/components/ui/PageHeader";
import { HealthChatContent } from "@/components/healthAnalyzer";

export default function HealthChatPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="自由对话"
        icon="solar:chat-round-dots-bold"
        iconColor="text-sky-400"
        backHref="/healthAnalyzer"
      />
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-[96%] h-full pb-4">
          <HealthChatContent mode="chat" />
        </div>
      </div>
    </div>
  );
}
