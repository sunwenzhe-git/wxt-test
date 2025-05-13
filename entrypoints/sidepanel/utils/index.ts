/*
 *  Author: swz
 *  Description:
 */
// 提取域名的辅助函数
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
};
