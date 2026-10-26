"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  ThumbsUp,
  Send,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building,
} from "lucide-react";
import { IssueItem } from "./IssueCard";
import { CurrentUser } from "./Navbar";

interface CommentItem {
  _id: string;
  content: string;
  isOfficialResponse: boolean;
  author: {
    _id: string;
    name: string;
    role: string;
    department?: string;
  };
  createdAt: string;
}

interface IssueDetailModalProps {
  issue: IssueItem;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onUpdated: () => void;
  onVote: (issueId: string) => void;
}

export default function IssueDetailModal({
  issue,
  currentUser,
  onClose,
  onUpdated,
  onVote,
}: IssueDetailModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Admin / Staff status edit states
  const [newStatus, setNewStatus] = useState(issue.status);
  const [newPriority, setNewPriority] = useState(issue.priority);
  const [resolutionNotes, setResolutionNotes] = useState(issue.resolutionNotes || "");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const isStaffOrAdmin =
    currentUser && ["admin", "staff", "faculty"].includes(currentUser.role);
  const isOwner = currentUser && currentUser.id === issue.author?._id;
  const isUpvoted = currentUser ? issue.upvotes?.includes(currentUser.id) : false;

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/issues/${issue._id}/comments`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [issue._id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/issues/${issue._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/issues/${issue._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority,
          resolutionNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("Issue status updated successfully!");
        onUpdated();
      } else {
        setActionMessage(data.message || "Failed to update issue");
      }
    } catch (err) {
      console.error(err);
      setActionMessage("Error updating issue");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campus issue?")) return;
    try {
      const res = await fetch(`/api/issues/${issue._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {issue.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Reported by {issue.author?.name || "Campus Member"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Title & Location */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {issue.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="font-medium">{issue.location}</span>
              {issue.assignedDepartment && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Dept: {issue.assignedDepartment}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {issue.description}
          </div>

          {/* Upvote & Actions */}
          <div className="flex items-center justify-between py-2 border-y border-slate-100">
            <button
              type="button"
              onClick={() => onVote(issue._id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                isUpvoted
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${isUpvoted ? "fill-white" : ""}`} />
              <span>{issue.upvotes?.length || 0} Campus Endorsements</span>
            </button>

            {(isStaffOrAdmin || isOwner) && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Issue</span>
              </button>
            )}
          </div>

          {/* Admin / Staff Management Panel */}
          {isStaffOrAdmin && (
            <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Authority Management Panel (Staff / Admin)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as IssueItem["status"])
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as IssueItem["priority"])
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Resolution Remarks / Action Taken
                </label>
                <input
                  type="text"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Dispatched technician, replaced switch port."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {actionMessage && (
                  <span className="text-xs text-emerald-400 font-medium">
                    {actionMessage}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{updatingStatus ? "Saving..." : "Apply Changes"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Official Resolution Notice (if already resolved) */}
          {issue.status === "Resolved" && issue.resolutionNotes && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Issue Resolved by Campus Administration</span>
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                {issue.resolutionNotes}
              </p>
            </div>
          )}

          {/* Discussion & Timeline Thread */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Discussion &amp; Updates ({comments.length})
            </h4>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No comments yet. Be the first to share an update or question.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`p-3 rounded-2xl border text-xs ${
                      comment.isOfficialResponse
                        ? "bg-blue-50/70 border-blue-200"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {comment.author?.name || "Campus Member"}
                        </span>
                        {comment.isOfficialResponse && (
                          <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            Staff Remark
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post an update or question..."
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400 pt-1">
                Please sign in to participate in the discussion.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
