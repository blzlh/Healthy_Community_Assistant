/**
 * 健康记录管理 Hook
 * 负责健康记录的增删改查业务逻辑
 */

"use client";

import { useCallback } from "react";
import {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  type HealthRecord,
  type CreateHealthRecordInput,
  type GetHealthRecordsParams,
} from "@/services/health-records";
import { useAuthStore } from "@/store/auth-store";
import { useHealthRecordsStore } from "@/store/health-records-store";

type RecordsResult = {
  ok: boolean;
  message?: string;
};

/**
 * 健康记录管理 Hook
 */
export function useHealthRecords() {
  const token = useAuthStore((state) => state.token);

  // Store 状态
  const records = useHealthRecordsStore((state) => state.records);
  const selectedRecord = useHealthRecordsStore((state) => state.selectedRecord);
  const loading = useHealthRecordsStore((state) => state.loading);
  const submitting = useHealthRecordsStore((state) => state.submitting);
  const error = useHealthRecordsStore((state) => state.error);
  const hasMore = useHealthRecordsStore((state) => state.hasMore);
  const total = useHealthRecordsStore((state) => state.total);

  // Store 操作
  const setRecords = useHealthRecordsStore((state) => state.setRecords);
  const addRecord = useHealthRecordsStore((state) => state.addRecord);
  const updateRecordInList = useHealthRecordsStore((state) => state.updateRecordInList);
  const removeRecord = useHealthRecordsStore((state) => state.removeRecord);
  const prependRecord = useHealthRecordsStore((state) => state.prependRecord);
  const setSelectedRecord = useHealthRecordsStore((state) => state.setSelectedRecord);
  const setLoading = useHealthRecordsStore((state) => state.setLoading);
  const setSubmitting = useHealthRecordsStore((state) => state.setSubmitting);
  const setError = useHealthRecordsStore((state) => state.setError);
  const setHasMore = useHealthRecordsStore((state) => state.setHasMore);
  const setTotal = useHealthRecordsStore((state) => state.setTotal);
  const resetStore = useHealthRecordsStore((state) => state.reset);

  /**
   * 加载健康记录列表
   */
  const loadRecords = useCallback(
    async (params?: GetHealthRecordsParams): Promise<RecordsResult & { data?: HealthRecord[] }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getHealthRecords(token, params);
        if (response.success && response.data) {
          setRecords(response.data);
          setHasMore(response.data.length === (params?.limit || 20));
          setTotal(response.data.length);
          return { ok: true, data: response.data };
        }
        return { ok: false, message: "加载记录失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "加载记录失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [token, setRecords, setLoading, setError, setHasMore, setTotal]
  );

  /**
   * 创建健康记录
   */
  const createRecord = useCallback(
    async (data: CreateHealthRecordInput): Promise<RecordsResult & { recordId?: string }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setSubmitting(true);
      setError(null);
      try {
        const response = await createHealthRecord(token, data);
        if (response.success && response.data) {
          // 创建成功后，将新记录添加到列表头部
          const newRecord: HealthRecord = {
            id: response.data.recordId,
            userId: "", // 后端会填充
            conversationId: null,
            ...data,
            createdAt: new Date().toISOString(),
          } as HealthRecord;
          prependRecord(newRecord);
          return { ok: true, recordId: response.data.recordId };
        }
        return { ok: false, message: "创建记录失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "创建记录失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [token, prependRecord, setSubmitting, setError]
  );

  /**
   * 更新健康记录
   */
  const updateRecord = useCallback(
    async (recordId: string, data: Partial<CreateHealthRecordInput>): Promise<RecordsResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setSubmitting(true);
      setError(null);
      try {
        const response = await updateHealthRecord(token, recordId, data);
        if (response.success) {
          updateRecordInList(recordId, data);
          return { ok: true };
        }
        return { ok: false, message: response.message || "更新记录失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "更新记录失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [token, updateRecordInList, setSubmitting, setError]
  );

  /**
   * 删除健康记录
   */
  const deleteRecord = useCallback(
    async (recordId: string): Promise<RecordsResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setSubmitting(true);
      setError(null);
      try {
        const response = await deleteHealthRecord(token, recordId);
        if (response.success) {
          removeRecord(recordId);
          return { ok: true };
        }
        return { ok: false, message: response.message || "删除记录失败" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "删除记录失败";
        setError(message);
        return { ok: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [token, removeRecord, setSubmitting, setError]
  );

  /**
   * 选择记录进行编辑
   */
  const selectRecord = useCallback(
    (record: HealthRecord | null) => {
      setSelectedRecord(record);
    },
    [setSelectedRecord]
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    resetStore();
  }, [resetStore]);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // 状态
    records,
    selectedRecord,
    loading,
    submitting,
    error,
    hasMore,
    total,
    // 方法
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    selectRecord,
    reset,
    clearError,
  };
}
