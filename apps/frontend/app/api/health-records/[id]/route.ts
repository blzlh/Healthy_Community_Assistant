/**
 * 健康记录单条 API 路由
 * GET /api/health-records/:id - 获取单条记录
 * PATCH /api/health-records/:id - 更新记录
 * DELETE /api/health-records/:id - 删除记录
 */

import { NextRequest, NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { id } = await params;

    const response = await serverHttp.get(`/health-records/${id}`, {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const { id } = await params;

    const response = await serverHttp.patch(`/health-records/${id}`, body, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("更新健康记录失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "更新健康记录失败" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { id } = await params;

    const response = await serverHttp.delete(`/health-records/${id}`, {
      headers: {
        Authorization: authHeader || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("删除健康记录失败:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.response?.data?.message || error.message || "删除健康记录失败" },
      { status: error.response?.status || 500 }
    );
  }
}
