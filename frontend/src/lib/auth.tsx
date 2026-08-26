"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_staff: boolean;
  roles: string[];
  permissions: string[];
  home: string;
}

interface LoginResult {
  token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const STORAGE_KEY = "cwetr.auth";
const AuthContext = createContext<AuthState | null>(null);

function readStored(): { token: string; user: AuthUser } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  } catch {
    /* private mode / storage disabled */
  }
}

function eraseStored(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  function apply(nextToken: string, nextUser: AuthUser) {
    setToken(nextToken);
    setUser(nextUser);
    writeStored(nextToken, nextUser);
  }

  function reset() {
    setToken(null);
    setUser(null);
    eraseStored();
  }

  /* eslint-disable react-hooks/set-state-in-effect -- one-shot hydration from
     localStorage after mount, then background revalidation of the token. */
  useEffect(() => {
    const stored = readStored();
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored.token);
    setUser(stored.user);
    api<{ data: AuthUser }>("/auth/me", { token: stored.token })
      .then((r) => apply(stored.token, r.data))
      .catch(() => reset())
      .finally(() => setReady(true));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = useMemo<AuthState>(() => {
    return {
      user,
      token,
      ready,
      async login(email, password) {
        const res = await api<LoginResult>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        apply(res.token, res.user);
        return res.user;
      },
      async register(name, email, password, phone) {
        const res = await api<LoginResult>("/auth/register", {
          method: "POST",
          body: { name, email, password, phone },
        });
        apply(res.token, res.user);
        return res.user;
      },
      async logout() {
        try {
          if (token) {
            await api("/auth/logout", { method: "POST", token });
          }
        } catch {
          /* ignore network errors on logout */
        }
        reset();
      },
      hasRole(...roles) {
        return !!user && roles.some((r) => user.roles.includes(r));
      },
    };
  }, [user, token, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
