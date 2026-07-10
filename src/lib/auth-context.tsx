"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  authenticate,
  loadSessionFromSupabase,
  signOutFromSupabase,
  type LoginResult,
} from "./auth";
import type { AccountPortal, CompanyAdmin, User, UserRole } from "./types";
import { mockUsers } from "./mock-data";

interface AuthContextType {
  user: User | null;
  companyAdmin: CompanyAdmin | null;
  portal: AccountPortal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyAdmin, setCompanyAdmin] = useState<CompanyAdmin | null>(null);
  const [portal, setPortal] = useState<AccountPortal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const session = await loadSessionFromSupabase();
      if (cancelled) return;

      if (session?.success) {
        if (session.portal === "lgu" && session.user) {
          setUser(session.user);
          setCompanyAdmin(null);
          setPortal("lgu");
        } else if (session.portal === "company" && session.companyAdmin) {
          setCompanyAdmin(session.companyAdmin);
          setUser(null);
          setPortal("company");
        }
      }

      setIsLoading(false);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authenticate(email, password);

    if (!result.success) {
      return result;
    }

    if (result.portal === "lgu" && result.user) {
      setUser(result.user);
      setCompanyAdmin(null);
      setPortal("lgu");
    } else if (result.portal === "company" && result.companyAdmin) {
      setCompanyAdmin(result.companyAdmin);
      setUser(null);
      setPortal("company");
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOutFromSupabase();
    setUser(null);
    setCompanyAdmin(null);
    setPortal(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const found = mockUsers.find((entry) => entry.role === role);
    if (found) {
      setUser(found);
      setCompanyAdmin(null);
      setPortal("lgu");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        companyAdmin,
        portal,
        isAuthenticated: user !== null || companyAdmin !== null,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
