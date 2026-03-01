"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LegislativeDocument } from "@/lib/types";
import { mockOrdinances, mockResolutions } from "@/lib/mock-data";

interface TrackingContextType {
  documents: LegislativeDocument[];
  updateDocumentStatus: (
    id: string,
    documentType: string,
    status: string
  ) => void;
  updateDocument: (
    id: string,
    documentType: string,
    updates: Partial<LegislativeDocument>
  ) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(
  undefined
);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<LegislativeDocument[]>(() => [
    ...mockOrdinances,
    ...mockResolutions,
  ]);

  const updateDocumentStatus = (
    id: string,
    documentType: string,
    status: string
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id && d.documentType === documentType
          ? {
              ...d,
              stage: status as any,
              updatedAt: new Date(),
              lastUpdatedByEmail: "maria.santos@panglao.gov.ph",
            }
          : d
      )
    );
  };

  const updateDocument = (
    id: string,
    documentType: string,
    updates: Partial<LegislativeDocument>
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id && d.documentType === documentType
          ? {
              ...d,
              ...updates,
              updatedAt: new Date(),
              lastUpdatedByEmail: "maria.santos@panglao.gov.ph",
            }
          : d
      )
    );
  };

  return (
    <TrackingContext.Provider value={{ documents, updateDocumentStatus, updateDocument }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within TrackingProvider");
  }
  return context;
}
