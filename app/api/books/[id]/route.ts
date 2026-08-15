import { NextResponse } from "next/server";
import { getBook } from "@/app/lib/books";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json(book);
};
