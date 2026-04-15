"use client";

import { create } from "zustand";
import type { HealthRecord, CreateHealthRecordInput } from "@/services/health-records";

type HealthRecordsState = {
  // 记录数据
  records: HealthRecord[];
  // 选中的记录（用于编辑）
  selectedRecord: HealthRecord | null;
  // 加载状态
  loading: boolean;
  submitting: boolean;
  // 错误信息
  error: string | null;
  // 分页
  hasMore: boolean;
  total: number;

  // 记录操作
  setRecords: (records: HealthRecord[]) => void;
  addRecord: (record: HealthRecord) => void;
  updateRecordInList: (id: string, updates: Partial<HealthRecord>) => void;
  removeRecord: (id: string) => void;
  prependRecord: (record: HealthRecord) => void;

  // 选中操作
  setSelectedRecord: (record: HealthRecord | null) => void;

  // 加载状态操作
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;

  // 重置
  reset: () => void;
};

export const useHealthRecordsStore = create<HealthRecordsState>((set) => ({
  // 记录数据
  records: [],
  selectedRecord: null,
  // 加载状态
  loading: false,
  submitting: false,
  // 错误信息
  error: null,
  // 分页
  hasMore: true,
  total: 0,

  // 记录操作
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [...state.records, record] })),
  updateRecordInList: (id, updates) =>
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      ),
    })),
  removeRecord: (id) =>
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    })),
  prependRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),

  // 选中操作
  setSelectedRecord: (record) => set({ selectedRecord: record }),

  // 加载状态操作
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  setTotal: (total) => set({ total }),

  // 重置
  reset: () =>
    set({
      records: [],
      selectedRecord: null,
      loading: false,
      submitting: false,
      error: null,
      hasMore: true,
      total: 0,
    }),
}));
