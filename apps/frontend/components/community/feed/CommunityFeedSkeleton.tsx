import { Skeleton } from "antd";

export function CommunityFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="group relative rounded-xl border border-white/10 bg-black/30 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton.Avatar active size={40} />
              <div className="flex flex-col gap-2">
                <Skeleton.Input active size="small" style={{ width: 140 }} />
                <Skeleton.Input active size="small" style={{ width: 90 }} />
              </div>
            </div>
            <Skeleton.Button active shape="circle" style={{ width: 32, height: 32 }} />
          </div>

          <Skeleton
            active
            title={false}
            paragraph={{ rows: 3, width: ["100%", "92%", "70%"] }}
          />

          <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
            <Skeleton.Button active shape="round" style={{ width: 92, height: 28 }} />
            <Skeleton.Button active shape="round" style={{ width: 92, height: 28 }} />
          </div>
        </article>
      ))}
    </div>
  );
}