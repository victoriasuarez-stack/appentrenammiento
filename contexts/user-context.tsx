"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getOrCreateUser, getLocalUserId } from "@/lib/supabase-storage";

interface UserContextValue {
  userId: string | null;
  loading: boolean;
  ensureUser: () => Promise<string>;
}

const UserContext = createContext<UserContextValue>({
  userId: null,
  loading: true,
  ensureUser: async () => "",
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getLocalUserId();
    if (stored) {
      setUserId(stored);
      setLoading(false);
    } else {
      getOrCreateUser()
        .then((id) => {
          setUserId(id);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const ensureUser = useCallback(async () => {
    if (userId) return userId;
    const id = await getOrCreateUser();
    setUserId(id);
    return id;
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, loading, ensureUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
