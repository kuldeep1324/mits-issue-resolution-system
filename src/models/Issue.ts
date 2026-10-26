import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type IssueCategory =
  | "Academic"
  | "Hostel"
  | "Maintenance"
  | "Wi-Fi & IT"
  | "Sanitation"
  | "Mess / Canteen"
  | "Library"
  | "Other";

export type IssuePriority = "Low" | "Medium" | "High" | "Urgent";
export type IssueStatus = "Pending" | "Under Review" | "In Progress" | "Resolved" | "Rejected";

export interface IIssue extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  author: Types.ObjectId;
  assignedDepartment?: string;
  assignedTo?: Types.ObjectId;
  upvotes: Types.ObjectId[];
  resolutionNotes?: string;
  resolvedAt?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Hostel",
        "Maintenance",
        "Wi-Fi & IT",
        "Sanitation",
        "Mess / Canteen",
        "Library",
        "Other",
      ],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    location: {
      type: String,
      required: [true, "Campus location is required"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDepartment: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexing for search and filtering
IssueSchema.index({ status: 1, category: 1, priority: 1, createdAt: -1 });

const Issue: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);

export default Issue;
