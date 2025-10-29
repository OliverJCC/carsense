// src/auth.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { setToken as setHttpToken } from "./api/http";

type AuthCtx = {
  token: string | null;
  isAuthed: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null
  );

  const value = useMemo<AuthCtx>(() => ({
    token,
    isAuthed: !!token,
    login: (t: string) => {
      localStorage.setItem("token", t);
      setHttpToken(t);
      setToken(t);
    },
    logout: () => {
      localStorage.removeItem("token");
      setHttpToken(null);
      setToken(null);
    },
  }), [token]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

