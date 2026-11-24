"use client";
import { useState } from "react";
import type { MatchedLine } from "@/app/retailer/order/new/page";
import { SuggestionPicker } from "./SuggestionPicker";

interface Props {
  line: MatchedLine;
  index: number;
  onChange: (patch: Partial<MatchedLine>) => void;
  onRemove: () => void;
}

const STATUS_CONFIG = {
  matched: {
    border: "border-green-300",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-800",
    icon: "✅",
    label: "Matched",
  },
  needs_review: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    icon: "⚠️",
    label: "Needs Review",
  },
  not_found: {
    border: "border-red-300",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-800",
    icon: "❌",
    label: "Not Found",
  },
};

export function ReviewRow({ line, index, onChange, onRemove }: Props) {
  const [editQty, setEditQty] = useState(false);
  const [localQty, setLocalQty] = useState(String(line.quantity ?? ""));

  const effectiveStatus: MatchedLine["matchStatus"] =
    line.missingQuantity && line.matchStatus === "matched"
      ? "needs_review"
      : line.matchStatus;

  const cfg = STATUS_CONFIG[effectiveStatus];

  function commitQty() {
    const n = parseFloat(localQty);
    if (!isNaN(n) && n > 0) {
      onChange({ quantity: n, missingQuantity: false });
    }
    setEditQty(false);
  }

  return (
    <div
      className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4 space-y-3`}
      role="listitem"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            aria-label={cfg.label}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
          >
            <span role="img" aria-label={cfg.label}>{cfg.icon}</span>
            {cfg.label}
          </span>
          <span className="text-sm font-medium text-gray-800 font-mono">
            &ldquo;{line.rawText}&rdquo;
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 text-sm shrink-0"
          aria-label="Remove line"
        >
          ✕
        </button>
      </div>

      {/* Reason banner (not_found / needs_review) */}
      {line.reason && (
        <p className="text-xs text-amber-800 font-medium flex items-start gap-1.5">
          <span aria-hidden>ℹ️</span>
          {line.reason}
        </p>
      )}

      {/* Quantity + unit */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Qty:</span>
          {editQty ? (
            <input
              autoFocus
              className="w-20 border border-blue-400 rounded px-1.5 py-0.5 text-sm"
              value={localQty}
              onChange={(e) => setLocalQty(e.target.value)}
              onBlur={commitQty}
              onKeyDown={(e) => { if (e.key === "Enter") commitQty(); }}
            />
          ) : (
            <button
              onClick={() => { setEditQty(true); setLocalQty(String(line.quantity ?? "")); }}
              className={`font-semibold px-2 py-0.5 rounded hover:bg-white/60 border ${line.missingQuantity ? "border-red-400 text-red-700 bg-red-100" : "border-transparent"}`}
            >
              {line.missingQuantity ? "⚠ Missing" : line.quantity}
            </button>
          )}
        </div>
        <span className="text-gray-500">
          {line.unit ?? <span className="text-gray-400 italic">no unit</span>}
        </span>
        {line.product && (
          <span className="text-gray-400">→</span>
        )}
        {line.product && (
          <span className="font-medium text-gray-800">{line.product.name}</span>
        )}
        {line.product && (
          <span className="text-gray-500 ml-auto">
            ₹{line.product.pricePerUnit} / {line.product.unit}
          </span>
        )}
      </div>

      {/* Suggestions */}
      {(effectiveStatus === "needs_review" || effectiveStatus === "not_found") && line.suggestions.length > 0 && (
        <SuggestionPicker
          suggestions={line.suggestions}
          currentProduct={line.product}
          onSelect={(product) =>
            onChange({
              product,
              matchStatus: "matched",
              reason: null,
            })
          }
        />
      )}

      {/* Confirmed product display */}
      {effectiveStatus === "matched" && line.product && !line.missingQuantity && (
        <div className="text-xs text-green-700">
          SKU: {line.product.sku} · Score: {(line.matchScore * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
