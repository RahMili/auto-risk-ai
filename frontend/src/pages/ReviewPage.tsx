import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";

export default function ReviewPage() {
  const navigate = useNavigate();
  const {
    upload,
    editedText,
    roastMode,
    setEditedText,
    setRoastMode,
    addStatus,
    setReport,
    setIsAnalyzing,
    setError,
    clearRun,
  } = useAnalysisStore();

  if (!upload) {
    navigate("/upload");
    return null;
  }

  function handleAnalyze() {
    clearRun();
    setIsAnalyzing(true);
    navigate("/results");

    import("../api/client").then(({ streamAnalysis }) => {
      streamAnalysis(
        upload!.file_id,
        editedText,
        roastMode,
        (status) => addStatus(status),
        (result) => {
          setReport(JSON.parse(result));
          setIsAnalyzing(false);
        },
        (error) => {
          setError(error);
          setIsAnalyzing(false);
        }
      );
    });
  }

  const wordCount = editedText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editedText.length;

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

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-24">

        {/* header */}
        <div className="mb-10">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">Step 02</p>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
            Review extracted<br />
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              text.
            </span>
          </h1>
          <p className="text-white/40 leading-relaxed max-w-xl">
            We've extracted the text from your resume. Check it over — fix anything that looks wrong before running the analysis.
          </p>
        </div>

        {/* file info bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm">
              📄
            </div>
            <div>
              <p className="text-white text-sm font-medium">{upload.filename}</p>
              <p className="text-white/30 text-xs">{upload.content_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>{wordCount.toLocaleString()} words</span>
            <span className="w-px h-4 bg-white/10" />
            <span>{charCount.toLocaleString()} chars</span>
          </div>
        </div>

        {/* textarea */}
        <div className="relative mb-6">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70 font-mono resize-none focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-200 leading-relaxed placeholder-white/20"
            placeholder="Extracted text will appear here..."
          />
          {/* line count overlay */}
          <div className="absolute bottom-4 right-4 text-white/20 text-xs">
            {editedText.split("\n").length} lines
          </div>
        </div>

        {/* tip */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 mb-8">
          <span className="text-amber-400 mt-0.5">💡</span>
          <p className="text-amber-400/70 text-sm leading-relaxed">
            If something looks garbled or missing — especially from tables, columns, or formatted sections — fix it here. The quality of the analysis depends on the quality of the text.
          </p>
        </div>

        {/* roast toggle + submit */}
        <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02]">

          {/* roast toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRoastMode(!roastMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                roastMode ? "bg-orange-500" : "bg-white/10"
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                roastMode ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
            <div>
              <p className="text-white text-sm font-medium flex items-center gap-2">
                🔥 Roast mode
                {roastMode && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                    on
                  </span>
                )}
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                {roastMode
                  ? "Brace yourself for a technically savage breakdown"
                  : "Enable for a humorous take on your automation risk"}
              </p>
            </div>
          </div>

          {/* submit */}
          <button
            onClick={handleAnalyze}
            disabled={!editedText.trim()}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            Run analysis
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>

        {/* back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/upload")}
            className="text-white/20 hover:text-white/40 text-sm transition-colors"
          >
            ← Upload a different file
          </button>
        </div>
      </div>
    </div>
  );
}