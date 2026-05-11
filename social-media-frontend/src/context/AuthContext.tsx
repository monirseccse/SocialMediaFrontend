"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  initTokens,
  saveTokens,
  removeTokens,
  apiLogin,
  apiRegister,
} from "@/lib/api";
import { LoginRequest, RegisterRequest } from "@/lib/types";

interface User {
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initTokens();
    const saved = typeof window !== "undefined" ? localStorage.getItem("sm_user") : null;
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // ignore corrupt storage
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem("sm_user", JSON.stringify(u));
  };

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data);
    saveTokens(res.accessToken, res.refreshToken);
    const name = res.fullName ?? data.email;
    persistUser({ name });
    router.push("/feed");
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data);
    saveTokens(res.accessToken, res.refreshToken);
    const name = res.fullName ?? `${data.firstName} ${data.lastName}`;
    persistUser({ name });
    router.push("/feed");
  }, [router]);

  const logout = useCallback(() => {
    removeTokens();
    localStorage.removeItem("sm_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
