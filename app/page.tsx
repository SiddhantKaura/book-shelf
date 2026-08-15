import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center font-sans dark:bg-black">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        BookShelf
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Track what you&apos;re reading, rate what you&apos;ve finished, and
        discover your next favorite book.
      </p>
      <Link
        href="/books"
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Browse Books
      </Link>
    </div>
  );
}
