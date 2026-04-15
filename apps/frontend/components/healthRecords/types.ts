/**
 * 健康记录组件类型定义
 */

export type HealthMetricType = "heartRate" | "bloodPressure" | "bloodSugar" | "weight";

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface HealthRecordFormData {
  bloodPressure: string;
  heartRate: string;
  bloodSugar: string;
  weight: string;
  height: string;
  age: string;
  notes: string;
}

export interface MetricConfig {
  key: HealthMetricType;
  label: string;
  unit: string;
  color: string;
  icon: string;
  minValue?: number;
  maxValue?: number;
}

export const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "heartRate",
    label: "心率",
    unit: "次/分钟",
    color: "#ec4899",
    icon: "lucide:heart-pulse",
    minValue: 40,
    maxValue: 200,
  },
  {
    key: "bloodPressure",
    label: "血压",
    unit: "mmHg",
    color: "#ef4444",
    icon: "healthicons:blood-pressure",
    minValue: 60,
    maxValue: 200,
  },
  {
    key: "bloodSugar",
    label: "空腹血糖",
    unit: "mmol/L",
    color: "#3b82f6",
    icon: "lucide:droplet",
    minValue: 3,
    maxValue: 15,
  },
  {
    key: "weight",
    label: "体重",
    unit: "kg",
    color: "#f59e0b",
    icon: "healthicons:weight",
    minValue: 30,
    maxValue: 150,
  },
];
