import { create } from "zustand";
import { useSelector } from "./useSelector";
interface InitialState {
  tabGroups: chrome.tabGroups.TabGroup[];
  openTabId: number | null;
  openGroupId: number | null;
  selectedColorMap: Record<string, chrome.tabGroups.Color>;
}
interface IState extends InitialState {
  setSelectedColorMap: (tabId: number, color: chrome.tabGroups.Color) => void;
  setStore: (updates: Partial<InitialState>) => void;
  setTabGroups: (groups: chrome.tabGroups.TabGroup[]) => void;
}
const initialState: InitialState = {
  tabGroups: [],
  // Popover 打开状态
  openTabId: null,
  openGroupId: null,
  selectedColorMap: {},
};

const useStore = create<IState>((set, get) => ({
  ...initialState,
  setSelectedColorMap: (tabId, color) => {
    const { selectedColorMap } = get();
    set({
      selectedColorMap: { ...selectedColorMap, [tabId]: color },
    });
  },
  setTabGroups: (groups) => set({ tabGroups: groups }),
  setStore: (updates) => set(updates),
}));

export { useStore, useSelector };
