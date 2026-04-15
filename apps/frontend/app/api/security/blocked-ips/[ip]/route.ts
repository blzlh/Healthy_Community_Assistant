/**
 * 单个封禁IP API 路由
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 解封IP
export async function DELETE(
  request: NextRequest,
  { params }: { params: { ip: string } }
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  const ipAddress = decodeURIComponent(params.ip);

  try {
    const response = await fetch(`${API_BASE}/security/block-ip/${encodeURIComponent(ipAddress)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error unblocking IP:", error);
    return NextResponse.json(
      { success: false, message: "解封IP失败" },
      { status: 500 }
    );
  }
}

// 检查IP状态
export async function GET(
  request: NextRequest,
  { params }: { params: { ip: string } }
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
  }

  const ipAddress = decodeURIComponent(params.ip);

  try {
    const response = await fetch(`${API_BASE}/security/check-ip/${encodeURIComponent(ipAddress)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error checking IP status:", error);
    return NextResponse.json(
      { success: false, message: "检查IP状态失败" },
      { status: 500 }
    );
  }
}
