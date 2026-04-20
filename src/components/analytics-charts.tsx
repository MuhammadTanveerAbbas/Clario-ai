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
    return null;
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
              stroke="var(--border)"
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
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="var(--accent)"
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
              stroke="var(--border)"
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
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "12px",
                padding: "6px 10px",
              }}
              cursor={false}
            />
            <Bar
              dataKey="value"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
