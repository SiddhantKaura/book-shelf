const Loading = () => {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse px-6 py-16">
      <div className="h-4 w-24 rounded bg-zinc-300 dark:bg-zinc-700" />
      <div className="mt-6 h-10 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700" />
      <div className="mt-3 h-6 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      {/* Real descriptions are unclamped and often run long — reserve more,
          taller lines so loaded content doesn't jump noticeably in height. */}
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
};

export default Loading;
