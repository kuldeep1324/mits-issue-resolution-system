"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, Building2, AlertCircle } from "lucide-react";
import { CurrentUser } from "./Navbar";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: CurrentUser) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "staff" | "admin">("student");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        tab === "login"
          ? { email, password }
          : { name, email, password, role, department, enrollmentNo };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authentication failed");
      } else {
        onSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTab("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                MITS Campus Portal
              </h3>
              <p className="text-xs text-slate-500">
                Sign in to manage &amp; resolve issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-2.5 mb-4 text-xs text-rose-700 font-medium border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* One-Click Quick Fill Credentials */}
        {tab === "login" && (
          <div className="mb-4 rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Quick Test Autofill
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleDemoSelect("student@mits.edu", "student123")
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect("admin@mits.edu", "admin123")}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDemoSelect("maintenance@mits.edu", "staff123")
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
              >
                🔧 Staff
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3.5">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "student" | "staff" | "admin")
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Campus Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enrollment / ID
                  </label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="0901CS221045"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@mits.edu"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs mt-2"
          >
            {loading
              ? "Authenticating..."
              : tab === "login"
              ? "Sign In to Portal"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
