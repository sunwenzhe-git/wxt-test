import { extractDomain } from "../utils";
import { Tab } from "../utils/type";
// hooks: 监听和数据处理
export default function useChromeTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  // 关闭所有标签
  const handleCloseAllTabs = useCallback(() => {
    // 创建一个新的空标签页
    window.chrome.tabs.create({ active: true }, (newTab) => {
      // 收集所有旧标签页 id（不包括新建的）
      const oldTabIds = tabs
        .map((tab) => tab.id)
        .filter((id) => id !== newTab.id);
      if (oldTabIds.length > 0) {
        window.chrome.tabs.remove(oldTabIds);
      }
    });
  }, [tabs]);
  // 更新标签列表
  const updateTabs = useCallback(() => {
    window.chrome.tabs.query(
      { currentWindow: true },
      (chromeTabs: chrome.tabs.Tab[]) => {
        const currentTime = Date.now();
        setTabs((prevTabs) => {
          const formattedTabs = chromeTabs.map((tab: chrome.tabs.Tab) => {
            const existingTab = prevTabs.find((t) => t.id === tab.id);
            return {
              id: tab.id as number,
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
            chromeTabs.find((tab: chrome.tabs.Tab) => tab.active)?.id || null
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
      setActiveTabId(activeInfo.tabId);
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeInfo.tabId
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

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    updateTabs,
    handleCloseAllTabs,
  };
}
