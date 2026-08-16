"use server";

import { revalidatePath } from "next/cache";
import { addCustomBook } from "../../lib/customBooks";

export const addBookAction = async (formData:  FormData) => {
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description") ?? "";

    if (typeof title !== "string" || !title.trim() || typeof author !== "string" || !author.trim() || typeof description !== "string") {
      return;
    }
    await addCustomBook({title, author, description});
    revalidatePath('/books');
};