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
    <div className="analytics-mini-card">
      <div className="analytics-mini-header">
        <h4 className="analytics-mini-title">{title}</h4>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "32px 16px",
          textAlign: "center",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <p style={{ fontSize: "0.8rem", color: "var(--text3)", margin: 0 }}>
          No data yet. Start using Clario to see your analytics.
        </p>
        <Link
          href="/summarizer"
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "hsl(var(--accent))",
            textDecoration: "none",
          }}
        >
          Open Summarizer →
        </Link>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--bg2)",
  border: "1px solid var(--sidebar-b)",
  borderRadius: "8px",
  fontSize: "12px",
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
      <div className="analytics-mini-grid">
        <div className="analytics-mini-skeleton" />
        <div className="analytics-mini-skeleton" />
      </div>
    );
  }

  if (!data || data.trendData.every((d) => d.usage === 0)) {
    return (
      <div className="analytics-mini-grid">
        <EmptyChart title="Activity" />
        <EmptyChart title="Features" />
      </div>
    );
  }

  const last7Days = data.trendData.slice(-7);
  const topFeatures = data.featureData.slice(0, 4);

  return (
    <div className="analytics-mini-grid">
      {/* Activity line chart */}
      <div className="analytics-mini-card">
        <div className="analytics-mini-header">
          <h4 className="analytics-mini-title">Activity</h4>
          <span className="analytics-mini-badge">{data.totalUsage} total</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={last7Days}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sidebar-b)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fill: "var(--text3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text)", fontWeight: 600 }}
              itemStyle={{ color: "var(--text2)" }}
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
      <div className="analytics-mini-card">
        <div className="analytics-mini-header">
          <h4 className="analytics-mini-title">Features</h4>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={topFeatures}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sidebar-b)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fill: "var(--text3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text)", fontWeight: 600 }}
              itemStyle={{ color: "var(--text2)" }}
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
