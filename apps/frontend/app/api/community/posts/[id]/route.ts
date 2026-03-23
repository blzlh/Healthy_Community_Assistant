import type { AxiosError } from "axios";
import { NextResponse } from "next/server";

import { serverHttp } from "@/lib/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization") ?? "";
  const body = await request.json().catch(() => ({}));
  try {
    const response = await serverHttp.post(`/community/posts/${id}`, body, {
      headers: authHeader ? { authorization: authHeader } : {},
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 500;
    const message = axiosError.response?.data?.message ?? axiosError.message ?? "Request failed";
    return NextResponse.json({ message }, { status });
  }
}
