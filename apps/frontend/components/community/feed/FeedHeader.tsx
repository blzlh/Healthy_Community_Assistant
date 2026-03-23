"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Segmented } from "antd";

export type FeedScope = "all" | "mine";

export function FeedHeader({
  scope,
  onScopeChange,
}: {
  scope: FeedScope;
  onScopeChange: (scope: FeedScope) => void;
}) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-semibold text-white">社区动态</div>
        <Link
          href="/community/new"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          <Icon icon="material-symbols:add" className="h-4 w-4" />
          写动态
        </Link>
      </div>
      <div className="mb-4 flex justify-end">
        <Segmented
          options={[
            { label: "全部动态", value: "all" },
            { label: "我的动态", value: "mine" },
          ]}
          value={scope}
          onChange={(value) => onScopeChange(value as FeedScope)}
        />
      </div>
    </>
  );
}

