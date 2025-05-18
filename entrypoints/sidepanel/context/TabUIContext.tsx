import React, { createContext, useContext, useState } from "react";

const TabUIContext = createContext(null);

export const TabUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<number, boolean>
  >({});
  const [openTabId, setOpenTabId] = useState<number | null>(null);
  const [selectedColorMap, setSelectedColorMap] = useState<
    Record<string, string>
  >({});

  return (
    <TabUIContext.Provider
      value={{
        collapsedGroups,
        setCollapsedGroups,
        openTabId,
        setOpenTabId,
        selectedColorMap,
        setSelectedColorMap,
      }}
    >
      {children}
    </TabUIContext.Provider>
  );
};

export const useTabUIContext = () => useContext(TabUIContext);
