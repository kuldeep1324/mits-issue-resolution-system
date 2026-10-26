import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getAuthSession } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { message: "Authentication required to upvote" },
        { status: 401 }
      );
    }

    await connectDB();
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const userIdObj = new mongoose.Types.ObjectId(session.userId);
    const existingIndex = issue.upvotes.findIndex(
      (v) => v.toString() === session.userId
    );

    let hasUpvoted = false;
    if (existingIndex > -1) {
      // Remove upvote
      issue.upvotes.splice(existingIndex, 1);
      hasUpvoted = false;
    } else {
      // Add upvote
      issue.upvotes.push(userIdObj);
      hasUpvoted = true;
    }

    await issue.save();

    return NextResponse.json({
      message: hasUpvoted ? "Upvoted issue" : "Removed upvote",
      hasUpvoted,
      votesCount: issue.upvotes.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to vote";
    return NextResponse.json({ message }, { status: 500 });
  }
}
