/**
 * 健康对话 API 路由
 * GET /api/health-conversations - 获取对话列表
 * POST /api/health-conversations - 创建新对话
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("[API] GET /health-conversations, authHeader:", authHeader ? "存在" : "不存在");
    
    const response = await serverHttp.get("/health-conversations", {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("获取对话列表失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "获取对话列表失败" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    console.log("[API] POST /health-conversations, authHeader:", authHeader ? "存在" : "不存在");
    console.log("[API] POST /health-conversations, body:", body);
    
    const response = await serverHttp.post("/health-conversations", body, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("创建对话失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "创建对话失败" },
      { status: error.response?.status || 500 }
    );
  }
}
