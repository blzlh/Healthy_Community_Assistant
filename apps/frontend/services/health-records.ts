/**
 * 健康记录服务 - 处理健康记录相关的 API 调用
 */

import { http } from "@/lib/http";

export interface HealthRecord {
  id: string;
  userId: string;
  conversationId: string | null;
  bloodPressure: string | null;
  heartRate: string | null;
  bloodSugar: string | null;
  weight: string | null;
  height: string | null;
  age: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateHealthRecordInput {
  bloodPressure?: string;
  heartRate?: string;
  bloodSugar?: string;
  weight?: string;
  height?: string;
  age?: string;
  notes?: string;
}

export interface GetHealthRecordsParams {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 获取用户的健康记录列表
 */
export async function getHealthRecords(
  token: string,
  params?: GetHealthRecordsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  const url = `/api/health-records${queryString ? `?${queryString}` : ""}`;

  const response = await http.get<{ success: boolean; data: HealthRecord[] }>(
    url,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 创建健康记录
 */
export async function createHealthRecord(
  token: string,
  data: CreateHealthRecordInput
) {
  const response = await http.post<{ success: boolean; data: { recordId: string } }>(
    "/api/health-records",
    data,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 更新健康记录
 */
export async function updateHealthRecord(
  token: string,
  recordId: string,
  data: Partial<CreateHealthRecordInput>
) {
  const response = await http.patch<{ success: boolean; message: string }>(
    `/api/health-records/${recordId}`,
    data,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

/**
 * 删除健康记录
 */
export async function deleteHealthRecord(token: string, recordId: string) {
  const response = await http.delete<{ success: boolean; message: string }>(
    `/api/health-records/${recordId}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
