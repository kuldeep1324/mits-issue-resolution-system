import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Issue from "@/models/Issue";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const comments = await Comment.find({ issueId: id })
      .populate("author", "name email department role avatar")
      .sort({ createdAt: 1 });

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load comments";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { message: "Authentication required to comment" },
        { status: 401 }
      );
    }

    await connectDB();
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    const isStaffOrAdmin = ["admin", "staff", "faculty"].includes(session.role);

    const comment = await Comment.create({
      issueId: id,
      author: session.userId,
      content: content.trim(),
      isOfficialResponse: isStaffOrAdmin,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name email department role avatar"
    );

    return NextResponse.json(
      {
        message: "Comment posted",
        comment: populatedComment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post comment";
    return NextResponse.json({ message }, { status: 500 });
  }
}
