"use client";

import { Skeleton } from "antd";

export function ChatSkeleton() {
  return (
    <div className="flex h-[520px] flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <Skeleton.Avatar active size={32} />
        <div className="flex flex-col gap-2">
          <Skeleton.Input active size="small" style={{ width: 100 }} />
          <Skeleton.Button
            active
            shape="round"
            style={{ width: 200, height: 30 }}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Skeleton.Avatar active size={32} />
        <div className="flex flex-col gap-2">
          <Skeleton.Input active size="small" style={{ width: 100 }} />
          <Skeleton.Button
            active
            shape="round"
            style={{ width: 200, height: 30 }}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Skeleton.Avatar active size={32} />
        <div className="flex flex-col gap-2">
          <Skeleton.Input active size="small" style={{ width: 100 }} />
          <Skeleton.Button
            active
            shape="round"
            style={{ width: 200, height: 30 }}
          />
        </div>
      </div>
    </div>
  );
}
