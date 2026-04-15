/**
 * 安全统计 API 路由
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE}/security/statistics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching security statistics:", error);
    return NextResponse.json(
      { success: false, message: "获取安全统计失败" },
      { status: 500 }
    );
  }
}
