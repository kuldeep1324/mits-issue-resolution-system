import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    await connectDB();

    // Check if admin already exists
    let admin = await User.findOne({ email: "admin@mits.edu" });
    if (!admin) {
      const adminPass = await hashPassword("admin123");
      admin = await User.create({
        name: "Campus Chief Administrator",
        email: "admin@mits.edu",
        password: adminPass,
        role: "admin",
        department: "Dean Office / Campus Services",
        enrollmentNo: "ADMIN-01",
      });
    }

    // Check if student exists
    let student = await User.findOne({ email: "student@mits.edu" });
    if (!student) {
      const studentPass = await hashPassword("student123");
      student = await User.create({
        name: "Rahul Sharma",
        email: "student@mits.edu",
        password: studentPass,
        role: "student",
        department: "Computer Science & Engineering",
        enrollmentNo: "0901CS221045",
      });
    }

    // Check if staff exists
    let staff = await User.findOne({ email: "maintenance@mits.edu" });
    if (!staff) {
      const staffPass = await hashPassword("staff123");
      staff = await User.create({
        name: "MITS Estate & Works Officer",
        email: "maintenance@mits.edu",
        password: staffPass,
        role: "staff",
        department: "Maintenance & Infrastructure",
        enrollmentNo: "STAFF-99",
      });
    }

    // If issues are empty, seed sample campus issues
    const issueCount = await Issue.countDocuments();
    if (issueCount === 0) {
      const sampleIssues = [
        {
          title: "High-speed Wi-Fi disconnection in CSE Lab 3",
          description:
            "The router access point AP-04 frequently drops connection during practical sessions. Students are unable to access GitHub and cloud environments.",
          category: "Wi-Fi & IT",
          priority: "High",
          status: "In Progress",
          location: "Department of CSE, Ground Floor, Lab 3",
          author: student._id,
          assignedDepartment: "Wi-Fi & IT Cell",
          upvotes: [student._id, admin._id],
          resolutionNotes: "Network engineer dispatched. Re-terminating Cat-6 cable to switch 2.",
        },
        {
          title: "Water filter leakage on 2nd Floor Boys Hostel 2",
          description:
            "Continuous dripping near water cooler causing puddle and slipping hazard on the hallway floor.",
          category: "Sanitation",
          priority: "Urgent",
          status: "Pending",
          location: "Hostel Block B, 2nd Floor Corridor",
          author: student._id,
          assignedDepartment: "Sanitation & Plumbing",
          upvotes: [student._id],
        },
        {
          title: "AC cooling issue in Central Library Reading Hall",
          description:
            "Air conditioning unit #2 in the quiet study zone is blowing warm air since yesterday afternoon.",
          category: "Library",
          priority: "Medium",
          status: "Under Review",
          location: "Central Library, 1st Floor East Wing",
          author: student._id,
          assignedDepartment: "Maintenance & Infrastructure",
          upvotes: [],
        },
        {
          title: "Streetlight flickering outside Canteen pathway",
          description:
            "The solar street light flickers continuously making it dark during evening hours between 8 PM and 10 PM.",
          category: "Maintenance",
          priority: "Low",
          status: "Resolved",
          location: "Main Pathway connecting Student Activity Center and Mess",
          author: student._id,
          assignedDepartment: "Electrical Maintenance",
          resolvedAt: new Date(),
          resolutionNotes: "Replaced faulty LED driver and photocell sensor. Working properly.",
          upvotes: [student._id],
        },
      ];

      const createdIssues = await Issue.insertMany(sampleIssues);

      // Add a sample comment
      await Comment.create({
        issueId: createdIssues[0]._id,
        author: staff._id,
        content: "Campus IT has acknowledged this. We are replacing the switch port today by 4 PM.",
        isOfficialResponse: true,
      });
    }

    return NextResponse.json({
      message: "Database seeded successfully with demo users and realistic campus issues.",
      credentials: {
        admin: { email: "admin@mits.edu", password: "admin123", role: "admin" },
        student: { email: "student@mits.edu", password: "student123", role: "student" },
        staff: { email: "maintenance@mits.edu", password: "staff123", role: "staff" },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed database";
    console.error("Seed Error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
