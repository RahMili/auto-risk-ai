import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import { streamAnalysis } from "../api/client";

export default function ReviewPage() {
  const navigate = useNavigate();
  const {
    upload, editedText, roastMode,
    setEditedText, setRoastMode,
    setJobId, addStatus, setReport,
    setIsAnalyzing, setError,
  } = useAnalysisStore();

  if (!upload) {
    navigate("/upload");
    return null;
  }

  function handleAnalyze() {
    // clear previous run first before navigating
    setReport(null);
    setIsAnalyzing(true);
    setError(null);
    useAnalysisStore.getState().statuses.length && useAnalysisStore.setState({ statuses: [] });
    navigate("/results");

    setIsAnalyzing(true);
    setError(null);
    navigate("/results");

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
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Review extracted text
      </h2>
      <p className="text-gray-500 mb-6">
        Edit the text below if anything was missed or misread, then run the analysis.
      </p>

      <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
        <span>{upload.filename}</span>
        <span>{editedText.length} characters</span>
      </div>

      <textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        rows={16}
        className="w-full border border-gray-300 rounded-xl p-4 text-sm text-gray-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-11 h-6 rounded-full transition-colors ${roastMode ? "bg-orange-500" : "bg-gray-200"}`}
            onClick={() => setRoastMode(!roastMode)}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${roastMode ? "translate-x-5 ml-0.5" : "ml-0.5"}`} />
          </div>
          <span className="text-sm text-gray-700">
            🔥 Roast mode {roastMode ? "on" : "off"}
          </span>
        </label>

        <button
          onClick={handleAnalyze}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Run analysis →
        </button>
      </div>
    </div>
  );
}