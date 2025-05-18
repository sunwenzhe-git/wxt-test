/*
 *  Author: swz
 *  Description: Tag Manager (Refactored)
 */

import { useState, useCallback } from "react";
import {
  Box,
  UnstyledButton,
  TextInput,
  ActionIcon,
  Group,
  Tooltip,
} from "@mantine/core";
import { IconSearch, IconTrash, IconPlus } from "@tabler/icons-react";
import useChromeTabs from "./hooks/useChromeTabs";
import GroupsArea from "./components/GroupsArea";
import "./TagManager.css";

// 主组件
export function TagManager() {
  const { handleCloseAllTabs } = useChromeTabs();
  const [searchQuery, setSearchQuery] = useState("");
  // 新建标签
  const handleNewTab = useCallback(() => {
    window.chrome.tabs.create({ active: true });
  }, []);

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
      <GroupsArea searchQuery={searchQuery} />
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
