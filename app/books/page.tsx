import { searchBooks } from "../lib/books";
import { getCustomBooks } from "../lib/customBooks";
import { addBookAction } from "./actions";
// Kept for reference/learning — see LEARNINGS.md Phase 5 for the three-way
// comparison (Server Action vs. traditional form vs. client-side fetch).
// import { AddBookClientForm } from "./AddBookClientForm";
import { BookBrowser } from "./BooksBrowser";

const Books = async({searchParams}: {searchParams: Promise<{q?:string}>}) => {
    const {q} = await searchParams;
    const books = await searchBooks(q ?? "");
    const customBooks = getCustomBooks();
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        The Shelf
      </h1>
      <details className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-zinc-900">
        <summary className="cursor-pointer font-serif text-lg font-semibold text-amber-950 dark:text-amber-100">
          Add a book (Server Action)
        </summary>
        <form action={addBookAction} className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              required
              className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
            />
          </div>
          <div>
            <label
              htmlFor="author"
              className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
            >
              Author
            </label>
            <input
              id="author"
              type="text"
              name="author"
              required
              className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
            />
          </div>
        </div>
        <div className="mt-4">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
          />
        </div>
        <button
          type="submit"
          className="mt-4 rounded-full bg-amber-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
        >
          Add Book
        </button>
        </form>
      </details>
      {/* Kept for reference/learning, not part of the live app — see
          LEARNINGS.md Phase 5 for the three-way comparison.

      <details className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-zinc-900">
        <summary className="cursor-pointer font-serif text-lg font-semibold text-amber-950 dark:text-amber-100">
          Add a book (traditional form, no JS)
        </summary>
        <form action={"/api/custom-books"} method="POST" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="trad-title"
                className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
              >
                Title
              </label>
              <input
                id="trad-title"
                type="text"
                name="title"
                required
                className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
              />
            </div>
            <div>
              <label
                htmlFor="trad-author"
                className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
              >
                Author
              </label>
              <input
                id="trad-author"
                type="text"
                name="author"
                required
                className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="trad-description"
              className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
            >
              Description
            </label>
            <textarea
              id="trad-description"
              name="description"
              rows={3}
              className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-amber-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
          >
            Add Book
          </button>
        </form>
      </details>
      <details className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-zinc-900">
        <summary className="cursor-pointer font-serif text-lg font-semibold text-amber-950 dark:text-amber-100">
          Add a book (client-side fetch)
        </summary>
        <AddBookClientForm />
      </details>
      */}
      <BookBrowser books={[...customBooks, ...books]} />
    </div>
  )
}

export default Books;
