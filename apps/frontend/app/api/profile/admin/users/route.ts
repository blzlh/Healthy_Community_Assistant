import type { AxiosError } from "axios";
import { NextResponse } from "next/server";
import { serverHttp } from "@/lib/http";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  try {
    const response = await serverHttp.get("/admin/users", {
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
