import { Platform } from 'react-native';
import { MusicAPI, SongMetadata } from './MusicAPI';

// Safely load react-native-track-player once at module level
let _TrackPlayer: any = null;
let _State: any = null;
let _Capability: any = null;
let _RepeatMode: any = null;
let _AppKilledPlaybackBehavior: any = null;

if (Platform.OS !== 'web') {
    try {
        const mod = require('react-native-track-player');
        // v4 exports: default export is TrackPlayer, named exports for enums
        _TrackPlayer = mod.default || mod;
        _State = mod.State || null;
        _Capability = mod.Capability || null;
        _RepeatMode = mod.RepeatMode || null;
        _AppKilledPlaybackBehavior = mod.AppKilledPlaybackBehavior || null;
    } catch (e) {
        console.warn('react-native-track-player not available:', e);
    }
}

// Simple in-memory state dispatchers so MiniPlayer can update
let _currentTrackSetter: ((t: SongMetadata | null) => void) | null = null;
let _isPlayingSetter: ((p: boolean) => void) | null = null;

export function registerPlayerSetters(
    setTrack: (t: SongMetadata | null) => void,
    setPlaying: (p: boolean) => void
) {
    _currentTrackSetter = setTrack;
    _isPlayingSetter = setPlaying;
}

export const setupPlayer = async (): Promise<boolean> => {
    if (!_TrackPlayer || !_TrackPlayer.setupPlayer) return false;

    try {
        // If player already set up, this will succeed
        await _TrackPlayer.getCurrentTrack();
        return true;
    } catch {
        try {
            await _TrackPlayer.setupPlayer();

            const options: any = {};

            if (_AppKilledPlaybackBehavior?.StopPlaybackAndRemoveNotification) {
                options.android = {
                    appKilledPlaybackBehavior:
                        _AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                };
            }

            // Only add capabilities if the Capability enum is non-null
            if (_Capability && _Capability.Play != null) {
                options.capabilities = [
                    _Capability.Play,
                    _Capability.Pause,
                    _Capability.SkipToNext,
                    _Capability.SkipToPrevious,
                    _Capability.SeekTo,
                ].filter((c) => c != null);
            }

            if (Object.keys(options).length > 0) {
                await _TrackPlayer.updateOptions(options);
            }

            return true;
        } catch (e) {
            console.warn('TrackPlayer setup failed:', e);
            return false;
        }
    }
};

export const playTrack = async (track: SongMetadata): Promise<boolean> => {
    // Update global state immediately so MiniPlayer shows the track
    _currentTrackSetter?.(track);

    if (!_TrackPlayer) {
        console.warn('TrackPlayer not available (Expo Go). Build dev client for audio.');
        return false;
    }

    try {
        const streamUrl = await MusicAPI.getStreamUrl(track);
        if (!streamUrl) {
            console.warn('Could not resolve stream URL for', track.title);
            return false;
        }

        await _TrackPlayer.reset();
        await _TrackPlayer.add({
            id: track.id,
            url: streamUrl,
            title: track.title,
            artist: track.artist,
            artwork: track.artwork,
        });
        await _TrackPlayer.play();
        _isPlayingSetter?.(true);
        return true;
    } catch (e) {
        console.error('Error playing track:', e);
        return false;
    }
};

export const addTracks = async (tracks: SongMetadata[]) => {
    if (!_TrackPlayer) return;
    await _TrackPlayer.add(tracks);
    if (_RepeatMode?.Queue != null) {
        await _TrackPlayer.setRepeatMode(_RepeatMode.Queue);
    }
};

export const playNext = async () => {
    if (_TrackPlayer?.skipToNext) await _TrackPlayer.skipToNext();
};

export const playPrevious = async () => {
    if (_TrackPlayer?.skipToPrevious) await _TrackPlayer.skipToPrevious();
};

export const getTrackPlayer = () => _TrackPlayer;
export const getState = () => _State;
export const getCapability = () => _Capability;
