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
import { BarChart2 } from "lucide-react";
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

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/dashboard-analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-mini-grid">
        <div className="analytics-mini-skeleton" />
        <div className="analytics-mini-skeleton" />
      </div>
    );
  }

  if (!data || data.trendData.length === 0) {
    return (
      <div className="analytics-mini-grid">
        <div className="analytics-mini-card">
          <div className="analytics-mini-header">
            <h4 className="analytics-mini-title">Activity</h4>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
            <BarChart2 className="h-10 w-10 text-muted-foreground opacity-60" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Your analytics will appear here once you start using Clario.
            </p>
            <Link
              href="/summarizer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open Summarizer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const last7Days = data.trendData.slice(-7);
  const topFeatures = data.featureData.slice(0, 4);

  return (
    <div className="analytics-mini-grid">
      <div className="analytics-mini-card">
        <div className="analytics-mini-header">
          <h4 className="analytics-mini-title">Activity</h4>
          <span className="analytics-mini-badge">{data.totalUsage} total</span>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart
            data={last7Days}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="var(--text3)"
              style={{ fontSize: "11px" }}
              tick={{ dy: 4 }}
            />
            <YAxis
              stroke="var(--text3)"
              style={{ fontSize: "11px" }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-mini-card">
        <div className="analytics-mini-header">
          <h4 className="analytics-mini-title">Features</h4>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={topFeatures}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--text3)"
              style={{ fontSize: "11px" }}
              tick={{ dy: 4 }}
            />
            <YAxis
              stroke="var(--text3)"
              style={{ fontSize: "11px" }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              cursor={false}
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
