"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  PlusCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
} from "lucide-react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "staff" | "admin";
  department?: string;
  enrollmentNo?: string;
}

interface NavbarProps {
  user: CurrentUser | null;
  onOpenAuth: () => void;
  onOpenNewIssue: () => void;
  onLogout: () => void;
  onQuickDemoLogin: (role: "student" | "admin" | "staff") => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onOpenNewIssue,
  onLogout,
  onQuickDemoLogin,
}: NavbarProps) {
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    // Check health endpoint
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setDbHealthy(data?.database?.connected ?? false);
      })
      .catch(() => setDbHealthy(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                MITS Campus
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                Resolver
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Madhav Institute of Technology &amp; Science
            </p>
          </div>
        </div>

        {/* System DB Indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* Health status badge */}
          <div
            title={
              dbHealthy
                ? "MongoDB Connected (Fullstack Next.js App Router)"
                : "Connecting to Database..."
            }
            className="hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
          >
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <span
              className={`h-2 w-2 rounded-full ${
                dbHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{dbHealthy ? "DB Connected" : "Connecting..."}</span>
          </div>

          {/* Quick Demo Login selector */}
          {!user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
              >
                <span>Demo Accounts</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  ▾
                </span>
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    One-Click Demo Logins
                  </div>
                  <button
                    onClick={() => {
                      setShowDemoMenu(false);
                      onQuickDemoLogin("student");
                    }}
                    className="w-full text-left rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    🎓 Student (Rahul Sharma)
                  </button>
                  <button
                    onClick={() => {
                      setShowDemoMenu(false);
                      onQuickDemoLogin("admin");
                    }}
                    className="w-full text-left rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    🛡️ Administrator (Dean Office)
                  </button>
                  <button
                    onClick={() => {
                      setShowDemoMenu(false);
                      onQuickDemoLogin("staff");
                    }}
                    className="w-full text-left rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    🔧 Staff (Campus Maintenance)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Report Issue Button */}
          <button
            type="button"
            onClick={onOpenNewIssue}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-98 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Report Issue</span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {user.role} {user.department ? `• ${user.department}` : ""}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <LogIn className="h-4 w-4 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
