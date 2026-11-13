"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const HINT_COOKIE = "blueeye_has_session";
const HINT_MAX_AGE = 60 * 60 * 24 * 30;

function readHint(): "1" | "0" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${HINT_COOKIE}=([^;]*)`));
  if (!match) return null;
  return match[1] === "1" ? "1" : "0";
}

function writeHint(value: "1" | "0") {
  document.cookie = `${HINT_COOKIE}=${value}; path=/; max-age=${HINT_MAX_AGE}; SameSite=Lax`;
}

function SessionHint() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") writeHint("1");
    else if (status === "unauthenticated") writeHint("0");
  }, [status]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hint, setHint] = useState<"1" | "0" | null>(null);

  useEffect(() => {
    setHint(readHint());
  }, []);

  // First load: fetch once to discover an existing session, then remember the
  // answer in a non-HttpOnly hint cookie. Anonymous repeat visits render with
  // session={null}, which prevents NextAuth from calling /api/auth/session.
  const shouldFetch = hint === null || hint === "1";

  return (
    <SessionProvider
      key={shouldFetch ? "fetch" : "anon"}
      session={shouldFetch ? undefined : null}
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <SessionHint />
      {children}
    </SessionProvider>
  );
}
