"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { Book } from "../lib/books";

export const BookBrowser = ({ books }: { books: Book[] }) => {
  const [query, setQuery] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBooks = normalizedQuery
    ? books.filter(
        (book) =>
          book.title.toLowerCase().includes(normalizedQuery) ||
          book.author.toLowerCase().includes(normalizedQuery) ||
          book.description.toLowerCase().includes(normalizedQuery)
      )
    : books;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder="Search by title, author, or description..."
        className="mb-8 w-full rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 outline-none transition-colors placeholder:text-amber-700/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-900 dark:text-amber-100 dark:placeholder:text-amber-200/40 dark:focus:ring-amber-900"
      />

      {filteredBooks.length === 0 ? (
        <p className="text-center text-sm text-amber-800/70 dark:text-amber-200/60">
          No books found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900 dark:bg-zinc-900"
            >
              <h2 className="font-serif text-xl font-semibold text-amber-950 group-hover:underline dark:text-amber-100">
                {book.title}
              </h2>
              <p className="mt-1 text-sm italic text-amber-800/80 dark:text-amber-200/70">
                {book.author}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-amber-900/80 dark:text-amber-100/60">
                {book.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
