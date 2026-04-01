import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "../store/analysisStore";
import ScoreGauge from "../components/analysis/ScoreGauge";
import TaskBreakdown from "../components/analysis/TaskBreakdown";
import RecommendationPanel from "../components/analysis/RecommendationPanel";
import RoastCard from "../components/analysis/RoastCard";
import StatusStream from "../components/shared/StatusStream";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { report, statuses, isAnalyzing, error, reset } = useAnalysisStore();

  if (!report && !isAnalyzing && !error) {
    navigate("/upload");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

      {/* streaming status */}
      {(isAnalyzing || (!report && !error)) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Analyzing your profile...</h3>
          <StatusStream statuses={statuses} isAnalyzing={isAnalyzing} />
        </div>
      )}

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold mb-1">Analysis failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* results */}
      {report && (
        <>
          {/* header */}
          <div className="text-center">
            <p className="text-gray-500 mb-1">Results for</p>
            <h2 className="text-3xl font-bold text-gray-900">{report.profile.name}</h2>
            <p className="text-gray-500">{report.profile.current_role}</p>
          </div>

          {/* score + breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-gray-200 rounded-xl p-8">
            <ScoreGauge risk={report.risk} />
            <TaskBreakdown risk={report.risk} />
          </div>

          {/* roast */}
          {report.roast && <RoastCard roast={report.roast} />}

          {/* recommendations */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recommendations</h3>
            <RecommendationPanel recommendations={report.recommendations} />
          </div>

          {/* analyze another */}
          <div className="text-center pt-4">
            <button
              onClick={() => { reset(); navigate("/upload"); }}
              className="text-gray-500 hover:text-gray-900 text-sm underline transition-colors"
            >
              Analyze another resume
            </button>
          </div>
        </>
      )}
    </div>
  );
}