import {
  ScrollArea,
  Stack,
  ActionIcon,
  TextInput,
  UnstyledButton,
  Radio,
  Popover,
} from "@mantine/core";
import {
  IconPlus,
  IconPencil,
  IconTabPlus,
  IconFolderOff,
  IconCircleX,
  IconArrowMoveRight,
} from "@tabler/icons-react";
import TabItem from "./TabItem";
import React from "react";

export interface TabGroupsAreaProps {
  groupedTabs: any;
  getGroupInfo: (groupId: number) => any;
  collapsedGroups: Record<number, boolean>;
  toggleGroupCollapse: (groupId: number) => void;
  openTab: string;
  setOpenTab: (id: string) => void;
  activeTabId: string;
  handleTabClick: (tabId: string) => void;
  handleTabClose: (tabId: string, e: React.MouseEvent) => void;
  handleContextMenu: (tab: any, e: React.MouseEvent) => void;
  groupName: string;
  setGroupName: (name: string) => void;
  groupColors: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  handleAddTabToGroup: (tabId: string) => void;
  handleUngroup: (tabId: string) => void;
  handleCloseGroup: (tabId: string) => void;
  handleMoveGroupToNewWindow: (tabId: string) => void;
  currentTabId: string;
}

const TabGroupsArea: React.FC<TabGroupsAreaProps> = ({
  groupedTabs,
  getGroupInfo,
  collapsedGroups,
  toggleGroupCollapse,
  openTab,
  setOpenTab,
  activeTabId,
  handleTabClick,
  handleTabClose,
  handleContextMenu,
  groupName,
  setGroupName,
  groupColors,
  selectedColor,
  setSelectedColor,
  handleAddTabToGroup,
  handleUngroup,
  handleCloseGroup,
  handleMoveGroupToNewWindow,
  currentTabId,
}) => {
  return (
    <ScrollArea style={{ flex: 1, overflow: "visible" }}>
      <Stack gap="xs" style={{ overflow: "visible" }}>
        {/* 渲染分组 */}
        {Object.entries(groupedTabs.groupMap).map(([groupId, tabsInGroup]) => {
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
                tabsInGroup.map((tab: any) => (
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
        })}
        {/* 渲染未分组标签 */}
        {groupedTabs.ungrouped.map((tab: any) => (
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
  );
};

export default TabGroupsArea;
