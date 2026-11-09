"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, ArrowRight, RefreshCw } from "lucide-react";

interface TrendPoint {
  date: string;
  usage: number;
}

interface FeaturePoint {
  name: string;
  value: number;
}

interface AnalyticsData {
  trendData: TrendPoint[];
  featureData: FeaturePoint[];
  totalUsage: number;
}

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "8px",
  fontSize: "11px",
  padding: "6px 10px",
  color: "var(--ink)",
  boxShadow: "var(--shadow-medium)",
};

export function AnalyticsCharts({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadAnalytics = useCallback((silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    fetch("/api/dashboard-analytics", { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("Failed"))
      )
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadAnalytics();
  }, [loadAnalytics, refreshKey]);

  useEffect(() => {
    const refetchIfVisible = () => {
      if (document.visibilityState === "visible") loadAnalytics(true);
    };
    document.addEventListener("visibilitychange", refetchIfVisible);
    window.addEventListener("focus", refetchIfVisible);
    return () => {
      document.removeEventListener("visibilitychange", refetchIfVisible);
      window.removeEventListener("focus", refetchIfVisible);
    };
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="surface">
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="h-4 w-28 animate-pulse rounded-md bg-[var(--surface-3)]" />
          <div className="h-[200px] w-full animate-pulse rounded-md bg-[var(--surface-3)]" />
        </div>
        <div className="border-t border-[var(--line)] space-y-4 px-5 py-5 sm:px-6">
          <div className="h-4 w-24 animate-pulse rounded-md bg-[var(--surface-3)]" />
          <div className="h-[160px] w-full animate-pulse rounded-md bg-[var(--surface-3)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
          <BarChart3 className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[14px] font-semibold text-[var(--ink)]">
            Analytics did not load
          </p>
          <p className="max-w-[280px] text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            There was a problem reaching the analytics service.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadAnalytics()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:border-[var(--brand-line)] hover:text-[var(--brand)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  const hasUsage =
    data && data.trendData.some((point) => point.usage > 0);

  if (!data || !hasUsage) {
    return (
      <div className="surface flex min-h-[300px] flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
          <BarChart3 className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[14px] font-semibold text-[var(--ink)]">
            No usage data yet
          </p>
          <p className="mx-auto max-w-[280px] text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            Run a summary, chat, or remix and your activity will appear here.
          </p>
        </div>
        <Link
          href="/summarizer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--brand)] no-underline transition-colors hover:bg-[var(--accent-m)]"
        >
          Create your first summary
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const last7Days = data.trendData.slice(-7);
  const topFeatures = data.featureData.slice(0, 4);

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Requests
          </h3>
          <p className="mt-1 text-[12px] text-[var(--ink-3)]">
            Daily activity, last 7 days
          </p>
        </div>
        <span className="app-chip shrink-0">
          {data.totalUsage.toLocaleString()} total
        </span>
      </div>

      <div className="px-2 pb-4 sm:px-3">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={last7Days}
            margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--line)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 11,
              }}
              itemStyle={{ color: "var(--ink-2)", fontSize: 11 }}
              cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="var(--brand)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--brand)", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-[var(--line)] px-5 py-5 sm:px-6">
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">
          Feature mix
        </h3>
        <p className="mt-1 text-[12px] text-[var(--ink-3)]">
          Where your requests went
        </p>
      </div>

      <div className="px-2 pb-5 sm:px-3">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={topFeatures}
            margin={{ top: 4, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--line)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 11,
              }}
              itemStyle={{ color: "var(--ink-2)", fontSize: 11 }}
              cursor={{ fill: "var(--surface-2)" }}
            />
            <Bar
              dataKey="value"
              fill="var(--brand)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
