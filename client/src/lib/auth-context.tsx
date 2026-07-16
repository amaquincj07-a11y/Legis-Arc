"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  authenticate,
  loadSession,
  signOut,
  type LoginResult,
} from "./auth";
import {
  clearTabSession,
  getTabSession,
  setTabSession,
} from "./tab-session";
import type { AccountPortal, CompanyAdmin, User, UserRole } from "./types";
import { mockUsers } from "./mock-data";

interface AuthContextType {
  user: User | null;
  companyAdmin: CompanyAdmin | null;
  portal: AccountPortal | null;
  isAuthenticated: boolean;
  /** True only after credentials in THIS browser tab (sessionStorage-backed). */
  isTabUnlocked: boolean;
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
  const [isTabUnlocked, setIsTabUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sessionEpochRef = useRef(0);

  useEffect(() => {
    const epoch = sessionEpochRef.current;

    async function hydrate() {
      const session = await loadSession();
      // Ignore stale hydrate if login/logout already moved the epoch.
      if (epoch !== sessionEpochRef.current) return;

      if (session?.success) {
        if (session.portal === "lgu" && session.user) {
          setUser(session.user);
          setCompanyAdmin(null);
          setPortal("lgu");

          const tab = getTabSession();
          const unlocked =
            tab?.portal === "lgu" && tab.userId === session.user.id;
          setIsTabUnlocked(unlocked);
          if (!unlocked) clearTabSession();
        } else if (session.portal === "company" && session.companyAdmin) {
          setCompanyAdmin(session.companyAdmin);
          setUser(null);
          setPortal("company");

          const tab = getTabSession();
          const unlocked =
            tab?.portal === "company" &&
            tab.userId === session.companyAdmin.id;
          setIsTabUnlocked(unlocked);
          if (!unlocked) clearTabSession();
        }
      } else {
        clearTabSession();
        setIsTabUnlocked(false);
      }

      setIsLoading(false);
    }

    void hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Invalidate any in-flight hydrate so it cannot clear the new unlock.
    sessionEpochRef.current += 1;

    const result = await authenticate(email, password);

    if (!result.success) {
      return result;
    }

    if (result.portal === "lgu" && result.user) {
      setTabSession("lgu", result.user.id);
      setUser(result.user);
      setCompanyAdmin(null);
      setPortal("lgu");
      setIsTabUnlocked(true);
      setIsLoading(false);
    } else if (result.portal === "company" && result.companyAdmin) {
      setTabSession("company", result.companyAdmin.id);
      setCompanyAdmin(result.companyAdmin);
      setUser(null);
      setPortal("company");
      setIsTabUnlocked(true);
      setIsLoading(false);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    sessionEpochRef.current += 1;
    clearTabSession();
    setIsTabUnlocked(false);
    await signOut();
    setUser(null);
    setCompanyAdmin(null);
    setPortal(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const found = mockUsers.find((entry) => entry.role === role);
    if (found) {
      setTabSession("lgu", found.id);
      setUser(found);
      setCompanyAdmin(null);
      setPortal("lgu");
      setIsTabUnlocked(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        companyAdmin,
        portal,
        isAuthenticated: user !== null || companyAdmin !== null,
        isTabUnlocked,
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
