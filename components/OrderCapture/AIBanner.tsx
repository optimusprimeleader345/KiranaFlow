export function AIBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800">
      <span className="text-xl mt-0.5" aria-hidden>⚠️</span>
      <div>
        <p className="font-semibold">AI unavailable — using basic text parsing</p>
        <p className="text-amber-700 mt-0.5">
          Results may be less accurate. Please review all lines carefully before confirming.
        </p>
      </div>
    </div>
  );
}
