/*
 *  Author: swz
 *  Description:
 */
export interface Tab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favicon?: string;
  index: number;
  domain?: string;
  lastAccessed: number;
  muted: boolean; // 获取静音状态
  groupId?: number; // 标签分组ID
}

export interface TabGroup extends chrome.tabGroups.TabGroup {}
