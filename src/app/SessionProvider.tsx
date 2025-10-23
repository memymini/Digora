"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";
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
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        switch (event) {
          case "INITIAL_SESSION": {
            // 서버에서 전달된 초기 세션을 그대로 사용한다.
            return;
          }
          case "SIGNED_OUT": {
            setSession(null);
            return;
          }
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
          case "USER_UPDATED": {
            if (!session) {
              setSession(null);
              return;
            }

            const { data: profile, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (error || !profile) {
              setSession(null);
              return;
            }

            setSession({ user: session.user, profile });
            return;
          }
          default:
            return;
        }
      }
    );

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
