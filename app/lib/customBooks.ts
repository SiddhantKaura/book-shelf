import { Book } from "./books";
import prisma from "./prisma";
import type { CustomBook } from "../generated/prisma/client";

export const getCustomBooks = (): Promise<CustomBook[]> =>
  prisma.customBook.findMany();

export const addCustomBook = ({
  title,
  author,
  description,
}: Omit<Book, "id" | "coverUrl">): Promise<CustomBook> => {
  const newBook: CustomBook = {
    id: crypto.randomUUID(),
    title,
    author,
    description,
    coverUrl: "",
  };
  return prisma.customBook.create({ data: newBook });
};
