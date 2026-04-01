import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🚦</span>
        <span className="font-bold text-gray-900 text-lg">AutoRisk AI</span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <Link to="/upload" className="hover:text-gray-900 transition-colors">
          Analyze Resume
        </Link>
      </div>
    </nav>
  );
}