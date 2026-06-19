'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@insforge/sdk';

// ---------------------------------------------------------------------------
// Shared client singleton (browser-only)
// ---------------------------------------------------------------------------
export function getInsforgeClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });
}

// ---------------------------------------------------------------------------
// Auth context
// ---------------------------------------------------------------------------
type User = { id: string; email: string; name?: string } | null;
type AuthCtx = { user: User; loading: boolean; refresh: () => Promise<void> };

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const insforge = getInsforgeClient();
    const { data, error } = await insforge.auth.getCurrentUser();
    setUser(error ? null : (data?.user ?? null) as User);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
