import { create } from "zustand";

type AppState = {
  lastFileId: string | null;
  setLastFileId: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  lastFileId: null,
  setLastFileId: (id) => set({ lastFileId: id }),
}));
