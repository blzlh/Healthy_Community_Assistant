/**
 * 健康档案页面
 */

import { PageHeader } from "@/components/ui/PageHeader";
import { HealthRecordsContent } from "@/components/healthRecords";

export default function HealthRecordsPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="健康档案"
        icon="solar:health-integrated-bold"
        iconColor="text-emerald-400"
        iconBgGradient="from-emerald-500/20 to-emerald-500/5"
      />
      <main className="flex-1 overflow-y-auto home-scroll">
        <div className="mx-auto w-[96%] bg-[#0A0A0A] border border-[#292929] rounded-md mb-4">
          <HealthRecordsContent />
        </div>
      </main>
    </div>
  );
}
