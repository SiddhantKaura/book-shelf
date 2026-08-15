"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export const AddBookClientForm = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); 
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const onSubmit = async (formData: FormData) => {
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description") ?? "";

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      typeof description !== "string"
    ) {
      return;
    }
    setIsSubmitting(true);
    await fetch("/api/custom-books", { method: "POST", body: formData });
    setIsSubmitting(false);
    formRef?.current?.reset();
    router.refresh();
  };

  return (
    <div>
      <form action={onSubmit} ref={formRef} className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="client-title"
              className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
            >
              Title
            </label>
            <input
              id="client-title"
              type="text"
              name="title"
              required
              className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
            />
          </div>
          <div>
            <label
              htmlFor="client-author"
              className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
            >
              Author
            </label>
            <input
              id="client-author"
              type="text"
              name="author"
              required
              className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
            />
          </div>
        </div>
        <div className="mt-4">
          <label
            htmlFor="client-description"
            className="mb-1 block text-sm font-medium text-amber-900 dark:text-amber-200"
          >
            Description
          </label>
          <textarea
            id="client-description"
            name="description"
            rows={3}
            className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-900 dark:bg-zinc-950 dark:text-amber-100"
          />
        </div>
        <button
          disabled={isSubmitting}
          type="submit"
          className="mt-4 rounded-full bg-amber-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-200"
        >
          {isSubmitting ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
};
