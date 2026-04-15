/**
 * 健康分析 - 输入表单组件
 */

import React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

interface FormData {
  bloodPressure: string;
  heartRate: string;
  bloodSugar: string;
  weight: string;
  height: string;
  age: string;
}

interface HealthInputFormProps {
  formData: FormData;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputFields = [
  {
    name: "bloodPressure",
    label: "血压",
    placeholder: "如: 120/80",
    unit: "mmHg",
    icon: "healthicons:blood-pressure",
    iconColor: "text-red-400",
  },
  {
    name: "heartRate",
    label: "心率",
    placeholder: "如: 72",
    unit: "次/分钟",
    icon: "lucide:heart-pulse",
    iconColor: "text-pink-400",
  },
  {
    name: "bloodSugar",
    label: "空腹血糖",
    placeholder: "如: 5.5",
    unit: "mmol/L",
    icon: "lucide:droplet",
    iconColor: "text-blue-400",
  },
  {
    name: "weight",
    label: "体重",
    placeholder: "如: 70",
    unit: "kg",
    icon: "healthicons:weight",
    iconColor: "text-amber-400",
  },
  {
    name: "height",
    label: "身高",
    placeholder: "如: 175",
    unit: "cm",
    icon: "healthicons:body",
    iconColor: "text-emerald-400",
  },
  {
    name: "age",
    label: "年龄",
    placeholder: "如: 30",
    unit: "岁",
    icon: "healthicons:calendar",
    iconColor: "text-purple-400",
  },
];

export function HealthInputForm({ formData, loading, onInputChange, onSubmit }: HealthInputFormProps) {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <CardTitle className="justify-start gap-2">
          <Icon icon="healthicons:clipboard-text" className="h-5 w-5 text-sky-400" />
          数据录入
        </CardTitle>
        <CardDescription className="text-white/60">
          请输入您的健康指标数据（至少填写一项）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inputFields.map((field) => (
              <div
                key={field.name}
                className="group relative rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon icon={field.icon} className={`h-5 w-5 ${field.iconColor}`} />
                  <label className="text-sm font-medium text-white/80">
                    {field.label}
                  </label>
                  <span className="text-xs text-white/40">({field.unit})</span>
                </div>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name as keyof FormData]}
                  onChange={onInputChange}
                  placeholder={field.placeholder}
                  className="w-full border-b border-white/20 bg-transparent py-2 text-lg text-white placeholder:text-white/30 focus:border-sky-400 focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 !bg-zinc-800 !text-white hover:!bg-zinc-700 disabled:!opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Icon icon="healthicons:analysis" className="h-5 w-5 mr-2" />
            {loading ? "分析中..." : "开始 AI 分析"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
