import type { Recommendations } from "../../types/analysis";

const sections = [
  { key: "exposure_areas", label: "Exposure areas", icon: "⚠️" },
  { key: "resistant_strengths", label: "AI-resistant strengths", icon: "🛡" },
  { key: "upskill_roadmap", label: "Upskill roadmap", icon: "🚀" },
  { key: "transition_paths", label: "Transition paths", icon: "🔀" },
] as const;

export default function RecommendationPanel({ recommendations }: { recommendations: Recommendations }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map(({ key, label, icon }) => (
        <div key={key} className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>{icon}</span> {label}
          </h3>
          <ul className="space-y-2">
            {recommendations[key].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}