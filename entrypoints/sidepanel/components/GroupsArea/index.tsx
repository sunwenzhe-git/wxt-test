import React, {
  useState,
  useMemo,
  useEffect,
  MouseEvent,
  useCallback,
} from "react";
import { ScrollArea, Stack, ActionIcon } from "@mantine/core";
import { IconPlus, IconPencil } from "@tabler/icons-react";
import TabPopover from "../TabPopover";
import useChromeTabs from "../../hooks/useChromeTabs";
import { useStore, useSelector } from "../../store";
import { ColorMap } from "../../utils/constants";
import { Tab } from "../../utils/type";

type GroupsAreaProps = {
  searchQuery: string;
};
const GroupsArea: React.FC<GroupsAreaProps> = ({ searchQuery }) => {
  const { tabs } = useChromeTabs();
  const { setStore, tabGroups } = useStore(
    useSelector(["tabGroups", "setStore"])
  );
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<number, boolean>
  >({});

  // 搜索过滤
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
        setStore({ tabGroups: groups });
      });
    }
  }, [tabs]);

  // 按groupId分组
  const groupedTabs = useMemo(() => {
    const groupMap: Record<number, Tab[]> = {};
    const ungrouped: Tab[] = [];
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
  const getGroupInfo = useCallback(
    (groupId: number) =>
      tabGroups.find((g) => g.id === groupId) as chrome.tabGroups.TabGroup,
    [tabGroups]
  );

  // 切换分组展开/收起
  const toggleGroupCollapse = useCallback((groupId: number) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);
  return (
    <ScrollArea style={{ flex: 1, overflow: "visible" }}>
      <Stack gap="xs" style={{ overflow: "visible" }}>
        {/* 渲染分组 */}
        {Object.entries(groupedTabs.groupMap).map(([groupId, tabsInGroup]) => {
          const group = getGroupInfo(Number(groupId));
          const isCollapsed = collapsedGroups[Number(groupId)] ?? false;

          return (
            <div key={groupId}>
              {/* 分组头部 */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                  cursor: "pointer",
                }}
                onClick={() => toggleGroupCollapse(Number(groupId))}
              >
                <div
                  style={{
                    background: ColorMap[group?.color],
                    color: "#fff",
                    borderRadius: 4,
                    lineHeight: 1,
                    padding: "6px",
                    boxSizing: "border-box",
                    fontSize: 11,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      display: "inline-block",
                      transform: isCollapsed
                        ? "rotate(90deg)"
                        : "rotate(180deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft:
                          "4px solid transparent" /* 调整这个值来改变宽度 */,
                        borderRight: "4px solid transparent",
                        borderBottom: `6px solid #fff`,
                      }}
                    ></div>
                  </div>
                  {group?.title}
                </div>
                <div>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    style={{ marginLeft: 6 }}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      // 新建标签页并加入该分组
                      const groupIdNum = Number(groupId);
                      const groupTabs = tabs.filter(
                        (t: Tab) => t.groupId === groupIdNum
                      );
                      const insertIndex =
                        groupTabs.length > 0
                          ? groupTabs[groupTabs.length - 1].index + 1
                          : 0;
                      chrome.tabs.create(
                        {
                          windowId: tabs[0]?.windowId,
                          index: insertIndex,
                        },
                        (newTab) => {
                          if (newTab.id !== undefined) {
                            chrome.tabs.group({
                              groupId: groupIdNum,
                              tabIds: [newTab.id],
                            });
                          }
                        }
                      );
                    }}
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      // 唤起该分组第一个tab的Popover
                      const groupTabs = tabs.filter(
                        (t: Tab) => t.groupId === Number(groupId)
                      );
                      if (groupTabs.length > 0) {
                        setStore({ openTabId: groupTabs[0].id });
                      }
                    }}
                  >
                    <IconPencil size={14} />
                  </ActionIcon>
                </div>
              </div>

              {/* 分组内标签 */}
              {!isCollapsed && (
                <div style={{ marginTop: 8 }}>
                  {tabsInGroup.map((tab) => (
                    <div
                      key={tab.id}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          height: 20,
                          marginLeft: 4,
                          marginRight: 8,
                          backgroundColor: ColorMap[group?.color],
                        }}
                      ></div>
                      <div style={{ flex: 1 }}>
                        <TabPopover key={tab.id} tab={tab} isGroup />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* 渲染未分组标签 */}
        {groupedTabs.ungrouped.map((tab) => (
          <TabPopover key={tab.id} tab={tab} isGroup={false} />
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default React.memo(GroupsArea);
