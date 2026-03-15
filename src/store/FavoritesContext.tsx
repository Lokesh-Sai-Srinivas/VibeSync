/**
 * Favorites store using React Context.
 * Favorites are kept in-memory during the app session.
 * Persistence requires @react-native-async-storage/async-storage (run: npx expo install @react-native-async-storage/async-storage)
 */
import { SongMetadata } from '@/src/services/MusicAPI';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

// ---------- Types ----------
interface FavoritesState {
    favorites: SongMetadata[];
    isFavorite: (id: string) => boolean;
    toggleFavorite: (track: SongMetadata) => void;
    clearFavorites: () => void;
}

// ---------- Context ----------
const FavoritesContext = createContext<FavoritesState>({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: () => { },
    clearFavorites: () => { },
});

// ---------- Provider ----------
export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<SongMetadata[]>([]);

    const isFavorite = useCallback(
        (id: string) => favorites.some((f) => f.id === id),
        [favorites]
    );

    const toggleFavorite = useCallback((track: SongMetadata) => {
        setFavorites((prev) => {
            const exists = prev.some((f) => f.id === track.id);
            return exists ? prev.filter((f) => f.id !== track.id) : [track, ...prev];
        });
    }, []);

    const clearFavorites = useCallback(() => setFavorites([]), []);

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

// ---------- Hook ----------
export function useFavorites() {
    return useContext(FavoritesContext);
}
