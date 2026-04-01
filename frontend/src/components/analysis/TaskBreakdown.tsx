import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { RiskScore } from "../../types/analysis";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];

export default function TaskBreakdown({ risk }: { risk: RiskScore }) {
  const data = [
    { name: "Highly automatable", value: risk.highly_automatable_pct },
    { name: "Partially automatable", value: risk.partially_automatable_pct },
    { name: "Low automatable", value: risk.low_automatable_pct },
    { name: "Human critical", value: risk.human_critical_pct },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => [`${Number(val).toFixed(1)}%`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}