export default function RoastCard({ roast }: { roast: string }) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
      <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
        <span>🔥</span> Your roast
      </h3>
      <p className="text-orange-800 italic leading-relaxed">{roast}</p>
    </div>
  );
}