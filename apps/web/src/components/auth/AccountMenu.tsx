"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdLogout, MdManageAccounts } from "react-icons/md";

import { useClerk, useUser } from "@clerk/nextjs";

import { Button } from "@components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";

function initialsFromName(name?: string | null, email?: string | null) {
  const fallback = email?.[0]?.toUpperCase() ?? "U";

  if (!name) {
    return fallback;
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || fallback;
}

export function AccountMenu({
  align = "end",
  showName = false,
}: {
  align?: "start" | "center" | "end";
  showName?: boolean;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fullName = user?.fullName ?? "FlockNerd user";
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const initials = initialsFromName(user?.fullName, email);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto rounded-full px-1 py-1 text-white hover:bg-slate-400/10 hover:text-white"
          aria-label="Open account menu"
        >
          <span className="flex items-center gap-3">
            {showName ? <span className="hidden text-sm font-semibold md:inline">{fullName}</span> : null}
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={fullName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-secondary font-semibold text-white">
                {initials}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 rounded-2xl border-none bg-[#FEF9F6] p-2 text-primary shadow-2xl">
        <div className="rounded-xl px-3 py-3">
          <p className="text-sm font-semibold">{fullName}</p>
          {email ? <p className="mt-1 text-xs text-primary/70">{email}</p> : null}
        </div>
        <div className="my-1 h-px bg-primary/10" />
        <Link
          href="/app/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-primary/5"
        >
          <MdManageAccounts className="text-lg" />
          Account settings
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-primary/5"
          disabled={isSigningOut}
          onClick={async () => {
            setIsSigningOut(true);

            try {
              await signOut({
                redirectUrl: "/",
              });
              router.replace("/");
            } finally {
              setIsSigningOut(false);
            }
          }}
        >
          <MdLogout className="text-lg" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </PopoverContent>
    </Popover>
  );
}

