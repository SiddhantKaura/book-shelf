"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ShelfContext } from "../../contexts/shelfContext";
import { Book, ShelfEntry } from "../../lib/books";

const STATUS_ORDER: ShelfEntry["status"][] = ["reading", "want-to-read", "finished"];
const STATUS_LABELS: Record<ShelfEntry["status"], string> = {
  reading: "Reading",
  "want-to-read": "Want to Read",
  finished: "Finished",
};

export default function Shelf() {
  const { shelfItems, removeShelfItem } = useContext(ShelfContext);
  const [books, setBooks] = useState<Record<string, Book>>({});

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      shelfItems.map((item) =>
        fetch(`/api/books/${item.bookId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((book: Book | null) => [item.bookId, book] as const)
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, Book> = {};
      for (const [id, book] of results) {
        if (book) map[id] = book;
      }
      setBooks(map);
    });

    return () => {
      cancelled = true;
    };
  }, [shelfItems]);

  if (shelfItems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
          My Shelf
        </h1>
        <p className="text-amber-900/80 dark:text-amber-100/70">
          Your shelf is empty.{" "}
          <Link href="/books" className="underline">
            Browse books
          </Link>{" "}
          to add some.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        My Shelf
      </h1>
      {STATUS_ORDER.map((status) => {
        const entries = shelfItems.filter((item) => item.status === status);
        if (entries.length === 0) return null;

        return (
          <section key={status} className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-amber-950 dark:text-amber-100">
              {STATUS_LABELS[status]}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {entries.map((entry) => {
                const book = books[entry.bookId];
                if (!book) return null;

                return (
                  <div
                    key={entry.bookId}
                    className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-zinc-900"
                  >
                    <Link href={`/books/${entry.bookId}`} className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg font-semibold text-amber-950 hover:underline dark:text-amber-100">
                        {book.title}
                      </h3>
                      <p className="mt-1 text-sm italic text-amber-800/80 dark:text-amber-200/70">
                        {book.author}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeShelfItem(entry.bookId)}
                      className="shrink-0 text-sm text-red-700 hover:underline dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
