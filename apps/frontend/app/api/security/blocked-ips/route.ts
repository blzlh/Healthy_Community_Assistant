/**
 * 封禁IP管理 API 路由
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 获取封禁IP列表
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  const queryParams = limit ? `?limit=${limit}` : "";

  try {
    const response = await fetch(`${API_BASE}/security/blocked-ips${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching blocked IPs:", error);
    return NextResponse.json(
      { success: false, message: "获取封禁IP列表失败" },
      { status: 500 }
    );
  }
}

// 封禁IP
export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE}/security/block-ip`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error blocking IP:", error);
    return NextResponse.json(
      { success: false, message: "封禁IP失败" },
      { status: 500 }
    );
  }
}
