import { searchBooks } from "../lib/books";
import { BookBrowser } from "./BooksBrowser";

const Books = async({searchParams}: {searchParams: Promise<{q?:string}>}) => {
    const {q} = await searchParams;
    const books = await searchBooks(q ?? "");
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        The Shelf
      </h1>
      <BookBrowser books={books} />
    </div>
  )
}

export default Books;
