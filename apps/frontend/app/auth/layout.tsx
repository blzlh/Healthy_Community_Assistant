import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        {children}
      </div>
    </main>
  );
}
