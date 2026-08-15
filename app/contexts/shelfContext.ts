import { createContext } from "react";
import { ShelfEntry } from "../lib/books";

type ShelfContextType = {
    shelfItems: ShelfEntry[],
    addToShelf: (item: ShelfEntry) => void;
    updateShelfItem: (item: ShelfEntry) => void;
    removeShelfItem: (id: string) => void;
}


export const ShelfContext = createContext<ShelfContextType>({
    shelfItems: [],
    addToShelf: () => null,
    updateShelfItem: () => null,
    removeShelfItem: () => null
});
