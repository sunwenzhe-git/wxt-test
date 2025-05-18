import React, { forwardRef, useCallback, ForwardedRef } from "react";
import { useContextMenu } from "mantine-contextmenu";
import { ActionIcon, Group, Text, Paper } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import useChromeTabs from "../../hooks/useChromeTabs";
import { Tab, TabGroup } from "../../utils/type";
import { useStore, useSelector } from "../../store";
import { ColorMap } from "../../utils/constants";

interface TabItemProps {
  tab: Tab;
  groupName: string;
  isGroup: boolean;
  selectedColor: chrome.tabGroups.Color;
}

const TabItem = React.memo(
  forwardRef<HTMLDivElement, TabItemProps>(
    (
      { tab, groupName, selectedColor, isGroup },
      ref: ForwardedRef<HTMLDivElement>
    ) => {
      const { setStore, tabGroups } = useStore(
        useSelector(["tabGroups", "setStore"])
      );
      const { setTabs, activeTabId, setActiveTabId } = useChromeTabs();
      const { showContextMenu } = useContextMenu();

      // 处理标签关闭
      const handleTabClose = useCallback(
        (tabId: number, e: React.MouseEvent) => {
          e.stopPropagation();
          const idNum = Number(tabId);
          if (!isNaN(idNum)) {
            window.chrome.tabs.remove(idNum);
          }
        },
        []
      );

      // 处理标签点击
      const handleTabClick = (tabId: number) => {
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
      };

      // 右键菜单相关
      const handleNewTabBelow = useCallback((tab: Tab) => {
        chrome.tabs.create({ index: tab.index + 1 });
      }, []);
      const handleReload = useCallback((tab: Tab) => {
        chrome.tabs.reload(Number(tab.id));
      }, []);
      const handleCopyUrl = useCallback((tab: Tab) => {
        navigator.clipboard.writeText(tab.url);
      }, []);
      const handleMute = useCallback(
        (tab: Tab) => {
          const newMutedState = !tab.muted;
          chrome.tabs.update(Number(tab.id), { muted: newMutedState });
          setTabs((prevTabs) =>
            prevTabs.map((t) =>
              t.id === tab.id ? { ...t, muted: newMutedState } : t
            )
          );
        },
        [setTabs]
      );
      console.log(groupName, "groupName1");
      const handleContextMenu = useCallback(
        (tab: Tab, e: React.MouseEvent) => {
          e.preventDefault();
          const groups: TabGroup[] = tabGroups ?? [];
          chrome.windows.getAll({ populate: true }, (windows) => {
            console.log(
              groups,
              tab.groupId,
              groups.filter((item) => item.id != tab.groupId),
              "tab.groupId"
            );
            showContextMenu([
              {
                key: "将选项卡添加到组",
                title: <span style={{ fontSize: 11 }}>将选项卡添加到组</span>,
                disabled:
                  isGroup &&
                  !groups.filter((item) => item.id != tab.groupId)?.length,
                items: !isGroup
                  ? [
                      {
                        key: "新建组",
                        title: <span style={{ fontSize: 11 }}>新建组</span>,
                        onClick: async () => {
                          const tabIdNum = Number(tab.id);
                          chrome.tabs.group(
                            { tabIds: [tabIdNum] },
                            (groupId) => {
                              chrome.tabGroups.update(groupId, {
                                color: selectedColor,
                                title: groupName,
                              });
                            }
                          );
                          setStore({ openTabId: tab.id });
                        },
                      },
                      { key: "divider" },
                      ...groups
                        .filter((item) => item.id != tab.groupId)
                        .map((group) => ({
                          key: `group-${group.id}`,
                          title: (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  background: ColorMap[group?.color],
                                  borderRadius: 3,
                                  width: 12,
                                  height: 12,
                                  marginRight: 8,
                                }}
                              />
                              <div style={{ fontSize: 11 }}>
                                {group.title || "无名称分组"}
                              </div>
                            </div>
                          ),
                          onClick: () => {
                            chrome.tabs.group(
                              { groupId: group.id, tabIds: [Number(tab.id)] },
                              () => {}
                            );
                          },
                        })),
                    ]
                  : [
                      ...groups
                        .filter((item) => item.id != tab.groupId)
                        .map((group) => ({
                          key: `group-${group.id}`,
                          title: (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  background: ColorMap[group?.color],
                                  borderRadius: 3,
                                  width: 12,
                                  height: 12,
                                  marginRight: 8,
                                }}
                              />
                              <div style={{ fontSize: 11 }}>
                                {group.title || "无名称分组"}
                              </div>
                            </div>
                          ),
                          onClick: () => {
                            chrome.tabs.group(
                              { groupId: group.id, tabIds: [Number(tab.id)] },
                              () => {}
                            );
                          },
                        })),
                    ],
                style: {
                  padding: "6px 16px",
                },
              },
              {
                key: "在其下新建标签页",
                title: <span style={{ fontSize: 11 }}>在其下新建标签页</span>,
                onClick: () => handleNewTabBelow(tab),
                style: {
                  padding: "6px 16px",
                },
              },
              {
                key: "移动到新窗口",
                title: (
                  <span style={{ fontSize: 11 }}>将选项卡移动到另一个窗口</span>
                ),
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
                  padding: "6px 16px",
                },
              },
              { key: "divider" },
              {
                key: "重新加载",
                title: <span style={{ fontSize: 11 }}>重新加载</span>,
                onClick: () => handleReload(tab),
                style: {
                  padding: "6px 16px",
                },
              },
              {
                key: "复制网址",
                title: <span style={{ fontSize: 11 }}>复制网址</span>,
                onClick: () => handleCopyUrl(tab),
                style: {
                  padding: "6px 16px",
                },
              },
              {
                key: "静音站点",
                title: (
                  <span style={{ fontSize: 11 }}>
                    {tab.muted ? "取消标签页静音" : "使标签页静音"}
                  </span>
                ),
                onClick: () => handleMute(tab),
                style: {
                  padding: "6px 16px",
                },
              },
            ])(e);
          });
        },
        [tabGroups, groupName, selectedColor]
      );

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
            <Text size="sm" style={{ flex: 1, fontSize: 12 }} truncate>
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
  )
);

export default TabItem;
