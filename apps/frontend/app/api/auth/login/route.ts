import type { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { serverHttp } from '@/lib/http';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const response = await serverHttp.post('/auth/login', body);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 500;
    const message = axiosError.response?.data?.message ?? axiosError.message ?? 'Request failed';
    return NextResponse.json({ message }, { status });
  }
}
