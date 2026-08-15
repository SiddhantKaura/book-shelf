"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Book } from "../../lib/books";
import { useRouter, useSearchParams } from "next/navigation";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ShelfContext } from "../../contexts/shelfContext";

const chunkIntoRows = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

// Approximate height of one row (cover + padding + title/author/description) —
// doesn't need to be exact, just close enough for smooth scroll estimation.
const ROW_HEIGHT_ESTIMATE = 190;

const matchesQuery = (book: Book, normalizedQuery: string): boolean =>
  book.title.toLowerCase().includes(normalizedQuery) ||
  book.author.toLowerCase().includes(normalizedQuery) ||
  book.description.toLowerCase().includes(normalizedQuery);

type Tab = "discover" | "my-picks";

const BookCard = ({ book }: { book: Book }) => (
  <Link
    href={`/books/${book.id}`}
    className="group flex gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900 dark:bg-zinc-900"
  >
    <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded bg-amber-200 dark:bg-amber-950">
      {book.coverUrl && (
        <Image
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          width={80}
          height={112}
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
);

export const BookBrowser = ({ books }: { books: Book[] }) => {
  const q = useSearchParams().get("q");
  const router = useRouter();
  const [query, setQuery] = useState(q ?? "");
  const [tab, setTab] = useState<Tab>("discover");
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { shelfItems } = useContext(ShelfContext);
  const [myPicksBooks, setMyPicksBooks] = useState<Book[]>([]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Discover tab: debounced, URL-driven server search — only relevant while
  // that tab is active, so the other tab doesn't trigger pointless navigations.
  useEffect(() => {
    if (tab !== "discover") return;

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
  }, [query, router, tab]);

  // My Picks tab: shelf data is client-only (localStorage), so it can't come
  // from the server-rendered `books` prop — resolve full details client-side.
  useEffect(() => {
    if (tab !== "my-picks") return;

    let cancelled = false;

    Promise.all(
      shelfItems.map((item) =>
        fetch(`/api/books/${item.bookId}`).then((res) =>
          res.ok ? (res.json() as Promise<Book>) : null
        )
      )
    ).then((results) => {
      if (!cancelled) {
        setMyPicksBooks(results.filter((book): book is Book => book !== null));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [tab, shelfItems]);

  const normalizedQuery = query.trim().toLowerCase();
  const displayedBooks =
    tab === "discover"
      ? books
      : normalizedQuery
        ? myPicksBooks.filter((book) => matchesQuery(book, normalizedQuery))
        : myPicksBooks;

  const rows = chunkIntoRows(displayedBooks, 2);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    setScrollMargin(listContainerRef.current?.offsetTop ?? 0);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 3,
    scrollMargin,
  });

  const tabButtonClass = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-amber-900 text-white dark:bg-amber-100 dark:text-amber-950"
        : "border border-amber-200 text-amber-900 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-200 dark:hover:bg-zinc-900"
    }`;

  const emptyMessage =
    tab === "discover"
      ? `No books found for “${query}”.`
      : shelfItems.length === 0
        ? "Your shelf is empty — add books from Discover."
        : `No picks found for “${query}”.`;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("discover")}
          className={tabButtonClass(tab === "discover")}
        >
          Discover
        </button>
        <button
          type="button"
          onClick={() => setTab("my-picks")}
          className={tabButtonClass(tab === "my-picks")}
        >
          My Picks
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder="Search by title, author, or description..."
        className="mb-8 w-full rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 outline-none transition-colors placeholder:text-amber-700/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-900 dark:text-amber-100 dark:placeholder:text-amber-200/40 dark:focus:ring-amber-900"
      />

      {displayedBooks.length === 0 ? (
        <p className="text-center text-sm text-amber-800/70 dark:text-amber-200/60">
          {emptyMessage}
        </p>
      ) : (
        <div
          ref={listContainerRef}
          style={{ position: "relative", height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                }}
              >
                <div className="grid gap-6 pb-6 sm:grid-cols-2">
                  {row.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
