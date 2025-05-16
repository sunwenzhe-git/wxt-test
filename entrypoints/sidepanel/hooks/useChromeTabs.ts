import { extractDomain } from "../utils";
import { Tab } from "../utils/type";
// hooks: 监听和数据处理
export default function useChromeTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // 更新标签列表
  const updateTabs = useCallback(() => {
    window.chrome.tabs.query(
      { currentWindow: true },
      (chromeTabs: chrome.tabs.Tab[]) => {
        const currentTime = Date.now();
        setTabs((prevTabs) => {
          const formattedTabs = chromeTabs.map((tab: chrome.tabs.Tab) => {
            const existingTab = prevTabs.find(
              (t) => t.id === tab.id?.toString()
            );
            console.log(tab, "tab");
            return {
              id: tab.id?.toString() || "",
              windowId: tab.windowId,
              title: tab.title || "",
              url: tab.url || "",
              favicon: tab.favIconUrl || "/icon/blankTab.png",
              index: tab.index || 0,
              domain: extractDomain(tab.url || ""),
              lastAccessed: tab.active
                ? currentTime
                : existingTab?.lastAccessed || currentTime,
              muted: tab.mutedInfo?.muted || false, // 获取静音状态
              groupId: tab.groupId,
            };
          });
          formattedTabs.sort((a, b) => a.index - b.index);
          setActiveTabId(
            chromeTabs
              .find((tab: chrome.tabs.Tab) => tab.active)
              ?.id?.toString() || null
          );
          return formattedTabs;
        });
      }
    );
  }, []);

  useEffect(() => {
    updateTabs();

    const handleActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      const currentTime = Date.now();
      setActiveTabId(activeInfo.tabId.toString());
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeInfo.tabId.toString()
            ? { ...tab, lastAccessed: currentTime }
            : tab
        )
      );
    };

    window.chrome.tabs.onCreated.addListener(updateTabs);
    window.chrome.tabs.onRemoved.addListener(updateTabs);
    window.chrome.tabs.onUpdated.addListener(updateTabs);
    window.chrome.tabs.onActivated.addListener(handleActivated);

    return () => {
      window.chrome.tabs.onCreated.removeListener(updateTabs);
      window.chrome.tabs.onRemoved.removeListener(updateTabs);
      window.chrome.tabs.onUpdated.removeListener(updateTabs);
      window.chrome.tabs.onActivated.removeListener(handleActivated);
    };
  }, [updateTabs]);

  return { tabs, setTabs, activeTabId, setActiveTabId, updateTabs };
}
