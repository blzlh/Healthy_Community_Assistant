/**
 * 健康记录表单组件
 */

"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button, App } from "antd";
import { cn } from "@/lib/utils";
import type { HealthRecordFormData } from "./types";
import type { HealthRecord } from "@/services/health-records";

interface HealthRecordFormProps {
  onSubmit: (data: HealthRecordFormData) => Promise<void>;
  editingRecord?: HealthRecord | null;
  onCancelEdit?: () => void;
  submitting?: boolean;
  className?: string;
}

const FORM_FIELDS = [
  {
    name: "bloodPressure",
    label: "血压",
    placeholder: "如: 120/80",
    unit: "mmHg",
    icon: "solar:heart-pulse-bold",
    gradient: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-400",
  },
  {
    name: "heartRate",
    label: "心率",
    placeholder: "如: 72",
    unit: "次/分钟",
    icon: "solar:heart-bold",
    gradient: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
  },
  {
    name: "bloodSugar",
    label: "血糖",
    placeholder: "如: 5.5",
    unit: "mmol/L",
    icon: "solar:dropper-bold",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    name: "weight",
    label: "体重",
    placeholder: "如: 70",
    unit: "kg",
    icon: "solar:scale-bold",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-400",
  },
  {
    name: "height",
    label: "身高",
    placeholder: "如: 175",
    unit: "cm",
    icon: "solar:ruler-bold",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    name: "age",
    label: "年龄",
    placeholder: "如: 30",
    unit: "岁",
    icon: "solar:calendar-bold",
    gradient: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
] as const;

const initialFormData: HealthRecordFormData = {
  bloodPressure: "",
  heartRate: "",
  bloodSugar: "",
  weight: "",
  height: "",
  age: "",
  notes: "",
};

export function HealthRecordForm({
  onSubmit,
  editingRecord,
  onCancelEdit,
  submitting = false,
  className,
}: HealthRecordFormProps) {
  const { message } = App.useApp();
  const [formData, setFormData] = useState<HealthRecordFormData>(initialFormData);

  // 当 editingRecord 变化时更新表单数据
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        bloodPressure: editingRecord.bloodPressure || "",
        heartRate: editingRecord.heartRate || "",
        bloodSugar: editingRecord.bloodSugar || "",
        weight: editingRecord.weight || "",
        height: editingRecord.height || "",
        age: editingRecord.age || "",
        notes: editingRecord.notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingRecord]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证至少填写一项
    const hasData = Object.entries(formData).some(([key, value]) => {
      if (key === "notes") return false;
      return value.trim() !== "";
    });

    if (!hasData) {
      message.warning("请至少填写一项健康数据");
      return;
    }

    await onSubmit(formData);
    setFormData(initialFormData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    onCancelEdit?.();
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 flex items-center justify-center">
            <Icon icon={editingRecord ? "solar:pen-bold" : "solar:add-circle-bold"} className="w-4 h-4 text-sky-400" />
          </div>
          <span className="font-medium text-white">
            {editingRecord ? "编辑记录" : "新增记录"}
          </span>
        </div>
        <span className="text-xs text-white/40">至少填写一项</span>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FORM_FIELDS.map((field) => (
            <div
              key={field.name}
              className={cn(
                "rounded-lg border border-white/10 p-3 transition-all hover:border-white/20",
                `bg-gradient-to-br ${field.gradient}`
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon icon={field.icon} className={cn("w-4 h-4", field.iconColor)} />
                <label className="text-sm text-white/70">{field.label}</label>
                <span className="text-xs text-white/40 ml-auto">{field.unit}</span>
              </div>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="w-full border-b border-white/10 bg-transparent py-1.5 text-white placeholder:text-white/30 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        {/* 备注 */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:document-text-bold" className="w-4 h-4 text-white/50" />
            <label className="text-sm text-white/70">备注</label>
          </div>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="添加备注信息..."
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-sky-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 pt-4 mt-auto">
          <Button
            type="primary"
            htmlType="submit"
            disabled={submitting}
            loading={submitting}
            className="flex-1 h-11 !bg-white !text-black hover:!bg-white/90 disabled:!opacity-50 !rounded-lg !font-medium"
          >
            {editingRecord ? "更新记录" : "保存记录"}
          </Button>
          <Button
            type="default"
            onClick={handleReset}
            className="h-11 px-4 !bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20 !rounded-lg"
          >
            {editingRecord ? "取消" : "清空"}
          </Button>
        </div>
      </form>
    </div>
  );
}
