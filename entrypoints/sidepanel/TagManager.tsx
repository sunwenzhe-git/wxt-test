/*
 *  Author: swz
 *  Description: Tag Manager (Refactored)
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Radio,
  UnstyledButton,
  TextInput,
  ActionIcon,
  Group,
  Stack,
  Popover,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import { useContextMenu } from "mantine-contextmenu";
import {
  IconSearch,
  IconTrash,
  IconPlus,
  IconPlus as IconTabPlus,
  IconX,
  IconCircleX,
  IconFolderMinus,
  IconFolderOff,
  IconArrowMoveRight,
  IconPencil,
} from "@tabler/icons-react";
import TabItem from "./components/TabItem";
import useChromeTabs from "./hooks/useChromeTabs";
import { Tab } from "./utils/type";

import "./TagManager.css";

// 主组件
export function TagManager() {
  const { showContextMenu } = useContextMenu();
  const { tabs, setTabs, activeTabId, setActiveTabId } = useChromeTabs();
  const [openTab, setOpenTab] = useState<any>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupColors, setGroupColors] = useState([
    "#286eeb",
    "#e3008c",
    "#c239b3",
    "#822fff",
    "#004e8c",
    "#048387",
    "#ca5011",
    "#986f0b",
    "#6f6d6b",
  ]);
  const [selectedColor, setSelectedColor] = useState("#286eeb");
  const [currentTabId, setCurrentTabId] = useState("");
  const [tabGroups, setTabGroups] = useState<any[]>([]);
  // 分组展开/收起状态
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<number, boolean>
  >({});

  // filteredTabs声明提前
  const filteredTabs = useMemo(
    () =>
      tabs.filter(
        (tab: Tab) =>
          tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tab.url.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [tabs, searchQuery]
  );

  // 获取所有分组信息
  useEffect(() => {
    if (tabs.length === 0) return;
    const windowId = (tabs[0] as any)?.windowId;
    if (windowId) {
      chrome.tabGroups.query({ windowId }, (groups) => {
        setTabGroups(groups);
      });
    }
  }, [tabs]);

  // 按groupId分组
  const groupedTabs = useMemo(() => {
    const groupMap: Record<number, any[]> = {};
    const ungrouped: any[] = [];
    for (const tab of filteredTabs) {
      if (tab.groupId && tab.groupId !== -1) {
        if (!groupMap[tab.groupId]) groupMap[tab.groupId] = [];
        groupMap[tab.groupId].push(tab);
      } else {
        ungrouped.push(tab);
      }
    }
    return { groupMap, ungrouped };
  }, [filteredTabs]);

  // 获取分组头部信息
  const getGroupInfo = (groupId: number): any => {
    return tabGroups.find((g: any) => g.id === groupId) || {};
  };

  // 处理标签切换
  const handleTabClick = useCallback(
    (tabId: string) => {
      const currentTime = Date.now();
      window.chrome.tabs.update(parseInt(tabId), { active: true });
      setActiveTabId(tabId);
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId ? { ...tab, lastAccessed: currentTime } : tab
        )
      );
    },
    [setActiveTabId, setTabs]
  );

  // 处理标签关闭
  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.chrome.tabs.remove(parseInt(tabId));
  }, []);

  const handleNewTabBelow = (tab: any) => {
    chrome.tabs.create({ index: tab.index + 1 });
  };
  const handleMoveToWindow = (tab: any) => {
    chrome.windows.create({ tabId: parseInt(tab.id) });
  };
  const handleReload = (tab: any) => {
    chrome.tabs.reload(parseInt(tab.id));
  };
  const handleCopyUrl = (tab: any) => {
    navigator.clipboard.writeText(tab.url);
  };
  const handleMute = (tab: any) => {
    const newMutedState = !tab.muted; // 切换静音状态
    chrome.tabs.update(parseInt(tab.id), { muted: newMutedState });
    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === tab.id ? { ...t, muted: newMutedState } : t
      )
    );
  };

  // 关闭所有标签
  const handleCloseAllTabs = useCallback(() => {
    // 创建一个新的空标签页
    window.chrome.tabs.create({ active: true }, (newTab) => {
      // 收集所有旧标签页 id（不包括新建的）
      const oldTabIds = tabs
        .map((tab) => parseInt(tab.id))
        .filter((id) => id !== newTab.id);
      if (oldTabIds.length > 0) {
        window.chrome.tabs.remove(oldTabIds);
      }
    });
  }, [tabs]);
  // 新建标签
  const handleNewTab = useCallback(() => {
    window.chrome.tabs.create({ active: true });
  }, []);

  const handleContextMenu = (tab: any, e: React.MouseEvent) => {
    e.preventDefault();
    const groups: any[] = tabGroups ?? [];
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
                // 创建新分组并设置颜色和标题
                const tabIdNum = parseInt(tab.id);
                // 颜色映射（可根据你的自定义色盘调整）
                const colorMap: Record<string, string> = {
                  "#286eeb": "blue",
                  "#e3008c": "pink",
                  "#c239b3": "purple",
                  "#822fff": "purple",
                  "#004e8c": "blue",
                  "#048387": "cyan",
                  "#ca5011": "orange",
                  "#986f0b": "yellow",
                  "#6f6d6b": "grey",
                };
                const chromeColor = colorMap[selectedColor] || "grey";
                chrome.tabs.group({ tabIds: [tabIdNum] }, (groupId) => {
                  chrome.tabGroups.update(groupId, {
                    color: chromeColor as chrome.tabGroups.Color,
                    title: groupName || "新分组",
                  });
                });
                setCurrentTabId("");
                setOpenTab("");
              },
            },
            { key: "divider" },
            ...groups.map((group) => ({
              key: `group-${group.id}`,
              title: group.title || `分组${group.id}`,
              onClick: () => {
                setCurrentTabId(tab.id);
                setOpenTab(tab.id);
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
                chrome.tabs.move(parseInt(tab.id), {
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

  const handleAddTabToGroup = (tabId: string) => {
    // Implementation of adding a tab to a group
  };

  const handleUngroup = (tabId: string) => {
    // Implementation of ungrouping a tab
  };

  const handleCloseGroup = (tabId: string) => {
    // Implementation of closing a group
  };

  const handleMoveGroupToNewWindow = (tabId: string) => {
    // Implementation of moving a group to a new window
  };

  // 切换分组展开/收起
  const toggleGroupCollapse = (groupId: number) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <Box
      p="xs"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Group mb="xs" gap="xs">
        <TextInput
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} />}
          size="xs"
          style={{ flex: 1 }}
        />
        <Tooltip label="关闭所有标签">
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={handleCloseAllTabs}
            style={{
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
                backgroundColor: "var(--mantine-color-red-9)",
              },
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <ScrollArea style={{ flex: 1, overflow: "visible" }}>
        <Stack gap="xs" style={{ overflow: "visible" }}>
          {/* 渲染分组 */}
          {Object.entries(groupedTabs.groupMap).map(
            ([groupId, tabsInGroup]) => {
              const group = getGroupInfo(Number(groupId));
              const isCollapsed = collapsedGroups[Number(groupId)] ?? false;
              return (
                <div key={groupId} style={{ marginBottom: 8 }}>
                  {/* 分组头部 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 4,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleGroupCollapse(Number(groupId))}
                  >
                    <div
                      style={{
                        background: group.color
                          ? `var(--mantine-color-${group.color}-6)`
                          : "#e0e0e0",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "2px 10px",
                        fontSize: 13,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        userSelect: "none",
                      }}
                    >
                      {/* 展开/收起箭头 */}
                      <span
                        style={{
                          fontSize: 14,
                          marginRight: 2,
                          display: "inline-block",
                          transform: isCollapsed
                            ? "rotate(-30deg)"
                            : "rotate(180deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▲
                      </span>
                      {group.title || `分组${groupId}`}
                    </div>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      style={{ marginLeft: 6 }}
                      onClick={(e) => {
                        e.stopPropagation(); /* 这里可实现分组内新建tab */
                      }}
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  </div>
                  {/* 分组内标签 */}
                  {!isCollapsed &&
                    tabsInGroup.map((tab) => (
                      <Popover
                        width={200}
                        position="bottom"
                        shadow="md"
                        opened={openTab === tab.id}
                        offset={-20}
                        onDismiss={() => setOpenTab("")}
                        key={tab.id}
                      >
                        <Popover.Target>
                          <TabItem
                            tab={tab}
                            activeTabId={activeTabId}
                            onTabClick={handleTabClick}
                            onTabClose={handleTabClose}
                            onContextMenu={(e) => handleContextMenu(tab, e)}
                          />
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Stack gap="xs">
                            <TextInput
                              placeholder="命名该组"
                              value={groupName || ""}
                              onChange={(e) => setGroupName(e.target.value)}
                              size="xs"
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                              }}
                            >
                              {groupColors.map((color) => (
                                <div onClick={() => setSelectedColor(color)}>
                                  {selectedColor === color ? (
                                    <Radio color={color} checked size="xs" />
                                  ) : (
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: color,
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <UnstyledButton
                              onClick={() => handleAddTabToGroup(currentTabId)}
                              style={{
                                textAlign: "left",
                                padding: "4px 0",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: 6,
                                transition: "background 0.15s",
                              }}
                              className="popover-action-btn"
                            >
                              <IconTabPlus size={16} style={{ opacity: 0.7 }} />
                              在组中新建标签页
                            </UnstyledButton>
                            <UnstyledButton
                              onClick={() => handleUngroup(currentTabId)}
                              style={{
                                textAlign: "left",
                                padding: "4px 0",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: 6,
                                transition: "background 0.15s",
                              }}
                              className="popover-action-btn"
                            >
                              <IconFolderOff
                                size={16}
                                style={{ opacity: 0.7 }}
                              />
                              取消分组
                            </UnstyledButton>
                            <UnstyledButton
                              onClick={() => handleCloseGroup(currentTabId)}
                              style={{
                                textAlign: "left",
                                padding: "4px 0",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: 6,
                                transition: "background 0.15s",
                              }}
                              className="popover-action-btn"
                            >
                              <IconCircleX size={16} style={{ opacity: 0.7 }} />
                              关闭分组标签页
                            </UnstyledButton>
                            <UnstyledButton
                              onClick={() =>
                                handleMoveGroupToNewWindow(currentTabId)
                              }
                              style={{
                                textAlign: "left",
                                padding: "4px 0",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: 6,
                                transition: "background 0.15s",
                              }}
                              className="popover-action-btn"
                            >
                              <IconArrowMoveRight
                                size={16}
                                style={{ opacity: 0.7 }}
                              />
                              将组移动到新窗口
                            </UnstyledButton>
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                    ))}
                </div>
              );
            }
          )}
          {/* 渲染未分组标签 */}
          {groupedTabs.ungrouped.map((tab) => (
            <Popover
              width={200}
              position="bottom"
              shadow="md"
              opened={openTab === tab.id}
              offset={-20}
              onDismiss={() => setOpenTab("")}
              key={tab.id}
            >
              <Popover.Target>
                <TabItem
                  tab={tab}
                  activeTabId={activeTabId}
                  onTabClick={handleTabClick}
                  onTabClose={handleTabClose}
                  onContextMenu={(e) => handleContextMenu(tab, e)}
                />
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <TextInput
                    placeholder="命名该组"
                    value={groupName || ""}
                    onChange={(e) => setGroupName(e.target.value)}
                    size="xs"
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {groupColors.map((color) => (
                      <div onClick={() => setSelectedColor(color)}>
                        {selectedColor === color ? (
                          <Radio color={color} checked size="xs" />
                        ) : (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: color,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <UnstyledButton
                    onClick={() => handleAddTabToGroup(currentTabId)}
                    style={{
                      textAlign: "left",
                      padding: "4px 0",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 6,
                      transition: "background 0.15s",
                    }}
                    className="popover-action-btn"
                  >
                    <IconTabPlus size={16} style={{ opacity: 0.7 }} />
                    在组中新建标签页
                  </UnstyledButton>
                  <UnstyledButton
                    onClick={() => handleUngroup(currentTabId)}
                    style={{
                      textAlign: "left",
                      padding: "4px 0",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 6,
                      transition: "background 0.15s",
                    }}
                    className="popover-action-btn"
                  >
                    <IconFolderOff size={16} style={{ opacity: 0.7 }} />
                    取消分组
                  </UnstyledButton>
                  <UnstyledButton
                    onClick={() => handleCloseGroup(currentTabId)}
                    style={{
                      textAlign: "left",
                      padding: "4px 0",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 6,
                      transition: "background 0.15s",
                    }}
                    className="popover-action-btn"
                  >
                    <IconCircleX size={16} style={{ opacity: 0.7 }} />
                    关闭分组标签页
                  </UnstyledButton>
                  <UnstyledButton
                    onClick={() => handleMoveGroupToNewWindow(currentTabId)}
                    style={{
                      textAlign: "left",
                      padding: "4px 0",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 6,
                      transition: "background 0.15s",
                    }}
                    className="popover-action-btn"
                  >
                    <IconArrowMoveRight size={16} style={{ opacity: 0.7 }} />
                    将组移动到新窗口
                  </UnstyledButton>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          ))}
        </Stack>
      </ScrollArea>
      <UnstyledButton
        onClick={handleNewTab}
        style={{
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "8px",
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "var(--mantine-color-dark-6)",
          },
        }}
      >
        <IconPlus size={16} style={{ opacity: 0.6 }} />
      </UnstyledButton>
    </Box>
  );
}
