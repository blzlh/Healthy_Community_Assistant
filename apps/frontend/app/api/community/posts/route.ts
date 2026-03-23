import type { AxiosError } from "axios";
import { NextResponse } from "next/server";

import { serverHttp } from "@/lib/http";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  try {
    const response = await serverHttp.get("/community/posts", {
      params: scope ? { scope } : {},
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

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const body = await request.json().catch(() => ({}));
  try {
    const response = await serverHttp.post("/community/posts", body, {
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
