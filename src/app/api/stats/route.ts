import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const [
      totalIssues,
      pendingCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      totalUsers,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: "Pending" }),
      Issue.countDocuments({ status: "Under Review" }),
      Issue.countDocuments({ status: "In Progress" }),
      Issue.countDocuments({ status: "Resolved" }),
      Issue.countDocuments({ status: "Rejected" }),
      User.countDocuments(),
    ]);

    // Aggregate by category
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity
    const recentIssues = await Issue.find()
      .populate("author", "name department role")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      status: "success",
      stats: {
        total: totalIssues,
        pending: pendingCount,
        underReview: underReviewCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        users: totalUsers,
        resolutionRate:
          totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0,
      },
      categoryBreakdown,
      recentIssues,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load statistics";
    return NextResponse.json({ message }, { status: 500 });
  }
}
