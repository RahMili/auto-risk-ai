import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "📄",
    title: "Upload your resume",
    description:
      "Drop a PDF, DOCX, or TXT file. We extract every role, skill, tool, and responsibility automatically.",
  },
  {
    icon: "🧠",
    title: "Task decomposition",
    description:
      "Your job gets broken into granular tasks — each classified by how easily AI can replace it today.",
  },
  {
    icon: "📊",
    title: "Automation risk score",
    description:
      "A weighted 0–100 score tells you exactly where you stand. Low, moderate, high, or very high exposure.",
  },
  {
    icon: "🛡",
    title: "AI-resilient strengths",
    description:
      "We highlight what makes you hard to automate — the human-critical skills that AI can't replicate.",
  },
  {
    icon: "🚀",
    title: "Upskill roadmap",
    description:
      "Concrete steps to future-proof your career — transition paths, skill gaps, and where to focus next.",
  },
  {
    icon: "🔥",
    title: "Roast mode",
    description:
      "Enable roast mode for a technically savage, skill-focused breakdown of your automation exposure.",
  },
];

const bands = [
  { range: "0–30", label: "Low exposure", color: "bg-emerald-500", width: "w-[30%]" },
  { range: "31–60", label: "AI will assist heavily", color: "bg-amber-400", width: "w-[60%]" },
  { range: "61–80", label: "High exposure", color: "bg-orange-500", width: "w-[80%]" },
  { range: "81–100", label: "Highly automatable", color: "bg-red-600", width: "w-full" },
];

const stats = [
  { value: "4", label: "AI agents working in parallel" },
  { value: "0–100", label: "Risk score range" },
  { value: "4", label: "Automation exposure bands" },
  { value: "∞", label: "Careers analyzed" },
];

function AnimatedCounter({ value }: { value: string }) {
  return (
    <span className="font-black text-4xl md:text-5xl text-white tracking-tight">
      {value}
    </span>
  );
}

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

      {/* hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        {/* glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)" }}
        />

        <div
          className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/60 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by LangGraph multi-agent pipeline
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            <span className="text-white">Know your</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              automation risk.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed">
            AI is not replacing jobs — it is replacing <em className="text-white/80 not-italic font-medium">tasks</em>.
            Upload your resume and find out exactly which parts of your work are at risk, and what to do about it.
          </p>

          <p className="text-sm text-white/30 mb-12">
            No account required. Takes about 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-white hover:bg-white/90 transition-all duration-200 text-lg"
            >
              Analyze my resume
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-200"
            >
              How it works
            </a>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-xs">
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </section>

      {/* stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <AnimatedCounter value={stat.value} />
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-16">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Three steps to clarity.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Upload & review",
              description: "Drop your resume. We extract the text and let you review and edit it before analysis begins.",
              color: "border-blue-500/30 bg-blue-500/5",
              accent: "text-blue-400",
            },
            {
              step: "02",
              title: "Pipeline runs",
              description: "Four AI agents decompose your role, classify every task, score your risk, and generate recommendations — in real time.",
              color: "border-amber-500/30 bg-amber-500/5",
              accent: "text-amber-400",
            },
            {
              step: "03",
              title: "Get your report",
              description: "A full breakdown: risk score, task classification, AI-resistant strengths, upskill roadmap, and transition paths.",
              color: "border-emerald-500/30 bg-emerald-500/5",
              accent: "text-emerald-400",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border ${item.color} hover:scale-[1.02] transition-transform duration-300`}
            >
              <span className={`text-6xl font-black ${item.accent} opacity-20 absolute top-6 right-6`}>
                {item.step}
              </span>
              <span className={`text-sm font-bold ${item.accent} uppercase tracking-widest`}>
                Step {item.step}
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="mb-16">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Everything you need<br />to stay ahead.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-white font-bold mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* scoring bands */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="mb-16">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">Scoring</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Where do you land?
          </h2>
          <p className="text-white/40 mt-4 max-w-xl">
            Every role gets a score from 0 to 100 based on how automatable each task is. Here's what the bands mean.
          </p>
        </div>

        <div className="space-y-4">
          {bands.map((band, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="text-white/30 text-sm font-mono w-16 shrink-0">{band.range}</span>
              <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${band.color} ${band.width} rounded-lg flex items-center px-4 transition-all duration-700`}
                >
                  <span className="text-white text-sm font-medium">{band.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* disclaimer */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Ethical disclaimer</p>
          <p className="text-white/40 text-sm leading-relaxed">
            AutoRisk AI provides analytical estimates based on task-level automation reasoning.
            It does <span className="text-white/60">not</span> predict job loss, determine employability, or evaluate personal traits.
            Designed for educational and career-planning purposes only.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
          Ready to find out<br />
          <span
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            where you stand?
          </span>
        </h2>
        <p className="text-white/40 mb-10 max-w-lg mx-auto">
          Upload your resume and get your full automation risk report in under a minute.
        </p>
        <Link
          to="/upload"
          className="group inline-flex items-center gap-2 px-10 py-5 rounded-xl font-bold text-black bg-white hover:bg-white/90 transition-all duration-200 text-lg"
        >
          Analyze my resume
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-white/20 text-sm">
          <span>🚦 AutoRisk AI</span>
          <span>Built with LangGraph · FastAPI · React</span>
        </div>
      </footer>
    </div>
  );
}