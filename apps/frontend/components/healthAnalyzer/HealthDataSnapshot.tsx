/**
 * 健康数据快照组件（支持编辑和发送新数据）
 */

"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import { HealthFormData, HealthFieldConfig } from "./types";
import { cn } from "@/lib/utils";

/**
 * 健康指标字段配置 - 使用 Solar 图标
 */
const HEALTH_FIELDS: HealthFieldConfig[] = [
	{
		name: "bloodPressure",
		label: "血压",
		placeholder: "如: 120/80",
		unit: "mmHg",
		icon: "solar:heart-pulse-bold",
		iconColor: "text-red-400",
	},
	{
		name: "heartRate",
		label: "心率",
		placeholder: "如: 72",
		unit: "次/分钟",
		icon: "solar:heart-bold",
		iconColor: "text-pink-400",
	},
	{
		name: "bloodSugar",
		label: "空腹血糖",
		placeholder: "如: 5.5",
		unit: "mmol/L",
		icon: "solar:dropper-bold",
		iconColor: "text-blue-400",
	},
	{
		name: "weight",
		label: "体重",
		placeholder: "如: 70",
		unit: "kg",
		icon: "solar:scale-bold",
		iconColor: "text-amber-400",
	},
	{
		name: "height",
		label: "身高",
		placeholder: "如: 175",
		unit: "cm",
		icon: "solar:ruler-bold",
		iconColor: "text-emerald-400",
	},
	{
		name: "age",
		label: "年龄",
		placeholder: "如: 30",
		unit: "岁",
		icon: "solar:calendar-bold",
		iconColor: "text-purple-400",
	},
];

interface HealthDataSnapshotProps {
	data: HealthFormData;
	/** 是否处于编辑模式 */
	editable?: boolean;
	/** 数据更新回调 */
	onDataUpdate?: (data: HealthFormData) => void;
	/** 提交新数据回调 */
	onSubmit?: (data: HealthFormData) => void;
	/** 是否正在加载 */
	loading?: boolean;
}

export function HealthDataSnapshot({
	data,
	editable = false,
	onDataUpdate,
	onSubmit,
	loading = false,
}: HealthDataSnapshotProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState<HealthFormData>(data);

	const filledFields = HEALTH_FIELDS.filter(f => data[f.name]);

	// 如果没有数据且不可编辑，不显示
	if (filledFields.length === 0 && !editable) return null;

	// 处理输入变化
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditData(prev => ({ ...prev, [name]: value }));
	}, []);

	// 开始编辑
	const handleStartEdit = useCallback(() => {
		setEditData(data);
		setIsEditing(true);
	}, [data]);

	// 取消编辑
	const handleCancelEdit = useCallback(() => {
		setEditData(data);
		setIsEditing(false);
	}, [data]);

	// 提交编辑
	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		if (onDataUpdate) {
			onDataUpdate(editData);
		}
		if (onSubmit) {
			onSubmit(editData);
		}
		setIsEditing(false);
	}, [editData, onDataUpdate, onSubmit]);

	// 编辑模式
	if (isEditing) {
		return (
			<form onSubmit={handleSubmit} className="mb-3 pb-3 border-b border-white/10">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-1.5">
						<Icon icon="solar:document-text-bold" className="w-3.5 h-3.5 text-white/50" />
						<span className="text-xs text-white/50">编辑健康数据</span>
					</div>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							size="xs"
							onClick={handleCancelEdit}
							className="!text-white/40 hover:!text-white/60 !bg-transparent"
						>
							取消
						</Button>
						<Button
							type="submit"
							size="xs"
							disabled={loading}
							className="!bg-white !text-black hover:!bg-white/90 !rounded-lg"
						>
							{loading ? "提交中..." : "提交分析"}
						</Button>
					</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
					{HEALTH_FIELDS.map((field) => (
						<div key={field.name} className="flex items-center gap-1.5">
							<Icon icon={field.icon} className={cn("w-3 h-3 shrink-0", field.iconColor)} />
							<input
								type="text"
								name={field.name}
								value={editData[field.name]}
								onChange={handleInputChange}
								placeholder={field.placeholder}
								className="flex-1 min-w-0 rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-sky-500/50 focus:outline-none"
							/>
						</div>
					))}
				</div>
			</form>
		);
	}

	// 显示模式
	return (
		<div className="mb-3 pb-3 border-b border-white/10">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-1.5">
					<Icon icon="solar:document-text-bold" className="w-3.5 h-3.5 text-white/50" />
					<span className="text-xs text-white/50">本次分析数据</span>
				</div>
				{editable && (
					<Button
						type="button"
						size="xs"
						onClick={handleStartEdit}
						className="!text-sky-400 hover:!text-sky-300 !bg-transparent"
					>
						<Icon icon="solar:pen-bold" className="w-3 h-3 mr-1" />
						修改
					</Button>
				)}
			</div>
			<div className="flex flex-wrap gap-2">
				{filledFields.map((field) => (
					<div
						key={field.name}
						className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-br from-white/5 to-transparent border border-white/10"
					>
						<Icon icon={field.icon} className={cn("w-3.5 h-3.5", field.iconColor)} />
						<span className="text-xs text-white/60">{field.label}:</span>
						<span className="text-xs text-white/80 font-medium">{data[field.name]}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export { HEALTH_FIELDS };
