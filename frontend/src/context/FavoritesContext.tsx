import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api
      .get('/favorites/ids')
      .then((res) => setFavoriteIds(new Set(res.data)))
      .catch(() => {});
  }, [user]);

  const isFavorited = useCallback((listingId: string) => favoriteIds.has(listingId), [favoriteIds]);

  const toggleFavorite = useCallback(
    (listingId: string) => {
      if (!user) return;
      const currentlyFavorited = favoriteIds.has(listingId);

      // optimistic update so the heart responds instantly
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFavorited) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      const request = currentlyFavorited
        ? api.delete(`/favorites/${listingId}`)
        : api.post(`/favorites/${listingId}`);

      request.catch(() => {
        // revert if the request failed
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (currentlyFavorited) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
      });
    },
    [favoriteIds, user]
  );

  return (
    <FavoritesContext.Provider value={{ isFavorited, toggleFavorite }}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
