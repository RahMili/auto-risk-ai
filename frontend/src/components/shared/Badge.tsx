import type { AutomationBand } from "../../types/analysis";

const bandConfig: Record<AutomationBand, { label: string; className: string }> = {
  low: { label: "Low Risk", className: "bg-green-100 text-green-800" },
  moderate: { label: "Moderate Risk", className: "bg-amber-100 text-amber-800" },
  high: { label: "High Risk", className: "bg-red-100 text-red-800" },
  very_high: { label: "Very High Risk", className: "bg-red-900 text-red-100" },
};

export default function Badge({ band }: { band: AutomationBand }) {
  const { label, className } = bandConfig[band];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  );
}