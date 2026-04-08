import { useState } from "react";

type Format = "json" | "csv" | "docx";

const formats: { value: Format; label: string; icon: string; desc: string }[] = [
  { value: "json", label: "JSON",  icon: "{ }", desc: "Raw report data" },
  { value: "csv",  label: "CSV",   icon: "⊞",  desc: "Spreadsheet format" },
  { value: "docx", label: "DOCX",  icon: "W",  desc: "Word document" },
];

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function DownloadButton({ jobId }: { jobId: string }) {
  const [selected, setSelected] = useState<Format>("json");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`${BASE_URL}/download/${jobId}?format=${selected}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autorisk-${jobId.slice(0, 8)}.${selected}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Download report</p>

      {/* format selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {formats.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelected(f.value)}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              selected === f.value
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/60"
            }`}
          >
            <span className="block font-mono text-lg mb-1">{f.icon}</span>
            <span className="block text-sm font-bold">{f.label}</span>
            <span className="block text-xs opacity-60 mt-0.5">{f.desc}</span>
          </button>
        ))}
      </div>

      {/* download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-black bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {downloading ? (
          <>
            <span className="animate-spin">⟳</span>
            Downloading...
          </>
        ) : (
          <>
            ↓ Download {selected.toUpperCase()}
            <span className="group-hover:translate-y-0.5 transition-transform duration-200">↓</span>
          </>
        )}
      </button>
    </div>
  );
}