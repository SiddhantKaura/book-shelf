"use client";

import { useContext } from "react";
import { ShelfContext } from "../../contexts/shelfContext";
import { ShelfEntry } from "../../lib/books";

const STATUS_OPTIONS: { value: ShelfEntry["status"]; label: string }[] = [
  { value: "want-to-read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
];

export const ShelfControls = ({ bookId }: { bookId: string }) => {
  const { shelfItems, addToShelf, updateShelfItem, removeShelfItem } =
    useContext(ShelfContext);
  const entry = shelfItems.find((item) => item.bookId === bookId);

  const setStatus = (status: ShelfEntry["status"]) => {
    if (entry) {
      updateShelfItem({ ...entry, status });
    } else {
      addToShelf({ bookId, status });
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setStatus(option.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            entry?.status === option.value
              ? "bg-amber-900 text-white dark:bg-amber-100 dark:text-amber-950"
              : "border border-amber-200 text-amber-900 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-200 dark:hover:bg-zinc-900"
          }`}
        >
          {option.label}
        </button>
      ))}
      {entry && (
        <button
          type="button"
          onClick={() => removeShelfItem(bookId)}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Remove from Shelf
        </button>
      )}
    </div>
  );
};
