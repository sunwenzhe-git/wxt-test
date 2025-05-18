import React, { useState, useCallback } from "react";
import {
  Stack,
  TextInput,
  UnstyledButton,
  Radio,
  Popover,
  FocusTrap,
} from "@mantine/core";
import {
  IconPlus as IconTabPlus,
  IconFolderOff,
  IconCircleX,
  IconArrowMoveRight,
} from "@tabler/icons-react";
import useChromeTabs from "../../hooks/useChromeTabs";
import { useStore, useSelector } from "../../store";
import { groupColors, ColorMap } from "../../utils/constants";
import { Tab } from "../../utils/type";

interface GroupPopoverProps {
  groupId: number;
  children: any;
  windowId: number;
}
const GroupPopover = React.memo(
  ({ groupId, children, windowId }: GroupPopoverProps) => {
    const { setStore, tabGroups, openGroupId } = useStore(
      useSelector(["tabGroups", "setStore", "openGroupId"])
    );
    const [selectedColorMap, setSelectedColorMap] = useState({});

    const { tabs } = useChromeTabs();
    const group = tabGroups?.find((g) => g.id === groupId);
    // 事件处理函数
    const handleAddTabToGroup = useCallback(() => {
      const tab = tabs.find((t: Tab) => t.groupId === groupId);
      if (!tab || !groupId || groupId === -1) return;
      chrome.tabs.create(
        { windowId: tab.windowId, index: tab.index + 1 },
        (newTab) => {
          if (newTab.id !== undefined) {
            chrome.tabs.group(
              { groupId: groupId, tabIds: [newTab.id] },
              () => {}
            );
          }
        }
      );
      setStore({ openGroupId: null });
    }, [tabs]);

    const handleUngroup = useCallback(() => {
      const tab = tabs.find((t: Tab) => t.groupId === groupId);
      if (!tab || !groupId || groupId === -1) return;
      chrome.tabs.ungroup([Number(tab.id)]);
      setStore({ openGroupId: null });
    }, [tabs]);

    const handleCloseGroup = useCallback(() => {
      const tab = tabs.find((t: Tab) => t.groupId === groupId);
      if (!tab || !groupId || groupId === -1) return;
      // 找到该分组下所有tab
      const groupTabs = tabs.filter((t: Tab) => t.groupId === groupId);
      chrome.tabs.remove(groupTabs.map((t: Tab) => Number(t.id)));
      setStore({ openGroupId: null });
    }, [tabs]);

    const handleMoveGroupToNewWindow = useCallback(() => {
      const tab = tabs.find((t: Tab) => t.groupId === groupId);
      if (!tab || !groupId || groupId === -1) return;
      const groupTabs = tabs.filter((t: Tab) => t.groupId === groupId);
      chrome.windows.create({ tabId: Number(groupTabs[0].id) }, (newWindow) => {
        if (!newWindow || !newWindow.id) return;
        // 其余tab移到新窗口
        const restTabIds = groupTabs.slice(1).map((t: Tab) => Number(t.id));
        if (restTabIds.length > 0) {
          chrome.tabs.move(restTabIds, {
            windowId: newWindow.id,
            index: -1,
          });
        }
      });
      setStore({ openGroupId: null });
    }, [tabs]);

    return (
      <Popover
        width={200}
        position="bottom"
        shadow="md"
        opened={openGroupId === groupId}
        offset={-20}
        onDismiss={() => setStore({ openGroupId: null })}
      >
        <Popover.Target>{children}</Popover.Target>
        <Popover.Dropdown>
          <Stack gap="xs">
            <FocusTrap active>
              <TextInput
                data-autofocus
                placeholder="命名该组"
                value={group?.title || ""}
                onChange={(e) => {
                  if (groupId && groupId !== -1) {
                    chrome.tabGroups.update(
                      groupId,
                      { title: e.target.value },
                      () => {
                        // 刷新分组
                        chrome.tabGroups.query(
                          { windowId: windowId },
                          (groups) => {
                            setStore({ tabGroups: groups });
                          }
                        );
                      }
                    );
                  }
                }}
                size="xs"
              />
            </FocusTrap>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {groupColors.map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    const tabObj = tabs.find((t) => t.groupId === groupId);
                    if (tabObj && tabObj.groupId && tabObj.groupId !== -1) {
                      chrome.tabGroups.update(
                        tabObj.groupId,
                        {
                          color,
                        },
                        () => {
                          // 刷新分组
                          chrome.tabGroups.query(
                            { windowId: windowId },
                            (groups) => {
                              setStore({ tabGroups: groups });
                            }
                          );
                        }
                      );
                    }
                    setSelectedColorMap((prev) => ({
                      ...prev,
                      [tabKey]: color,
                    }));
                  }}
                >
                  {selectedColorMap[tabKey] === color ? (
                    <Radio color={ColorMap[color]} checked size="xs" />
                  ) : (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: ColorMap[color],
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <UnstyledButton
              onClick={() => handleAddTabToGroup()}
              style={{
                textAlign: "left",
                padding: "4px 0",
                fontSize: 11,
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
              onClick={() => handleUngroup()}
              style={{
                textAlign: "left",
                padding: "4px 0",
                fontSize: 11,
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
              onClick={() => handleCloseGroup()}
              style={{
                textAlign: "left",
                padding: "4px 0",
                fontSize: 11,
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
              onClick={() => handleMoveGroupToNewWindow()}
              style={{
                textAlign: "left",
                padding: "4px 0",
                fontSize: 11,
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
    );
  }
);

export default GroupPopover;
