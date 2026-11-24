"use client";

interface Product {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  sku: string;
}

interface Props {
  suggestions: Product[];
  currentProduct: Product | null;
  onSelect: (product: Product) => void;
}

export function SuggestionPicker({ suggestions, currentProduct, onSelect }: Props) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-600">Top suggestions — pick one:</p>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`text-left border rounded-lg px-3 py-2 text-xs hover:border-blue-400 hover:bg-blue-50 transition-colors ${
              currentProduct?.id === s.id
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-400"
                : "border-gray-300 bg-white"
            }`}
          >
            <p className="font-semibold text-gray-900 truncate">{s.name}</p>
            <p className="text-gray-500">₹{s.pricePerUnit} / {s.unit}</p>
            <p className="text-gray-400 font-mono truncate">{s.sku}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
