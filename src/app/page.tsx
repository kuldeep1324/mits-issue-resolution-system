"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar, { CurrentUser } from "@/components/Navbar";
import StatsOverview, { StatsData } from "@/components/StatsOverview";
import IssueCard, { IssueItem } from "@/components/IssueCard";
import IssueDetailModal from "@/components/IssueDetailModal";
import NewIssueModal from "@/components/NewIssueModal";
import AuthModal from "@/components/AuthModal";
import {
  Search,
  Filter,
  Flame,
  Clock,
  Sparkles,
  Building2,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Wi-Fi & IT",
  "Maintenance",
  "Hostel",
  "Sanitation",
  "Academic",
  "Mess / Canteen",
  "Library",
  "Other",
];

export default function Home() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    resolutionRate: 0,
  });

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "votes">("newest");
  const [myIssuesOnly, setMyIssuesOnly] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [activeIssueDetail, setActiveIssueDetail] = useState<IssueItem | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check error", err);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Stats error", err);
    }
  }, []);

  // Fetch Issues
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedPriority !== "All") params.append("priority", selectedPriority);
      if (search.trim()) params.append("search", search.trim());
      if (sortBy) params.append("sortBy", sortBy);
      if (myIssuesOnly) params.append("authorOnly", "true");

      const res = await fetch(`/api/issues?${params.toString()}`);
      const data = await res.json();
      if (data.issues) {
        setIssues(data.issues);
      }
    } catch (err) {
      console.error("Issues fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, selectedPriority, search, sortBy, myIssuesOnly]);

  useEffect(() => {
    checkSession();
    fetchStats();
  }, [checkSession, fetchStats]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMyIssuesOnly(false);
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  // One-click demo login
  const handleQuickDemoLogin = async (role: "student" | "admin" | "staff") => {
    const creds = {
      student: { email: "student@mits.edu", password: "student123" },
      admin: { email: "admin@mits.edu", password: "admin123" },
      staff: { email: "maintenance@mits.edu", password: "staff123" },
    }[role];

    try {
      // First ensure seed exists
      await fetch("/api/seed", { method: "POST" });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        fetchStats();
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Seed sample data
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchStats();
      await fetchIssues();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  // Toggle upvote
  const handleVote = async (issueId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((item) => {
        if (item._id === issueId) {
          const hasUpvoted = item.upvotes?.includes(user.id);
          const newUpvotes = hasUpvoted
            ? item.upvotes.filter((id) => id !== user.id)
            : [...(item.upvotes || []), user.id];
          return { ...item, upvotes: newUpvotes };
        }
        return item;
      })
    );

    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, { method: "POST" });
      if (!res.ok) {
        fetchIssues(); // Rollback if failed
      }
    } catch (err) {
      console.error(err);
      fetchIssues();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenNewIssue={() => setShowNewIssueModal(true)}
        onLogout={handleLogout}
        onQuickDemoLogin={handleQuickDemoLogin}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fullstack Next.js App Router Single-Folder Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              MITS Campus Issue &amp; Resolution System
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Transparent, fast-track grievance resolution for students, faculty, and administration. Report campus infrastructure, IT, or hostel issues and track real-time resolution.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewIssueModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition active:scale-98"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Grievance</span>
              </button>
              <button
                type="button"
                onClick={handleSeedData}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white border border-white/15 transition"
              >
                <RefreshCw className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`} />
                <span>{seeding ? "Seeding..." : "Seed Demo Issues"}</span>
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Live Metrics Overview */}
        <StatsOverview
          stats={stats}
          activeFilter={selectedStatus}
          onSelectFilter={(status) => setSelectedStatus(status)}
        />

        {/* Category Pills Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location (e.g. Lab 3, Hostel 2), or description..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Quick Filter controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {user && (
              <button
                type="button"
                onClick={() => setMyIssuesOnly(!myIssuesOnly)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                  myIssuesOnly
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                My Reported Issues
              </button>
            )}

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "votes")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="newest">Latest Issues</option>
              <option value="votes">Most Endorsed</option>
            </select>
          </div>
        </div>

        {/* Issues List Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Campus Grievances &amp; Issues ({issues.length})
            </h2>
            <span className="text-xs text-slate-500">
              Showing active community reports
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse"
                >
                  <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-4" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <HelpCircle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No campus issues found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                No issues match your current filters. You can report a new issue or populate the demo dataset.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewIssueModal(true)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Report First Issue
                </button>
                <button
                  type="button"
                  onClick={handleSeedData}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  currentUserId={user?.id}
                  onOpenDetail={(item) => setActiveIssueDetail(item)}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setUser(u);
            fetchStats();
            fetchIssues();
          }}
        />
      )}

      {showNewIssueModal && (
        <NewIssueModal
          currentUser={user}
          onClose={() => setShowNewIssueModal(false)}
          onCreated={() => {
            fetchStats();
            fetchIssues();
          }}
          onRequireAuth={() => setShowAuthModal(true)}
        />
      )}

      {activeIssueDetail && (
        <IssueDetailModal
          issue={activeIssueDetail}
          currentUser={user}
          onClose={() => setActiveIssueDetail(null)}
          onUpdated={() => {
            fetchStats();
            fetchIssues();
            // Re-fetch detail
            fetch(`/api/issues/${activeIssueDetail._id}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.issue) setActiveIssueDetail(d.issue);
              })
              .catch(console.error);
          }}
          onVote={handleVote}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-700">
              Madhav Institute of Technology &amp; Science (MITS)
            </span>
            <span>• Campus Grievance &amp; Issue Resolution System</span>
          </div>
          <div>Built with Next.js App Router (Single-Folder Fullstack Architecture)</div>
        </div>
      </footer>
    </div>
  );
}
