import { Icon } from "@iconify/react";

export function HeaderIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
      <Icon icon={icon} className={`h-12 w-12 text-white ${className}`} />
    </div>
  );
}