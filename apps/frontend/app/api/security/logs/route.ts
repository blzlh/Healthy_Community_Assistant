/**
 * 安全事件日志 API 路由
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 获取安全日志列表
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const severity = searchParams.get("severity");
  const resolved = searchParams.get("resolved");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const queryParams = new URLSearchParams();
  if (type) queryParams.append("type", type);
  if (severity) queryParams.append("severity", severity);
  if (resolved) queryParams.append("resolved", resolved);
  if (limit) queryParams.append("limit", limit);
  if (offset) queryParams.append("offset", offset);

  try {
    const response = await fetch(
      `${API_BASE}/security/logs?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching security logs:", error);
    return NextResponse.json(
      { success: false, message: "获取安全日志失败" },
      { status: 500 }
    );
  }
}
