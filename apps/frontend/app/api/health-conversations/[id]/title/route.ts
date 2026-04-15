/**
 * 健康对话标题 API 路由
 * PATCH /api/health-conversations/[id]/title - 更新对话标题
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const response = await serverHttp.patch(
      `/health-conversations/${id}/title`,
      body,
      {
        headers: {
          Authorization: authHeader || "",
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("更新对话标题失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "更新对话标题失败" },
      { status: error.response?.status || 500 }
    );
  }
}
