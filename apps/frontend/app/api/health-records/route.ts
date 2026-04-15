/**
 * 健康记录 API 路由
 * GET /api/health-records - 获取记录列表
 * POST /api/health-records - 创建新记录
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    if (offset) params.append("offset", offset);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = `/health-records${queryString ? `?${queryString}` : ""}`;

    const response = await serverHttp.get(url, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("获取健康记录失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "获取健康记录失败" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    const response = await serverHttp.post("/health-records", body, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("创建健康记录失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "创建健康记录失败" },
      { status: error.response?.status || 500 }
    );
  }
}
