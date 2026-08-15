import { NextResponse } from "next/server";
import { addCustomBook, getCustomBooks } from "@/app/lib/customBooks";

export const GET = async () => {
  return NextResponse.json(getCustomBooks());
};

export const POST = async (request: Request) => {
    const formData = await request.formData();
    const title = formData.get("title");
    const author = formData.get("author");
    const description = formData.get("description");

    if (typeof title !== "string" || !title.trim() || typeof author !== "string" || !author.trim()) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
    }

    addCustomBook({
      title,
      author,
      description: typeof description === "string" ? description : "",
    });
    // 303: correct status for POST -> redirect -> GET; tells the browser to
    // switch to GET when following, avoiding an accidental form resubmission
    // on refresh.
    return NextResponse.redirect(new URL("/books", request.url), 303);
}
