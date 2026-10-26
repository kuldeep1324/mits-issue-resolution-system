"use client";

import React, { useState } from "react";
import { X, Send, AlertCircle, Building2, MapPin } from "lucide-react";
import { CurrentUser } from "./Navbar";

interface NewIssueModalProps {
  currentUser: CurrentUser | null;
  onClose: () => void;
  onCreated: () => void;
  onRequireAuth: () => void;
}

export default function NewIssueModal({
  currentUser,
  onClose,
  onCreated,
  onRequireAuth,
}: NewIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Wi-Fi & IT");
  const [priority, setPriority] = useState("Medium");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            You must be signed in with your MITS student or staff account to report a campus issue.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in the title, description, and campus location.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          location: location.trim(),
          assignedDepartment: department.trim() || category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit issue");
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">
              Report Campus Grievance or Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken bench and faulty projector in Room 204"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Wi-Fi & IT">Wi-Fi & IT</option>
                <option value="Maintenance">Maintenance & Infrastructure</option>
                <option value="Hostel">Hostel & Accommodation</option>
                <option value="Sanitation">Sanitation & Water</option>
                <option value="Academic">Academic & Laboratories</option>
                <option value="Mess / Canteen">Mess / Canteen</option>
                <option value="Library">Library</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Low">Low - Minor inconvenience</option>
                <option value="Medium">Medium - Regular priority</option>
                <option value="High">High - Disrupting daily routine</option>
                <option value="Urgent">Urgent - Safety / Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exact Campus Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Electrical Dept Building, 1st Floor, Room 112"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is wrong, when it started, and any relevant details..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? "Submitting..." : "Submit Grievance"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
