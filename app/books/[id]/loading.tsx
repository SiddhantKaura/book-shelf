const Loading = () => {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-6 py-16">
      <div className="h-4 w-24 rounded bg-amber-200 dark:bg-amber-900" />
      <div className="mt-6 h-10 w-3/4 rounded bg-amber-200 dark:bg-amber-900" />
      <div className="mt-3 h-5 w-1/3 rounded bg-amber-100 dark:bg-amber-950" />
      <div className="mt-8 space-y-2">
        <div className="h-4 w-full rounded bg-amber-100 dark:bg-amber-950" />
        <div className="h-4 w-full rounded bg-amber-100 dark:bg-amber-950" />
        <div className="h-4 w-2/3 rounded bg-amber-100 dark:bg-amber-950" />
      </div>
    </div>
  );
};

export default Loading;
