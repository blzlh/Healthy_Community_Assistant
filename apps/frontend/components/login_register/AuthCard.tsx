import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { HeaderIcon } from "@/components/login_register/HeaderIcon";

type AuthCardProps = {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, icon, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full border-zinc-800 bg-[#0A0A0A] text-white shadow-2xl">
      <CardHeader className="items-center gap-4 text-center">
        <HeaderIcon icon={icon} />
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-zinc-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter className="flex flex-col items-center gap-4 text-center">{footer}</CardFooter> : null}
    </Card>
  );
}
