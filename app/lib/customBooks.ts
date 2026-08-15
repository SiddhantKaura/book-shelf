import fs from "fs";
import path from "path";
import { Book } from "./books";

// TEMP stand-in for a real database. Route Handlers and pages/Server Actions
// can each get separate compiled module instances in Next.js, so a plain
// in-memory array isn't reliably shared between them (confirmed empirically:
// a POST via the Route Handler and a GET via the page logged different
// instance ids for this same module). A JSON file on disk lives outside the
// JS module system, so every entry point reads/writes the same data. Still
// not a real database — no concurrent-write safety, no real querying — a
// genuine DB (with Prisma/etc.) replaces this when the backend phase starts.
const DATA_FILE = path.join(process.cwd(), "data", "custom-books.json");

const SEED_BOOKS: Book[] = [
  {
    id: "234",
    title: "My custom Book",
    author: "Sid",
    coverUrl: "nothing",
    description: "Only for coders",
  },
];

const readCustomBooks = (): Book[] => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return SEED_BOOKS;
  }
};

const writeCustomBooks = (books: Book[]) => {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
};

export const getCustomBooks = (): Book[] => readCustomBooks();

export const addCustomBook = ({
  title,
  author,
  description,
}: Omit<Book, "id" | "coverUrl">): Book => {
  const books = readCustomBooks();
  const newBook: Book = {
    id: crypto.randomUUID(),
    title,
    author,
    description,
    coverUrl: "nothing",
  };
  books.push(newBook);
  writeCustomBooks(books);
  return newBook;
};
