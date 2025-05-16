/*
 *  Author: swz
 *  Description:
 */
export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  index: number;
  domain?: string;
  lastAccessed: number;
  muted: boolean; // 获取静音状态
  groupId?: number; // 标签分组ID
}
