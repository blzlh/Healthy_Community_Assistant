/**
 * 健康对话详情 API 路由
 * GET /api/health-conversations/[id] - 获取对话详情
 * DELETE /api/health-conversations/[id] - 删除对话
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const response = await serverHttp.get(`/health-conversations/${id}`, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("获取对话详情失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取对话详情失败" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const response = await serverHttp.delete(`/health-conversations/${id}`, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("删除对话失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "删除对话失败" },
      { status: error.response?.status || 500 }
    );
  }
}
