import Link from "next/link";
import { DUMMY_BOOKS } from "../lib/books";

const Books = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        The Shelf
      </h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {DUMMY_BOOKS.map((book) => (
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
    </div>
  )
}

export default Books;
