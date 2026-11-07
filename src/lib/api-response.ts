import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });

export const fail = (error: string, status: number, details?: unknown) =>
  NextResponse.json<ApiResponse<never>>(
    { success: false, error, details },
    { status }
  );
