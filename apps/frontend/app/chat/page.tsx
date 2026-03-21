import { ChatRoom } from "@/components/chat/ChatRoom";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <ChatRoom />
      </div>
    </main>
  );
}
