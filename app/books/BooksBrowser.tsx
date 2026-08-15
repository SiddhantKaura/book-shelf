"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Book } from "../lib/books";
import { useRouter, useSearchParams } from "next/navigation";

export const BookBrowser = ({ books }: { books: Book[] }) => {
  const q = useSearchParams().get("q");
  const router = useRouter();
  const [query, setQuery] = useState(q ?? "");
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      router.replace(`/books?${params.toString()}`, { scroll: false });
    }, 400);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [query, router]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder="Search by title, author, or description..."
        className="mb-8 w-full rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 outline-none transition-colors placeholder:text-amber-700/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-900 dark:text-amber-100 dark:placeholder:text-amber-200/40 dark:focus:ring-amber-900"
      />

      {books.length === 0 ? (
        <p className="text-center text-sm text-amber-800/70 dark:text-amber-200/60">
          No books found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group flex gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900 dark:bg-zinc-900"
            >
              <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded bg-amber-200 dark:bg-amber-950">
                {book.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- switching to next/image in Phase 7
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-semibold text-amber-950 group-hover:underline dark:text-amber-100">
                  {book.title}
                </h2>
                <p className="mt-1 text-sm italic text-amber-800/80 dark:text-amber-200/70">
                  {book.author}
                </p>
                <p className="mt-3 line-clamp-3 text-sm text-amber-900/80 dark:text-amber-100/60">
                  {book.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
