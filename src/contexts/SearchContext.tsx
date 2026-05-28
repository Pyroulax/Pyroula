import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchActive: boolean;
  setSearchActive: (a: boolean) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
  searchActive: false,
  setSearchActive: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchActive, setSearchActive }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
