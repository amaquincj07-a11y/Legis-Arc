"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createLGUClientAction,
  fetchLGUClientsAction,
  updateLGUProfileAction,
  updateLGUSubscriptionAction,
  activateLGUPaidSubscriptionTodayAction,
  blockLGUAccessAction,
  unblockLGUAccessAction,
} from "@/lib/super-admin-actions";
import type { CreateLGUAccountInput, LGUClient, LGUClientStatus } from "@/lib/types";
import type { LGUAdministrator } from "@/lib/types";

type SuperAdminLGUContextValue = {
  clients: LGUClient[];
  isLoading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  addClient: (input: CreateLGUAccountInput) => Promise<LGUClient | null>;
  updateClientProfile: (
    id: string,
    administrator: LGUAdministrator,
    password?: string
  ) => Promise<LGUClient | null>;
  updateClientSubscription: (
    id: string,
    patch: {
      status?: LGUClientStatus;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
    },
    recordPeriod?: boolean
  ) => Promise<LGUClient | null>;
  activatePaidSubscriptionToday: (id: string) => Promise<LGUClient | null>;
  blockLGUAccess: (id: string) => Promise<LGUClient | null>;
  unblockLGUAccess: (id: string) => Promise<LGUClient | null>;
  getClientById: (id: string) => LGUClient | undefined;
  syncClient: (client: LGUClient) => void;
};

const SuperAdminLGUContext = createContext<SuperAdminLGUContextValue | null>(
  null
);

export function SuperAdminLGUProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<LGUClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshClients = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchLGUClientsAction();

    if (!result.success) {
      setError(result.error);
      setClients([]);
    } else {
      setError(null);
      setClients(result.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshClients();
  }, [refreshClients]);

  const addClient = useCallback(async (input: CreateLGUAccountInput) => {
    const result = await createLGUClientAction(input);

    if (!result.success) {
      setError(result.error);
      return null;
    }

    setError(null);
    setClients((current) => [result.data, ...current]);
    return result.data;
  }, []);

  const updateClientProfile = useCallback(
    async (id: string, administrator: LGUAdministrator, password?: string) => {
      const result = await updateLGUProfileAction(id, administrator, password);

      if (!result.success) {
        setError(result.error);
        return null;
      }

      setError(null);
      setClients((current) =>
        current.map((client) => (client.id === id ? result.data : client))
      );
      return result.data;
    },
    []
  );

  const updateClientSubscription = useCallback(
    async (
      id: string,
      patch: {
        status?: LGUClientStatus;
        subscriptionStartDate?: Date;
        subscriptionEndDate?: Date;
      },
      recordPeriod = false
    ) => {
      const result = await updateLGUSubscriptionAction(id, patch, {
        recordPeriod,
      });

      if (!result.success) {
        setError(result.error);
        return null;
      }

      setError(null);
      setClients((current) =>
        current.map((client) => (client.id === id ? result.data : client))
      );
      return result.data;
    },
    []
  );

  const activatePaidSubscriptionToday = useCallback(async (id: string) => {
    const result = await activateLGUPaidSubscriptionTodayAction(id);

    if (!result.success) {
      setError(result.error);
      return null;
    }

    setError(null);
    setClients((current) =>
      current.map((client) => (client.id === id ? result.data : client))
    );
    return result.data;
  }, []);

  const blockLGUAccess = useCallback(async (id: string) => {
    const result = await blockLGUAccessAction(id);

    if (!result.success) {
      setError(result.error);
      return null;
    }

    setError(null);
    setClients((current) =>
      current.map((client) => (client.id === id ? result.data : client))
    );
    return result.data;
  }, []);

  const unblockLGUAccess = useCallback(async (id: string) => {
    const result = await unblockLGUAccessAction(id);

    if (!result.success) {
      setError(result.error);
      return null;
    }

    setError(null);
    setClients((current) =>
      current.map((client) => (client.id === id ? result.data : client))
    );
    return result.data;
  }, []);

  const getClientById = useCallback(
    (id: string) => clients.find((client) => client.id === id),
    [clients]
  );

  const syncClient = useCallback((client: LGUClient) => {
    setClients((current) => {
      const exists = current.some((entry) => entry.id === client.id);
      if (exists) {
        return current.map((entry) =>
          entry.id === client.id ? client : entry
        );
      }
      return [client, ...current];
    });
  }, []);

  return (
    <SuperAdminLGUContext
      value={{
        clients,
        isLoading,
        error,
        refreshClients,
        addClient,
        updateClientProfile,
        updateClientSubscription,
        activatePaidSubscriptionToday,
        blockLGUAccess,
        unblockLGUAccess,
        getClientById,
        syncClient,
      }}
    >
      {children}
    </SuperAdminLGUContext>
  );
}

export function useSuperAdminLGUs() {
  const context = useContext(SuperAdminLGUContext);
  if (!context) {
    throw new Error("useSuperAdminLGUs must be used within SuperAdminLGUProvider");
  }
  return context;
}
