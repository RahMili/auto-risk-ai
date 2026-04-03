import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../api/client";
import { useAnalysisStore } from "../store/analysisStore";

const ACCEPTED_TYPES = [
  { ext: "PDF", desc: "Adobe PDF Document" },
  { ext: "DOCX", desc: "Microsoft Word Document" },
  { ext: "TXT", desc: "Plain Text File" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const setUpload = useAnalysisStore((s) => s.setUpload);

  async function handleFile(file: File) {
    setSelectedFile(file);
    setLoading(true);
    setError(null);
    try {
      const result = await uploadResume(file);
      setUpload(result);
      navigate("/review");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setLoading(false);
      setSelectedFile(null);
    }
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

      <div className="relative max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* header */}
        <div className="mb-12">
          <p className="text-white/30 text-sm uppercase tracking-widest mb-3">Step 01</p>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
            Upload your<br />
            <span
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              resume.
            </span>
          </h1>
          <p className="text-white/40 leading-relaxed">
            We'll extract the text automatically. You'll get a chance to review and edit it before the analysis starts.
          </p>
        </div>

        {/* drop zone */}
        <div
          onClick={() => !loading && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!loading) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && !loading) handleFile(file);
          }}
          className={`relative rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 group
            ${dragging
              ? "border-orange-500/60 bg-orange-500/5 scale-[1.01]"
              : loading
              ? "border-white/10 bg-white/[0.02] cursor-not-allowed"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
        >
          {/* glow on drag */}
          {dragging && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: "inset 0 0 60px rgba(249,115,22,0.1)" }}
            />
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  📄
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">
                  {selectedFile?.name}
                </p>
                <p className="text-white/40 text-sm animate-pulse">
                  Extracting text...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-3xl transition-transform duration-300 ${dragging ? "scale-110" : "group-hover:scale-105"}`}>
                {dragging ? "⬇️" : "📄"}
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">
                  {dragging ? "Drop it here" : "Drop your resume here"}
                </p>
                <p className="text-white/40 text-sm">
                  or <span className="text-orange-400 group-hover:text-orange-300 transition-colors">click to browse</span>
                </p>
              </div>
              <p className="text-white/20 text-xs">Max 5MB</p>
            </div>
          )}
        </div>

        {/* error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
            <span className="text-red-400 mt-0.5">⚠</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* accepted formats */}
        <div className="mt-8">
          <p className="text-white/20 text-xs uppercase tracking-widest mb-4">Accepted formats</p>
          <div className="grid grid-cols-3 gap-3">
            {ACCEPTED_TYPES.map((type) => (
              <div
                key={type.ext}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center"
              >
                <span className="text-white font-black text-lg block mb-1">{type.ext}</span>
                <span className="text-white/30 text-xs">{type.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* what happens next */}
        <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4">What happens next</p>
          <div className="space-y-3">
            {[
              { icon: "🔍", text: "Text is extracted from your file" },
              { icon: "✏️", text: "You review and edit the extracted text" },
              { icon: "🤖", text: "4 AI agents analyze your profile in real time" },
              { icon: "📊", text: "You get a full automation risk report" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{item.icon}</span>
                <span className="text-white/50 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* privacy note */}
        <p className="text-center text-white/20 text-xs mt-8">
          Your resume is processed securely. We don't store or share your personal data beyond what's needed for analysis.
        </p>
      </div>
    </div>
  );
}