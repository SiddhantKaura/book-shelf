"use client";

import { useEffect, useState } from "react";
import { ShelfContext } from "./contexts/shelfContext";
import { ShelfEntry } from "./lib/books";

export const ShelfProvider = ({ children }: { children: React.ReactNode }) => {
  const [shelfList, setShelfList] = useState<ShelfEntry[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("shelf");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShelfList(data ? JSON.parse(data) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("shelf", JSON.stringify(shelfList));
  }, [shelfList]);

  const addToShelf = (item: ShelfEntry) => {
    setShelfList((prev) => [...prev, item]);
  };

  const updateShelfItem = (item: ShelfEntry) => {
    setShelfList((prev) =>
      prev.map((it) => (it.bookId === item.bookId ? item : it))
    );
  };

  const removeShelfItem = (id: string) => {
    setShelfList((prev) => prev.filter((it) => it.bookId !== id));
  };

  return (
    <ShelfContext
      value={{
        shelfItems: shelfList,
        addToShelf,
        updateShelfItem,
        removeShelfItem,
      }}
    >
      {children}
    </ShelfContext>
  );
};
