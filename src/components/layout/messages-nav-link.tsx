"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

export function MessagesNavLink({ className }: { className?: string }) {
  const { unreadCount } = useUnreadMessages();

  return (
    <Link href="/mensajes" className={cn("relative inline-flex items-center", className)}>
      Mensajes
      {unreadCount > 0 && (
        <span className="ml-2 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
