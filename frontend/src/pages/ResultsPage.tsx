import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import type { AutomationBand, RiskScore, Recommendations, DecomposedTasks } from "../types/analysis";
import DownloadButton from "../components/analysis/DownloadButton";

// ─── helpers ────────────────────────────────────────────────────────────────

const bandConfig: Record<AutomationBand, { label: string; color: string; bg: string; border: string }> = {
  low:       { label: "Low Risk",       color: "#22c55e", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  moderate:  { label: "Moderate Risk",  color: "#f59e0b", bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
  high:      { label: "High Risk",      color: "#ef4444", bg: "bg-red-500/10",     border: "border-red-500/20"    },
  very_high: { label: "Very High Risk", color: "#dc2626", bg: "bg-red-900/20",     border: "border-red-900/40"    },
};

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];

const taskLabels = [
  { key: "highly_automatable",    label: "Highly automatable",    color: "#ef4444" },
  { key: "partially_automatable", label: "Partially automatable", color: "#f59e0b" },
  { key: "low_automatable",       label: "Low automatable",       color: "#22c55e" },
  { key: "human_critical",        label: "Human critical",        color: "#3b82f6" },
] as const;

// ─── sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ risk }: { risk: RiskScore }) {
  const cfg = bandConfig[risk.band];
  const data = [{ value: risk.score, fill: cfg.color }];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-56 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgba(255,255,255,0.05)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-white leading-none">{risk.score}</span>
          <span className="text-white/30 text-sm mt-1">out of 100</span>
        </div>
      </div>
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.border}`}
        style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

function TaskPie({ risk }: { risk: RiskScore }) {
  const data = [
    { name: "Highly automatable",    value: risk.highly_automatable_pct },
    { name: "Partially automatable", value: risk.partially_automatable_pct },
    { name: "Low automatable",       value: risk.low_automatable_pct },
    { name: "Human critical",        value: risk.human_critical_pct },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
            formatter={(value) => [
              value != null ? `${Number(value).toFixed(1)}%` : '0%'
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TaskBars({ tasks }: { tasks: DecomposedTasks }) {
  const total = tasks.highly_automatable.length + tasks.partially_automatable.length +
    tasks.low_automatable.length + tasks.human_critical.length || 1;

  return (
    <div className="space-y-3">
      {taskLabels.map(({ key, label, color }) => {
        const count = tasks[key].length;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/60 text-sm">{label}</span>
              <span className="text-white/40 text-xs">{count} tasks · {pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecommendationSection({ recommendations }: { recommendations: Recommendations }) {
  const sections = [
    { key: "exposure_areas",      label: "Exposure areas",         icon: "⚠️", color: "border-red-500/20    bg-red-500/5",     accent: "text-red-400"     },
    { key: "resistant_strengths", label: "AI-resistant strengths", icon: "🛡", color: "border-emerald-500/20 bg-emerald-500/5", accent: "text-emerald-400" },
    { key: "upskill_roadmap",     label: "Upskill roadmap",        icon: "🚀", color: "border-blue-500/20   bg-blue-500/5",    accent: "text-blue-400"    },
    { key: "transition_paths",    label: "Transition paths",       icon: "🔀", color: "border-purple-500/20  bg-purple-500/5",  accent: "text-purple-400"  },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map(({ key, label, icon, color, accent }) => (
        <div key={key} className={`p-6 rounded-2xl border ${color}`}>
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${accent}`}>
            <span>{icon}</span>{label}
          </h3>
          <ul className="space-y-3">
            {recommendations[key].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate();
  const { report, statuses, isAnalyzing, error, reset } = useAnalysisStore();

  if (!report && !isAnalyzing && !error && statuses.length === 0) {
    navigate("/upload");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-8">

        {/* streaming status */}
        {(isAnalyzing || (!report && !error)) && (
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-white/30 text-sm uppercase tracking-widest mb-6">Analysis in progress</p>
            <div className="space-y-3">
              {statuses.map((status, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400">✓</span>
                  {status}
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex items-center gap-3 text-sm text-white/30">
                  <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white/30 animate-ping" />
                  </span>
                  Processing...
                </div>
              )}
            </div>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start gap-4">
            <span className="text-red-400 text-xl mt-0.5">⚠</span>
            <div>
              <p className="text-red-400 font-bold mb-1">Analysis failed</p>
              <p className="text-red-400/60 text-sm">{error}</p>
              <button
                onClick={() => { reset(); navigate("/upload"); }}
                className="mt-4 text-sm text-red-400/60 hover:text-red-400 underline transition-colors"
              >
                Try again →
              </button>
            </div>
          </div>
        )}

        {/* results */}
        {report && (
          <>
            {/* profile header */}
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-white/30 text-sm uppercase tracking-widest mb-2">Analysis complete</p>
              <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
                {report.profile.name}
              </h1>
              <p className="text-white/40 text-lg mb-6">{report.profile.current_role}</p>

              <div className="flex flex-wrap gap-2">
                {report.profile.skills.slice(0, 8).map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/50">
                    {skill}
                  </span>
                ))}
                {report.profile.skills.length > 8 && (
                  <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/30">
                    +{report.profile.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* score + pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Automation risk score</p>
                <ScoreRing risk={report.risk} />
              </div>
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Task breakdown</p>
                <TaskPie risk={report.risk} />
              </div>
            </div>

            {/* task bars */}
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Task classification</p>
              <TaskBars tasks={report.tasks} />
            </div>

            {/* roast */}
            {report.roast && (
              <div className="p-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl opacity-10 pointer-events-none select-none pr-4 pt-2">🔥</div>
                <p className="text-orange-400/60 text-xs uppercase tracking-widest mb-3">🔥 Your roast</p>
                <p className="text-orange-300/80 leading-relaxed italic text-lg">
                  "{report.roast}"
                </p>
              </div>
            )}

            {/* recommendations */}
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Recommendations</p>
              <RecommendationSection recommendations={report.recommendations} />
            </div>

            {/* tools */}
            {report.profile.tools.length > 0 && (
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Tools detected</p>
                <div className="flex flex-wrap gap-2">
                  {report.profile.tools.map((tool, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 text-white/60">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* experience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <p className="text-4xl font-black text-white mb-1">{report.profile.years_experience}</p>
                <p className="text-white/30 text-sm">Years experience</p>
              </div>
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <p className="text-4xl font-black text-white mb-1">{report.tasks.tasks.length}</p>
                <p className="text-white/30 text-sm">Tasks analyzed</p>
              </div>
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <p className="text-4xl font-black text-white mb-1">{report.profile.skills.length}</p>
                <p className="text-white/30 text-sm">Skills detected</p>
              </div>
            </div>
            {/* download */}
            <DownloadButton jobId={report.job_id} />

            {/* analyze another */}
            <div className="text-center pt-4">
              <button
                onClick={() => { reset(); navigate("/upload"); }}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-white hover:bg-white/90 transition-all duration-200"
              >
                Analyze another resume
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}