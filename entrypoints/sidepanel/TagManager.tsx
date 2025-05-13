/*
 *  Author: swz
 *  Description: Tag Manager (Refactored)
 */

import { useState, useCallback, useMemo } from "react";
import {
  Box,
  TextInput,
  ActionIcon,
  Group,
  Stack,
  ScrollArea,
  UnstyledButton,
  Tooltip,
} from "@mantine/core";
import { IconSearch, IconPlus, IconTrash } from "@tabler/icons-react";
import TabItem from "./components/TabItem";
import TabActionsModal from "./components/TabActionsModal";
import useChromeTabs from "./hooks/useChromeTabs";
import { Tab } from "./utils/type";

import "./TagManager.css";

// 主组件
export function TagManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const { tabs, setTabs, activeTabId, setActiveTabId, updateTabs } =
    useChromeTabs();
  const [actionsTab, setActionsTab] = useState<Tab | null>(null);
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
  // 搜索过滤
  const filteredTabs = useMemo(
    () =>
      tabs.filter(
        (tab) =>
          tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tab.url.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [tabs, searchQuery]
  );

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
          {filteredTabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              activeTabId={activeTabId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              setActionsTab={setActionsTab}
            />
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
        <IconPlus size={16} style={{ opacity: 0.7 }} />
      </UnstyledButton>
      <TabActionsModal
        tab={actionsTab}
        opened={!!actionsTab}
        onClose={() => setActionsTab(null)}
      />
    </Box>
  );
}
