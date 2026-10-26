import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const authorOnly = searchParams.get("authorOnly");
    const sortBy = searchParams.get("sortBy") || "newest"; // 'newest' | 'votes' | 'priority'

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (authorOnly === "true") {
      const session = await getAuthSession(req);
      if (!session) {
        return NextResponse.json(
          { message: "Authentication required to filter own issues" },
          { status: 401 }
        );
      }
      filter.author = session.userId;
    }

    let query = Issue.find(filter).populate("author", "name email department role");

    if (sortBy === "votes") {
      // sort by upvotes array length (using aggregation or virtual count in memory / indexing)
      query = query.sort({ "upvotes.length": -1, createdAt: -1 });
    } else if (sortBy === "priority") {
      query = query.sort({ priority: 1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const issues = await query.exec();

    return NextResponse.json({
      status: "success",
      count: issues.length,
      issues,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch issues";
    console.error("GET Issues Error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { message: "Authentication required to submit an issue" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { title, description, category, priority, location, assignedDepartment } = body;

    if (!title || !description || !location) {
      return NextResponse.json(
        { message: "Title, description, and campus location are required" },
        { status: 400 }
      );
    }

    const newIssue = await Issue.create({
      title,
      description,
      category: category || "Other",
      priority: priority || "Medium",
      location,
      assignedDepartment: assignedDepartment || category || "General Maintenance",
      author: session.userId,
      status: "Pending",
      upvotes: [],
    });

    const populatedIssue = await Issue.findById(newIssue._id).populate(
      "author",
      "name email department role"
    );

    return NextResponse.json(
      {
        message: "Issue submitted successfully",
        issue: populatedIssue,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create issue";
    console.error("POST Issue Error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
