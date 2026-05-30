"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface AssetSelectContextValue {
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const AssetSelectContext = createContext<AssetSelectContextValue | null>(null);

export function AssetSelectProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  return (
    <AssetSelectContext.Provider value={{ selectedIds, toggleSelect, selectAll, clearSelection, isSelected }}>
      {children}
    </AssetSelectContext.Provider>
  );
}

export function useAssetSelect() {
  const ctx = useContext(AssetSelectContext);
  if (!ctx) {
    throw new Error("useAssetSelect must be used within AssetSelectProvider");
  }
  return ctx;
}
