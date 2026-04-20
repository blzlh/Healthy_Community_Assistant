import { PageHeader } from "@/components/ui/PageHeader";
import { CommunityComposer } from "@/components/community/CommunityComposer";

export default function CommunityNewPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="发布动态"
        description="分享您的健康心得"
        icon="solar:pen-new-square-bold"
        iconColor="text-purple-400"
        iconBgGradient="from-purple-500/20 to-purple-500/5"
        backHref="/community"
      />
      <main className="flex-1 overflow-y-auto home-scroll">
        <div className="mx-auto w-[96%] rounded-md mb-4">
          <div className="">
            <CommunityComposer />
          </div>
        </div>
      </main>
    </div>
  );
}
