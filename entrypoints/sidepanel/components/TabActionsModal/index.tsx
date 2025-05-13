import { Modal, Button, Stack } from "@mantine/core";
import { Tab } from "../../utils/type";

export default function TabActionsModal({
  tab,
  opened,
  onClose,
}: {
  tab: Tab | null;
  opened: boolean;
  onClose: () => void;
}) {
  if (!tab) return null;

  const handleNewTabBelow = () => {
    chrome.tabs.create({ index: tab.index + 1 });
    onClose();
  };
  const handleMoveToWindow = () => {
    chrome.windows.create({ tabId: parseInt(tab.id) });
    onClose();
  };
  const handleReload = () => {
    chrome.tabs.reload(parseInt(tab.id));
    onClose();
  };
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(tab.url);
    onClose();
  };
  const handleMute = () => {
    chrome.tabs.update(parseInt(tab.id), { muted: true });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={tab.title} centered>
      <Stack>
        <Button onClick={handleNewTabBelow}>在其下新建标签页</Button>
        <Button onClick={handleMoveToWindow}>移动到新窗口</Button>
        <Button onClick={handleReload}>重新加载</Button>
        <Button onClick={handleCopyUrl}>复制网址</Button>
        <Button onClick={handleMute}>静音站点</Button>
      </Stack>
    </Modal>
  );
}
