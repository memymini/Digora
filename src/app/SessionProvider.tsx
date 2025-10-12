"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

// We also need the profile data, not just the auth user.
// Let's define a session type that includes the profile.
export interface SessionData {
  user: User;
  profile: Profile; // Replace 'any' with a proper Profile type later
}

export const SessionContext = createContext<SessionData | null>(null);

interface SessionProviderProps {
  children: React.ReactNode;
  session: SessionData | null;
}

export const SessionProvider = ({
  children,
  session: initialSession,
}: SessionProviderProps) => {
  const [session, setSession] = useState<SessionData | null>(initialSession);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setSession({ user: session.user, profile });
      } else {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

/**
 * Client-side hook to get the current user's session data (auth user and profile).
 */
export const useSession = () => {
  const session = useContext(SessionContext);
  return session;
};
