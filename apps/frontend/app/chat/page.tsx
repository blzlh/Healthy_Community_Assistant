import { PageHeader } from "@/components/ui/PageHeader";
import { ChatContent } from "@/components/chat/ChatContent";

export default function ChatPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="社区聊天"
        description="实时交流，分享健康心得"
        icon="solar:chat-round-dots-bold"
        iconColor="text-amber-400"
        iconBgGradient="from-amber-500/20 to-amber-500/5"
      />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto w-[96%] h-full pb-4">
          <ChatContent />
        </div>
      </main>
    </div>
  );
}
