/**
 * 安全事件解决 API 路由
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  const logId = params.id;

  try {
    const response = await fetch(`${API_BASE}/security/logs/${logId}/resolve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error resolving security event:", error);
    return NextResponse.json(
      { success: false, message: "解决事件失败" },
      { status: 500 }
    );
  }
}
