"use client";

import { SessionProvider } from "next-auth/react";

export default function Proiders({
  children,
}: {
  children: React.ReactElement;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
