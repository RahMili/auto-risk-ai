interface Props {
  statuses: string[];
  isAnalyzing: boolean;
}

export default function StatusStream({ statuses, isAnalyzing }: Props) {
  return (
    <div className="space-y-2">
      {statuses.map((status, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
          <span className="text-green-500">✓</span>
          <span>{status}</span>
        </div>
      ))}
      {isAnalyzing && (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="animate-spin">⟳</span>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}