"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewTable } from "@/components/ReviewTable/ReviewTable";
import { AIBanner } from "@/components/OrderCapture/AIBanner";

export interface MatchedLine {
  rawText: string;
  quantity: number | null;
  unit: string | null;
  missingQuantity: boolean;
  unknownUnit: boolean;
  matchStatus: "matched" | "needs_review" | "not_found";
  matchScore: number;
  product: {
    id: string;
    name: string;
    unit: string;
    pricePerUnit: number;
    sku: string;
  } | null;
  suggestions: Array<{
    id: string;
    name: string;
    unit: string;
    pricePerUnit: number;
    sku: string;
  }>;
  reason: string | null;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [orderText, setOrderText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useState<MatchedLine[] | null>(null);
  const [aiFailed, setAiFailed] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [submitError, setSubmitError] = useState("");

  async function handleExtract() {
    if (!orderText.trim()) return;
    setExtracting(true);
    setExtractError("");
    setLines(null);
    setAiFailed(false);

    try {
      const res = await fetch("/api/order/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      setLines(data.lines);
      setAiFailed(data.aiFailed ?? false);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExtracting(false);
    }
  }

  async function handleConfirm(confirmedLines: ConfirmedLine[]) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: confirmedLines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      router.push(`/retailer/orders?placed=${data.orderId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste your order message below — AI will extract and match products automatically.
        </p>
      </div>

      {aiFailed && <AIBanner />}

      {!lines && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Order Message
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
            placeholder={`e.g.\n10 ctn parle-g\n5 surf excel 1kg\n2 dz maggi\n3 pcs amul ghee`}
            value={orderText}
            onChange={(e) => setOrderText(e.target.value)}
          />

          {extractError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span>⚠️</span>
              <span>{extractError}</span>
              <button
                onClick={handleExtract}
                className="ml-auto underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={extracting || !orderText.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {extracting ? (
              <>
                <span className="animate-spin text-lg">⏳</span> Extracting with AI…
              </>
            ) : (
              "✨ Extract & Match Products"
            )}
          </button>
        </div>
      )}

      {extracting && !lines && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {lines && (
        <>
          <ReviewTable
            lines={lines}
            onLinesChange={setLines}
            onConfirm={handleConfirm}
            submitting={submitting}
          />
          {submitError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {submitError}
            </div>
          )}
          <button
            onClick={() => { setLines(null); setOrderText(""); }}
            className="text-sm text-gray-500 hover:text-gray-900 underline"
          >
            ← Start over
          </button>
        </>
      )}
    </div>
  );
}

export interface ConfirmedLine {
  rawText: string;
  productId: string;
  quantity: number;
  unit: string;
  matchStatus: "matched" | "needs_review" | "not_found";
  matchScore?: number;
}
