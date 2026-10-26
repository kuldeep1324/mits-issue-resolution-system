"use client";

import React from "react";
import { AlertTriangle, Clock, CheckCircle2, Flame, TrendingUp } from "lucide-react";

export interface StatsData {
  total: number;
  pending: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  resolutionRate: number;
}

interface StatsOverviewProps {
  stats: StatsData;
  activeFilter: string;
  onSelectFilter: (status: string) => void;
}

export default function StatsOverview({
  stats,
  activeFilter,
  onSelectFilter,
}: StatsOverviewProps) {
  const cards = [
    {
      label: "Total Reported",
      value: stats.total,
      filter: "All",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Pending Action",
      value: stats.pending,
      filter: "Pending",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      label: "In Progress",
      value: stats.inProgress + stats.underReview,
      filter: "In Progress",
      icon: Clock,
      color: "from-sky-500 to-blue-600",
      textColor: "text-sky-700",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
    },
    {
      label: "Resolved Issues",
      value: stats.resolved,
      filter: "Resolved",
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filter;

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectFilter(card.filter)}
            className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all duration-200 ${
              isSelected
                ? `${card.bgColor} ${card.borderColor} ring-2 ring-blue-500 shadow-md`
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between w-full">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.filter === "Resolved" && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {stats.resolutionRate}% Rate
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
