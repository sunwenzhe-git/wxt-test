declare global {
  interface Window {
    chrome: {
      tabs: {
        query: (
          queryInfo: { currentWindow: boolean },
          callback: (tabs: chrome.tabs.Tab[]) => void
        ) => void;
        update: (
          tabId: number,
          updateProperties: { active: boolean; url?: string }
        ) => void;
        remove: (tabId: number | number[]) => void;
        move: (tabId: number, moveProperties: { index: number }) => void;
        create: (createProperties: { active: boolean; url?: string }) => void;
        onCreated: {
          addListener: (callback: (tab: chrome.tabs.Tab) => void) => void;
          removeListener: (callback: (tab: chrome.tabs.Tab) => void) => void;
        };
        onRemoved: {
          addListener: (callback: (tabId: number) => void) => void;
          removeListener: (callback: (tabId: number) => void) => void;
        };
        onUpdated: {
          addListener: (
            callback: (
              tabId: number,
              changeInfo: chrome.tabs.TabChangeInfo,
              tab: chrome.tabs.Tab
            ) => void
          ) => void;
          removeListener: (
            callback: (
              tabId: number,
              changeInfo: chrome.tabs.TabChangeInfo,
              tab: chrome.tabs.Tab
            ) => void
          ) => void;
        };
        onActivated: {
          addListener: (
            callback: (activeInfo: chrome.tabs.TabActiveInfo) => void
          ) => void;
          removeListener: (
            callback: (activeInfo: chrome.tabs.TabActiveInfo) => void
          ) => void;
        };
      };
      theme: {
        getCurrent: (
          callback: (themeInfo: { colors?: { frame?: string } }) => void
        ) => void;
      };
    };
  }
}

export {};
