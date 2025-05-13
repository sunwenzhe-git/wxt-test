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
}
