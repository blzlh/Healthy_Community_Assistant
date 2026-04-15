/**
 * 健康记录 API 路由
 * POST /api/health-conversations/records - 保存健康记录
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const response = await serverHttp.post("/health-conversations/records", body, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("保存健康记录失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "保存健康记录失败" },
      { status: error.response?.status || 500 }
    );
  }
}
