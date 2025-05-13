import { Box, ActionIcon, Group, Text, Paper } from "@mantine/core";
import { IconX, IconDragDrop } from "@tabler/icons-react";
import { Tab } from "../../utils/type";
export default function TabItem({
  tab,
  activeTabId,
  onTabClick,
  onTabClose,
  setActionsTab,
  onContextMenu,
}: {
  tab: Tab;
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string, e: React.MouseEvent) => void;
  setActionsTab: (tab: Tab) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  return (
    <Paper
      p="xs"
      className={`tab-item${activeTabId === tab.id ? " selected" : ""}`}
      onClick={() => onTabClick(tab.id)}
      onContextMenu={onContextMenu}
    >
      <Group gap="xs" wrap="nowrap">
        <Box style={{ opacity: 0.5 }}>
          <IconDragDrop size={14} />
        </Box>
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
          onClick={(e) => onTabClose(tab.id, e)}
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
