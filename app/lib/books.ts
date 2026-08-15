import he from "he";
import { getCustomBooks } from "./customBooks";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
};

type ITunesEbook = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  description?: string;
};

export type ShelfEntry = {
    bookId: string;
    status: "want-to-read" | "reading" | "finished";
    rating?: number;
    review?: string;
}

// iTunes descriptions contain both HTML tags (<b>, <i>) and HTML entities
// (&#xa0;, &amp;, ...) — two separate things. Strip tags first (while they're
// still literal "<...>" text), then decode entities into real characters.
const cleanDescription = (html: string) => he.decode(html.replace(/<[^>]+>/g, ""));

const toBook = (item: ITunesEbook): Book => ({
  id: String(item.trackId),
  title: item.trackName,
  author: item.artistName,
  // Apple's artwork URLs encode size in the path (e.g. "100x100bb") — swap in a bigger size.
  coverUrl: item.artworkUrl100?.replace("100x100", "600x600") ?? "",
  description: item.description ? cleanDescription(item.description) : "",
});

export const searchBooks = async (
  query: string = "bestseller",
  limit: number = 50
): Promise<Book[]> => {
  const term = query.trim() || "bestseller";
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=ebook&limit=${limit}`, {next: {revalidate: 3600}}
  );
  const data = await res.json();
  const results: ITunesEbook[] = data.results ?? [];
  return results.map(toBook);
};

export const getBook = async (id: string): Promise<Book | undefined> => {
  const customBook = getCustomBooks().find((book) => book.id === id);
  if (customBook) {
    return customBook;
  }

  const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`, {next: {revalidate: 3600}});
  const data = await res.json();
  const item: ITunesEbook | undefined = data.results?.[0];
  return item ? toBook(item) : undefined;
};

const matchesQuery = (book: Book, normalizedQuery: string): boolean =>
  book.title.toLowerCase().includes(normalizedQuery) ||
  book.author.toLowerCase().includes(normalizedQuery) ||
  book.description.toLowerCase().includes(normalizedQuery);

export const searchAllBooks = async (
  query: string,
  limit: number = 50
): Promise<Book[]> => {
  const apiResults = await searchBooks(query, limit);
  const customResults = getCustomBooks();
  const normalizedQuery = query.trim().toLowerCase();
  const matchingCustom = normalizedQuery
    ? customResults.filter((book) => matchesQuery(book, normalizedQuery))
    : customResults;

  return [...matchingCustom, ...apiResults];
};
