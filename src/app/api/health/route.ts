import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    return NextResponse.json({
      status: "success",
      message: "MITS Campus Issue Resolution Fullstack API is running smoothly.",
      database: {
        status: states[dbState] || "unknown",
        connected: dbState === 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database connection error";
    return NextResponse.json(
      {
        status: "error",
        message,
        database: { connected: false },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
