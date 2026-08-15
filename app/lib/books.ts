export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
};

export const DUMMY_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    coverUrl: "https://covers.openlibrary.org/b/id/8267078-L.jpg",
    description:
      "A classic guide to software craftsmanship, covering practical tips for becoming a more effective and adaptable programmer.",
  },
  {
    id: "2",
    title: "Clean Code",
    author: "Robert C. Martin",
    coverUrl: "https://covers.openlibrary.org/b/id/6980468-L.jpg",
    description:
      "A handbook of agile software craftsmanship that teaches how to write readable, maintainable, and clean code.",
  },
  {
    id: "3",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "https://covers.openlibrary.org/b/id/6979861-L.jpg",
    description:
      "Bilbo Baggins is swept into an epic quest to reclaim a lost dwarven kingdom from the dragon Smaug.",
  },
  {
    id: "4",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    description:
      "A sweeping narrative of how Homo sapiens came to dominate the world, from the Cognitive Revolution to the present.",
  },
  {
    id: "5",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverUrl: "https://covers.openlibrary.org/b/id/12921699-L.jpg",
    description:
      "A lone astronaut must save humanity from extinction in this science-driven thriller full of problem-solving and wit.",
  },
];
