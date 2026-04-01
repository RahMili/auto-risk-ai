import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../api/client";
import { useAnalysisStore } from "../../store/analysisStore";

export default function UploadForm() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUpload = useAnalysisStore((s) => s.setUpload);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadResume(file);
      setUpload(result);
      navigate("/review");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <div className="text-4xl mb-4">📄</div>
        <p className="text-gray-700 font-medium mb-1">
          Drop your resume here or click to browse
        </p>
        <p className="text-gray-400 text-sm">PDF, DOCX, or TXT — max 5MB</p>
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
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 text-gray-600">
          <span className="animate-spin text-xl">⟳</span>
          <span>Extracting text from your resume...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}