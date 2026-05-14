import { Star } from "lucide-react";

export function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange?: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled || !onChange}
            onClick={() => onChange?.(n)}
            className={`rounded-md p-1 transition ${
              active ? "text-warning" : "text-slate-300 dark:text-slate-600"
            } ${disabled || !onChange ? "cursor-default" : "hover:scale-110"}`}
            aria-label={`${n} stars`}
          >
            <Star className={`h-6 w-6 ${active ? "fill-current" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}
