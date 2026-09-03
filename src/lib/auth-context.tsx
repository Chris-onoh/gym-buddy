"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type User,
  getDB,
  getSessionUser,
  setSession,
  clearSession,
  loginUser,
  registerUser as storeRegister,
} from "@/lib/store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getDB(); // ensure seeded before reading session
      setUser(getSessionUser());
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.ok && result.user) {
      setSession(result.user.id);
      setUser(result.user);
    }
    return { ok: result.ok, error: result.error };
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const result = await storeRegister(name, email, password, phone);
      if (result.ok && result.user) {
        setSession(result.user.id);
        setUser(result.user);
      }
      return { ok: result.ok, error: result.error };
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refresh = useCallback(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
