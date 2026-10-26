import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const issue = await Issue.findById(id).populate(
      "author",
      "name email department role enrollmentNo avatar"
    );

    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const comments = await Comment.find({ issueId: id })
      .populate("author", "name email department role avatar")
      .sort({ createdAt: 1 });

    return NextResponse.json({
      issue,
      comments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch issue details";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const isStaffOrAdmin = ["admin", "staff", "faculty"].includes(session.role);
    const isOwner = issue.author.toString() === session.userId;

    if (!isStaffOrAdmin && !isOwner) {
      return NextResponse.json(
        { message: "You do not have permission to modify this issue" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, priority, resolutionNotes, assignedDepartment } = body;

    if (isStaffOrAdmin) {
      if (status) {
        issue.status = status;
        if (status === "Resolved") {
          issue.resolvedAt = new Date();
        } else {
          issue.resolvedAt = undefined;
        }
      }
      if (priority) issue.priority = priority;
      if (resolutionNotes !== undefined) issue.resolutionNotes = resolutionNotes;
      if (assignedDepartment) issue.assignedDepartment = assignedDepartment;
    } else if (isOwner) {
      // Owner can update details or close/withdraw
      if (body.title) issue.title = body.title;
      if (body.description) issue.description = body.description;
      if (body.location) issue.location = body.location;
    }

    await issue.save();

    const updatedIssue = await Issue.findById(id).populate(
      "author",
      "name email department role"
    );

    return NextResponse.json({
      message: "Issue updated successfully",
      issue: updatedIssue,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update issue";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const isAdmin = session.role === "admin";
    const isOwner = issue.author.toString() === session.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: "You do not have permission to delete this issue" },
        { status: 403 }
      );
    }

    await Issue.findByIdAndDelete(id);
    await Comment.deleteMany({ issueId: id });

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete issue";
    return NextResponse.json({ message }, { status: 500 });
  }
}
