import { forwardRef } from "react";
import { Box, ActionIcon, Group, Text, Paper } from "@mantine/core";
import { IconX, IconDragDrop } from "@tabler/icons-react";
import { Tab } from "../../utils/type";
interface TabItemProps {
  tab: Tab;
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string, e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}
const TabItem = forwardRef((props: TabItemProps, ref: any) => {
  const { tab, activeTabId, onTabClick, onTabClose, onContextMenu } = props;
  return (
    <Paper
      ref={ref}
      p="xs"
      className={`tab-item${activeTabId === tab.id ? " selected" : ""}`}
      onClick={() => onTabClick(tab.id)}
      onContextMenu={onContextMenu}
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
});
export default TabItem;
