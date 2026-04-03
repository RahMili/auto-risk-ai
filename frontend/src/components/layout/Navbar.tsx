import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl">🚦</span>
        <span className="font-black text-white tracking-tight">AutoRisk AI</span>
      </Link>
      <Link
        to="/upload"
        className="text-sm font-medium text-white/60 hover:text-white transition-colors"
      >
        Analyze Resume
      </Link>
    </nav>
  );
}