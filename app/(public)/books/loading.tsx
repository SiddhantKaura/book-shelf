const BookCardSkeleton = () => (
  <div className="flex animate-pulse gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-zinc-900">
    <div className="h-28 w-20 flex-shrink-0 rounded bg-zinc-300 dark:bg-zinc-700" />
    <div className="min-w-0 flex-1 space-y-2">
      {/* Two lines here since real titles often wrap to a second line. */}
      <div className="h-5 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700" />
      <div className="h-5 w-1/3 rounded bg-zinc-300 dark:bg-zinc-700" />
      <div className="mt-2 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  </div>
);

const Loading = () => {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-amber-950 dark:text-amber-100">
        The Shelf
      </h1>
      <div className="mb-8 h-12 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default Loading;
