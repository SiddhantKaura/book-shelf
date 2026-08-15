import Link from "next/link";
import {getBook } from "@/app/lib/books";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShelfControls } from "../ShelfControls";

interface BookProps {
    params: Promise<{id: string}>
};

export async function generateMetadata({ params }: BookProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return { title: "Book not found" };
  }

  return {
    title: book.title,
    description: book.description || `${book.title} by ${book.author}`,
  };
}

const Book = async ({params}: BookProps) => {
    const {id} = await params;
    const book = await getBook(id);

    if(!book){
        notFound();
    }
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <Link
        href="/books"
        className="text-sm text-amber-800 hover:underline dark:text-amber-300"
      >
        ← Back to shelf
      </Link>
      <h1 className="mt-4 font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        {book.title}
      </h1>
      <p className="mt-2 text-lg italic text-amber-800/80 dark:text-amber-200/70">
        {book.author}
      </p>
      <p className="mt-6 leading-relaxed text-amber-900/90 dark:text-amber-100/70">
        {book.description}
      </p>
      <ShelfControls bookId={book.id} />
    </div>
  )
}

export default Book;
