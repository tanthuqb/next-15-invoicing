"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function ConditionalClerkProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Only render ClerkProvider on the client side to avoid build errors
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
