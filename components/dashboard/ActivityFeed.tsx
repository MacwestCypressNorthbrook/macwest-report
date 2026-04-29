"use client";

import { DollarSign, TrendingUp, CreditCard, PieChart, Wallet, Activity, Clock, Target } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
  bg: string;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    icon: <DollarSign className="h-4 w-4" />,
    title: "Revenue recorded",
    description: "Q1 2026 revenue logged",
    time: "Just now",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "2",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Margin improved",
    description: "Gross margin up 21.1% vs FY2025",
    time: "2 hours ago",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "3",
    icon: <CreditCard className="h-4 w-4" />,
    title: "Payment received",
    description: "De Simone Ltd payment processed",
    time: "5 hours ago",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "4",
    icon: <PieChart className="h-4 w-4" />,
    title: "Revenue breakdown",
    description: "Customer distribution updated",
    time: "1 day ago",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "5",
    icon: <Wallet className="h-4 w-4" />,
    title: "Cash position",
    description: "Cash at bank: GHS 4.76M",
    time: "1 day ago",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.bg}`}>
              <div className={activity.color}>{activity.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {activity.description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="h-3 w-3" />
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}