"use client";

import { create } from "zustand";

export type ChatUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  createdAt: string;
  user: ChatUser;
};

type ChatState = {
  roomId: string;
  connected: boolean;
  onlineCount: number;
  loading: boolean;
  messages: ChatMessage[];
  setRoom: (roomId: string) => void;
  setConnected: (connected: boolean) => void;
  setOnlineCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHistory: (roomId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  roomId: "global",
  connected: false,
  onlineCount: 0,
  loading: false,
  messages: [],
  setRoom: (roomId) => set({ roomId }),
  setConnected: (connected) => set({ connected }),
  setOnlineCount: (count) => set({ onlineCount: count }),
  setLoading: (loading) => set({ loading }),
  setHistory: (roomId, messages) => {
    if (roomId !== get().roomId) return;
    set({ messages, loading: false });
  },
  addMessage: (message) => {
    if (message.roomId !== get().roomId) return;
    set((state) => ({ messages: [...state.messages, message].slice(-100) }));
  },
  clear: () => set({ connected: false, messages: [] }),
}));
