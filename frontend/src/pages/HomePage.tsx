import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        🚦 AutoRisk AI
      </h1>
      <p className="text-xl text-gray-500 mb-2 max-w-xl">
        Measure your automation exposure. Future-proof your career.
      </p>
      <p className="text-gray-400 mb-10 max-w-lg">
        Upload your resume and get an AI-powered breakdown of which parts of your job are at risk — and what to do about it.
      </p>
      <Link
        to="/upload"
        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        Analyze my resume
      </Link>
    </div>
  );
}