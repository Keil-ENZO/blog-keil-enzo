"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";

type Day = { date: string; label: string; count: number };

export function ViewsChart({ data }: { data: Day[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const total = data.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        Pas encore de données
      </div>
    );
  }

  const strokeColor = isDark ? "#a5b4fc" : "hsl(var(--primary))";
  const gradientTop = isDark ? "rgba(165,180,252,0.3)" : "hsl(var(--primary) / 0.2)";
  const gradientBottom = isDark ? "rgba(165,180,252,0.05)" : "hsl(var(--primary) / 0)";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "hsl(var(--border))";
  const tickColor = isDark ? "rgba(255,255,255,0.45)" : "hsl(var(--muted-foreground))";

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientTop} stopOpacity={1} />
            <stop offset="95%" stopColor={gradientBottom} stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: tickColor }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: isDark ? "#1a1a1a" : "hsl(var(--background))",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "hsl(var(--border))"}`,
            borderRadius: "6px",
            fontSize: 12,
            color: isDark ? "#fff" : "inherit",
          }}
          formatter={(value: unknown) => [`${value as number} vues`]}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={strokeColor}
          strokeWidth={2}
          fill="url(#viewsGradient)"
          dot={false}
          activeDot={{ r: 4, fill: strokeColor }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
