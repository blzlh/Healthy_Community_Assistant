/**
 * 健康记录内容组件
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { App } from "antd";
import { useHealthRecords } from "@/hooks/use-health-records";
import { useAuthStore } from "@/store/auth-store";
import { HealthRecordForm } from "./HealthRecordForm";
import { HealthChart } from "./HealthChart";
import { HealthRecordList } from "./HealthRecordList";
import type { HealthMetricType, HealthRecordFormData } from "./types";
import type { HealthRecord } from "@/services/health-records";

export function HealthRecordsContent() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const {
    records,
    selectedRecord,
    loading,
    submitting,
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    selectRecord,
  } = useHealthRecords();

  const [selectedMetric, setSelectedMetric] = useState<HealthMetricType>("heartRate");
  const [activeView, setActiveView] = useState<"chart" | "list">("chart");

  // 加载记录
  useEffect(() => {
    if (user) {
      loadRecords({ limit: 50 });
    }
  }, [user, loadRecords]);

  // 提交表单
  const handleSubmit = useCallback(
    async (formData: HealthRecordFormData) => {
      if (selectedRecord) {
        // 更新记录
        const result = await updateRecord(selectedRecord.id, formData);
        if (result.ok) {
          message.success("更新成功");
          selectRecord(null);
        } else {
          message.error(result.message || "更新失败");
        }
      } else {
        // 创建记录
        const result = await createRecord(formData);
        if (result.ok) {
          message.success("保存成功");
        } else {
          message.error(result.message || "保存失败");
        }
      }
    },
    [selectedRecord, createRecord, updateRecord, selectRecord]
  );

  // 编辑记录
  const handleEdit = useCallback(
    (record: HealthRecord) => {
      selectRecord(record);
      // 滚动到表单
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [selectRecord]
  );

  // 删除记录
  const handleDelete = useCallback(
    async (recordId: string) => {
      const result = await deleteRecord(recordId);
      if (result.ok) {
        message.success("删除成功");
      } else {
        message.error(result.message || "删除失败");
      }
    },
    [deleteRecord]
  );

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    selectRecord(null);
  }, [selectRecord]);

  return (
    <div className="p-6">
      {/* 视图切换 */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveView("chart")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === "chart"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <Icon icon="solar:chart-2-bold" className="w-4 h-4" />
            图表
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === "list"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <Icon icon="solar:list-bold" className="w-4 h-4" />
            列表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：表单 */}
        <div className="lg:col-span-1">
          <HealthRecordForm
            onSubmit={handleSubmit}
            editingRecord={selectedRecord}
            onCancelEdit={handleCancelEdit}
            submitting={submitting}
            className="lg:min-h-[600px]"
          />
        </div>

        {/* 右侧：图表或列表 */}
        <div className="lg:col-span-2">
          {activeView === "chart" ? (
            <HealthChart
              records={records}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
              className="lg:min-h-[600px]"
            />
          ) : (
            <HealthRecordList
              records={records}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              className="lg:min-h-[600px]"
            />
          )}
        </div>
      </div>

      {/* 底部提示 */}
      {records.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Icon icon="solar:info-circle-bold" className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">
              开始记录您的健康数据，追踪健康趋势
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
