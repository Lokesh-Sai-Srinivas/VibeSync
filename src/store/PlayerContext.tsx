import { SongMetadata } from '@/src/services/MusicAPI';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface PlayerState {
    currentTrack: SongMetadata | null;
    isPlaying: boolean;
    setCurrentTrack: (track: SongMetadata | null) => void;
    setIsPlaying: (playing: boolean) => void;
}

const PlayerContext = createContext<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    setCurrentTrack: () => { },
    setIsPlaying: () => { },
});

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<SongMetadata | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, setCurrentTrack, setIsPlaying }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayerStore() {
    return useContext(PlayerContext);
}
