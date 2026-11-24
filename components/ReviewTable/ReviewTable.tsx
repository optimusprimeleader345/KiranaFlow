"use client";
import { useState } from "react";
import type { MatchedLine, ConfirmedLine } from "@/app/retailer/order/new/page";
import { ReviewRow } from "./ReviewRow";

interface Props {
  lines: MatchedLine[];
  onLinesChange: (lines: MatchedLine[]) => void;
  onConfirm: (lines: ConfirmedLine[]) => void;
  submitting: boolean;
}

export function ReviewTable({ lines, onLinesChange, onConfirm, submitting }: Props) {
  const needsAction = lines.some(
    (l) =>
      l.matchStatus === "not_found" ||
      (l.matchStatus === "needs_review" && !l.product) ||
      l.missingQuantity
  );

  const flaggedCount = lines.filter(
    (l) => l.matchStatus !== "matched" || l.missingQuantity
  ).length;

  function updateLine(index: number, patch: Partial<MatchedLine>) {
    const updated = lines.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onLinesChange(updated);
  }

  function removeLine(index: number) {
    onLinesChange(lines.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    const confirmed: ConfirmedLine[] = lines
      .filter((l) => l.product && l.quantity)
      .map((l) => ({
        rawText: l.rawText,
        productId: l.product!.id,
        quantity: l.quantity!,
        unit: l.unit ?? l.product!.unit,
        matchStatus: l.matchStatus,
        matchScore: l.matchScore,
      }));
    onConfirm(confirmed);
  }

  const totalEstimate = lines.reduce((sum, l) => {
    if (!l.product || !l.quantity) return sum;
    return sum + l.quantity * l.product.pricePerUnit;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Review Order Lines</h2>
          <p className="text-sm text-gray-500">
            {lines.length} item{lines.length !== 1 ? "s" : ""} extracted
            {flaggedCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-700 font-medium">
                · {flaggedCount} need{flaggedCount !== 1 ? "" : "s"} review
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estimated total</p>
          <p className="text-xl font-bold text-gray-900">₹{totalEstimate.toFixed(2)}</p>
        </div>
      </div>

      {lines.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>No lines to review. Try a different order message.</p>
        </div>
      )}

      <div className="space-y-3">
        {lines.map((line, i) => (
          <ReviewRow
            key={i}
            line={line}
            index={i}
            onChange={(patch) => updateLine(i, patch)}
            onRemove={() => removeLine(i)}
          />
        ))}
      </div>

      {lines.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {needsAction ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span>⚠️</span>
                Resolve all flagged lines before confirming
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-green-700 font-medium">
                <span>✅</span>
                All lines reviewed — ready to confirm
              </span>
            )}
          </div>
          <button
            onClick={handleConfirm}
            disabled={needsAction || submitting || lines.length === 0}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="animate-spin">⏳</span> Placing order…</>
            ) : (
              "✅ Place Order"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
