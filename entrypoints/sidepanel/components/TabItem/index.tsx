import { forwardRef, useCallback, ForwardedRef } from "react";
import { useContextMenu } from "mantine-contextmenu";
import { ActionIcon, Group, Text, Paper } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import useChromeTabs from "../../hooks/useChromeTabs";
import { Tab, TabGroup } from "../../utils/type";

interface TabItemProps {
  tab: Tab;
  groupName: string;
  selectedColor: chrome.tabGroups.Color;
  tabGroups?: TabGroup[];
  setOpenTab: (id: number | null) => void;
}

const TabItem = forwardRef<HTMLDivElement, TabItemProps>(
  (
    { tab, tabGroups, groupName, selectedColor, setOpenTab },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { setTabs, activeTabId, setActiveTabId } = useChromeTabs();

    // 处理标签关闭
    const handleTabClose = useCallback((tabId: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const idNum = Number(tabId);
      if (!isNaN(idNum)) {
        window.chrome.tabs.remove(idNum);
      }
    }, []);

    // 处理标签点击
    const handleTabClick = useCallback(
      (tabId: number) => {
        const idNum = Number(tabId);
        if (!isNaN(idNum)) {
          const currentTime = Date.now();
          window.chrome.tabs.update(idNum, { active: true });
          setActiveTabId(tabId);
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === tabId ? { ...tab, lastAccessed: currentTime } : tab
            )
          );
        }
      },
      [setActiveTabId, setTabs]
    );

    const { showContextMenu } = useContextMenu();

    // 右键菜单相关
    const handleNewTabBelow = (tab: Tab) => {
      chrome.tabs.create({ index: tab.index + 1 });
    };
    const handleMoveToWindow = (tab: Tab) => {
      chrome.windows.create({ tabId: Number(tab.id) });
    };
    const handleReload = (tab: Tab) => {
      chrome.tabs.reload(Number(tab.id));
    };
    const handleCopyUrl = (tab: Tab) => {
      navigator.clipboard.writeText(tab.url);
    };
    const handleMute = (tab: Tab) => {
      const newMutedState = !tab.muted;
      chrome.tabs.update(Number(tab.id), { muted: newMutedState });
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === tab.id ? { ...t, muted: newMutedState } : t
        )
      );
    };
    console.log(groupName, "groupName1");
    const handleContextMenu = (tab: Tab, e: React.MouseEvent) => {
      e.preventDefault();
      const groups: TabGroup[] = tabGroups ?? [];
      chrome.windows.getAll({ populate: true }, (windows) => {
        showContextMenu([
          {
            key: "将选项卡添加到组",
            title: "将选项卡添加到组",
            items: [
              {
                key: "新建组",
                title: "新建组",
                onClick: async () => {
                  const tabIdNum = Number(tab.id);
                  chrome.tabs.group({ tabIds: [tabIdNum] }, (groupId) => {
                    chrome.tabGroups.update(groupId, {
                      color: selectedColor,
                      title: groupName,
                    });
                  });
                  setOpenTab(tab.id);
                },
              },
              { key: "divider" },
              ...groups
                .filter((item) => item.id != tab.groupId)
                .map((group) => ({
                  key: `group-${group.id}`,
                  title: group.title || `分组${group.id}`,
                  onClick: () => {
                    chrome.tabs.group(
                      { groupId: group.id, tabIds: [Number(tab.id)] },
                      () => {}
                    );
                  },
                })),
            ],
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
          {
            key: "在其下新建标签页",
            title: "在其下新建标签页",
            onClick: () => handleNewTabBelow(tab),
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
          {
            key: "移动到新窗口",
            title: "将选项卡移动到另一个窗口",
            items: windows
              .filter((win) => win.id !== tab.windowId)
              .map((win) => ({
                key: `window-${win.id}`,
                title: `（${win.tabs?.[0]?.title || "无标题"}... 共${
                  win.tabs?.length
                }个标签）`,
                onClick: () => {
                  chrome.tabs.move(Number(tab.id), {
                    windowId: win.id,
                    index: -1,
                  });
                },
                style: {
                  fontSize: 9,
                  padding: "6px 16px",
                },
              })),
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
          { key: "divider" },
          {
            key: "重新加载",
            title: "重新加载",
            onClick: () => handleReload(tab),
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
          {
            key: "复制网址",
            title: "复制网址",
            onClick: () => handleCopyUrl(tab),
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
          {
            key: "静音站点",
            title: tab.muted ? "取消标签页静音" : "使标签页静音",
            onClick: () => handleMute(tab),
            style: {
              fontSize: 9,
              padding: "6px 16px",
            },
          },
        ])(e);
      });
    };

    return (
      <Paper
        ref={ref}
        p="xs"
        style={{ width: "100%" }}
        className={`tab-item${activeTabId === tab.id ? " selected" : ""}`}
        onClick={() => handleTabClick(tab.id)}
        onContextMenu={(e) => handleContextMenu(tab, e)}
      >
        <Group gap="xs" wrap="nowrap">
          {tab.favicon && (
            <img
              src={tab.favicon}
              alt=""
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
              }}
            />
          )}
          <Text size="sm" style={{ flex: 1 }} truncate>
            {tab.title}
          </Text>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={(e) => handleTabClose(tab.id, e)}
            style={{
              opacity: 0.5,
              "&:hover": {
                opacity: 1,
                backgroundColor: "var(--mantine-color-dark-4)",
              },
            }}
          >
            <IconX size={12} />
          </ActionIcon>
        </Group>
      </Paper>
    );
  }
);

export default TabItem;
