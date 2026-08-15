import { DUMMY_BOOKS } from "../lib/books";
import { BookBrowser } from "./BooksBrowser";

const Books = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        The Shelf
      </h1>
      <BookBrowser books={DUMMY_BOOKS} />
    </div>
  )
}

export default Books;
