"use client";

import React from "react";
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building,
  Wifi,
  Wrench,
  BookOpen,
  Utensils,
  Droplets,
  HelpCircle,
} from "lucide-react";

export interface IssueItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "Under Review" | "In Progress" | "Resolved" | "Rejected";
  location: string;
  author: {
    _id: string;
    name: string;
    department?: string;
    role?: string;
  };
  assignedDepartment?: string;
  upvotes: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface IssueCardProps {
  issue: IssueItem;
  currentUserId?: string;
  onOpenDetail: (issue: IssueItem) => void;
  onVote: (issueId: string) => void;
}

export default function IssueCard({
  issue,
  currentUserId,
  onOpenDetail,
  onVote,
}: IssueCardProps) {
  const isUpvoted = currentUserId ? issue.upvotes?.includes(currentUserId) : false;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Wi-Fi & IT":
        return <Wifi className="h-3.5 w-3.5" />;
      case "Maintenance":
        return <Wrench className="h-3.5 w-3.5" />;
      case "Hostel":
        return <Building className="h-3.5 w-3.5" />;
      case "Sanitation":
        return <Droplets className="h-3.5 w-3.5" />;
      case "Mess / Canteen":
        return <Utensils className="h-3.5 w-3.5" />;
      case "Library":
        return <BookOpen className="h-3.5 w-3.5" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200">
            <Clock className="h-3.5 w-3.5 text-sky-600" />
            In Progress
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <AlertCircle className="h-3.5 w-3.5 text-indigo-600" />
            Under Review
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const formattedDate = new Date(issue.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={() => onOpenDetail(issue)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Top Header: Category & Priority & Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {getCategoryIcon(issue.category)}
              <span>{issue.category}</span>
            </span>
            {getPriorityBadge(issue.priority)}
          </div>
          <div>{getStatusBadge(issue.status)}</div>
        </div>

        {/* Title & Description snippet */}
        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
          {issue.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {issue.description}
        </p>
      </div>

      {/* Location and Metadata */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span className="truncate font-medium">{issue.location}</span>
        </div>

        {/* Official Resolution Remark if Resolved */}
        {issue.status === "Resolved" && issue.resolutionNotes && (
          <div className="mb-4 rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-100 text-xs text-emerald-800">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Official Resolution</span>
            </div>
            <p className="line-clamp-1 text-emerald-700">{issue.resolutionNotes}</p>
          </div>
        )}

        {/* Footer: Author & Upvote */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
              {issue.author?.name ? issue.author.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                {issue.author?.name || "Campus Member"}
              </div>
              <div className="text-[10px] text-slate-400">{formattedDate}</div>
            </div>
          </div>

          {/* Upvote button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote(issue._id);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              isUpvoted
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${isUpvoted ? "fill-white" : ""}`} />
            <span>{issue.upvotes?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
