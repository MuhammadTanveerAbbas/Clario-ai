"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface TrendData {
  date: string;
  usage: number;
}

interface FeatureData {
  name: string;
  value: number;
}

interface AnalyticsData {
  trendData: TrendData[];
  featureData: FeatureData[];
  totalUsage: number;
}

function EmptyChart({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] px-5 py-10 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-40"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <div>
        <p className="text-[11px] font-medium text-[var(--text3)]">
          No data yet for {title.toLowerCase()}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text3)] opacity-70">
          Start using Clario to see your analytics.
        </p>
      </div>
      <Link
        href="/summarizer"
        className="text-[11px] font-semibold text-[hsl(var(--accent))] transition-opacity hover:opacity-80"
      >
        Open Summarizer →
      </Link>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--bg2)",
  border: "1px solid var(--sidebar-b)",
  borderRadius: "8px",
  fontSize: "11px",
  padding: "6px 10px",
  color: "var(--text)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-analytics")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="h-[260px] animate-pulse rounded-xl bg-[var(--bg3)]" />
        <div className="h-[260px] animate-pulse rounded-xl bg-[var(--bg3)]" />
      </div>
    );
  }

  if (!data || data.trendData.every((d) => d.usage === 0)) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <EmptyChart title="Activity" />
        <EmptyChart title="Features" />
      </div>
    );
  }

  const last7Days = data.trendData.slice(-7);
  const topFeatures = data.featureData.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* Activity line chart */}
      <div className="rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[11px] font-semibold text-[var(--text2)]">Activity</h4>
          <span className="rounded-full bg-[var(--bg3)] px-2 py-0.5 text-[9px] font-medium text-[var(--text3)]">
            {data.totalUsage} total
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={last7Days}
            margin={{ top: 5, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sidebar-b)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text)", fontWeight: 600, fontSize: 11 }}
              itemStyle={{ color: "var(--text2)", fontSize: 11 }}
              cursor={{ stroke: "var(--sidebar-b)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Features bar chart */}
      <div className="rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4">
        <div className="mb-3">
          <h4 className="text-[11px] font-semibold text-[var(--text2)]">Features</h4>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={topFeatures}
            margin={{ top: 5, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sidebar-b)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text)", fontWeight: 600, fontSize: 11 }}
              itemStyle={{ color: "var(--text2)", fontSize: 11 }}
              cursor={{ fill: "var(--bg3)" }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
