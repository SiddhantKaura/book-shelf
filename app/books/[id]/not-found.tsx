import Link from "next/link";

const NotFound = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="font-serif text-3xl font-bold text-amber-950 dark:text-amber-100">
        Book not found
      </h1>
      <p className="text-amber-900/80 dark:text-amber-100/70">
        We couldn&apos;t find the book you were looking for. It may have been
        removed, or the link might be incorrect.
      </p>
      <Link
        href="/books"
        className="mt-2 rounded-full bg-amber-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-800 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
      >
        Browse All Books
      </Link>
    </div>
  );
};

export default NotFound;
