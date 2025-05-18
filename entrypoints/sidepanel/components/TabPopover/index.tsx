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
import TabItem from "../TabItem";
import { Tab } from "../../utils/type";
import { groupColors, ColorMap } from "../../utils/constants";

interface TabPopoverProps {
  tab: Tab;
  tabGroups?: chrome.tabGroups.TabGroup[];
  openTabId: number | null;
  setOpenTabId: (id: number | null) => void;
  selectedColorMap: Record<string, chrome.tabGroups.Color>;
  setSelectedColorMap: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  setTabGroups: React.Dispatch<
    React.SetStateAction<chrome.tabGroups.TabGroup[]>
  >;
}

const TabPopover = ({
  tab,
  tabGroups,
  openTabId,
  setOpenTabId,
  selectedColorMap,
  setSelectedColorMap,
  setTabGroups,
}: TabPopoverProps) => {
  const { tabs } = useChromeTabs();
  const tabKey = tab.id;
  const group = tabGroups?.find((g) => g.id === tab.groupId);
  // 事件处理函数
  const handleAddTabToGroup = (tabId: number) => {
    const tab = tabs.find((t: Tab) => t.id === tabId);
    if (!tab || !tab.groupId || tab.groupId === -1) return;
    chrome.tabs.create(
      { windowId: tab.windowId, index: tab.index + 1 },
      (newTab) => {
        if (newTab.id !== undefined) {
          chrome.tabs.group(
            { groupId: tab.groupId, tabIds: [newTab.id] },
            () => {}
          );
        }
      }
    );
    setOpenTabId(null);
  };
  const handleUngroup = (tabId: number) => {
    const tab = tabs.find((t: Tab) => t.id === tabId);
    if (!tab || !tab.groupId || tab.groupId === -1) return;
    chrome.tabs.ungroup([Number(tab.id)]);
    setOpenTabId(null);
  };
  const handleCloseGroup = (tabId: number) => {
    const tab = tabs.find((t: Tab) => t.id === tabId);
    if (!tab || !tab.groupId || tab.groupId === -1) return;
    // 找到该分组下所有tab
    const groupTabs = tabs.filter((t: Tab) => t.groupId === tab.groupId);
    chrome.tabs.remove(groupTabs.map((t: Tab) => Number(t.id)));
    setOpenTabId(null);
  };
  const handleMoveGroupToNewWindow = (tabId: number) => {
    const tab = tabs.find((t: Tab) => t.id === tabId);
    if (!tab || !tab.groupId || tab.groupId === -1) return;
    const groupTabs = tabs.filter((t: Tab) => t.groupId === tab.groupId);
    chrome.windows.create({ tabId: Number(groupTabs[0].id) }, (newWindow) => {
      if (!newWindow || !newWindow.id) return;
      // 其余tab移到新窗口
      const restTabIds = groupTabs.slice(1).map((t: Tab) => Number(t.id));
      if (restTabIds.length > 0) {
        chrome.tabs.move(restTabIds, { windowId: newWindow.id, index: -1 });
      }
    });
    setOpenTabId(null);
  };
  return (
    <Popover
      width={200}
      position="bottom"
      shadow="md"
      opened={openTabId === tabKey}
      offset={-20}
      onDismiss={() => setOpenTabId(null)}
      key={tabKey}
    >
      <Popover.Target>
        <div onClick={() => setOpenTabId(tabKey)}>
          <TabItem
            tab={tab}
            tabGroups={tabGroups}
            groupName={group?.title || ""}
            selectedColor={selectedColorMap[tabKey]}
            setOpenTab={() => setOpenTabId(tabKey)}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <FocusTrap active>
            <TextInput
              data-autofocus
              placeholder="命名该组"
              value={group?.title || ""}
              onChange={(e) => {
                if (tab.groupId && tab.groupId !== -1) {
                  chrome.tabGroups.update(
                    tab.groupId,
                    { title: e.target.value },
                    () => {
                      // 刷新分组
                      chrome.tabGroups.query(
                        { windowId: tab.windowId },
                        (groups) => {
                          setTabGroups(groups);
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
                  const tabObj = tabs.find((t) => t.id === tab.id);
                  if (tabObj && tabObj.groupId && tabObj.groupId !== -1) {
                    chrome.tabGroups.update(
                      tabObj.groupId,
                      {
                        color,
                      },
                      () => {
                        // 刷新分组
                        chrome.tabGroups.query(
                          { windowId: tab.windowId },
                          (groups) => {
                            setTabGroups(groups);
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
            onClick={() => handleAddTabToGroup(tabKey)}
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
            onClick={() => handleUngroup(tabKey)}
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
            onClick={() => handleCloseGroup(tabKey)}
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
            onClick={() => handleMoveGroupToNewWindow(tabKey)}
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
  );
};

export default TabPopover;
