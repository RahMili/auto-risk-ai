import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import type { RiskScore } from "../../types/analysis";
import Badge from "../shared/Badge";

const bandColor = {
  low: "#22c55e",
  moderate: "#f59e0b",
  high: "#ef4444",
  very_high: "#7f1d1d",
};

export default function ScoreGauge({ risk }: { risk: RiskScore }) {
  const color = bandColor[risk.band];
  const data = [{ value: risk.score, fill: color }];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#f3f4f6" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{risk.score}</span>
          <span className="text-sm text-gray-500">out of 100</span>
        </div>
      </div>
      <Badge band={risk.band} />
    </div>
  );
}