import { PageHeader } from "@/components/ui/PageHeader";
import { CommunityContent } from "@/components/community/CommunityContent";

export default function CommunityPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="社区动态"
        description="分享健康心得，交流生活经验"
        icon="solar:users-group-rounded-bold"
        iconColor="text-purple-400"
        iconBgGradient="from-purple-500/20 to-purple-500/5"
      />
      <div className="flex-1 overflow-y-auto home-scroll">
        <div className="mx-auto w-[96%] bg-[#0A0A0A] border border-[#292929] rounded-md mb-4">
          <CommunityContent />
        </div>
      </div>
    </div>
  );
}
