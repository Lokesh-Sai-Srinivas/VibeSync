import { Platform } from 'react-native';

export const PlaybackService = async function () {
    const TrackPlayerMod = Platform.OS !== 'web' ? require('react-native-track-player') : null;
    const TrackPlayer = TrackPlayerMod?.default || TrackPlayerMod;

    if (!TrackPlayer || !TrackPlayer.addEventListener) return;

    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemoteStop, () => TrackPlayer.destroy());
    TrackPlayer.addEventListener(TrackPlayerMod.Event.RemoteSeek, (event: any) => TrackPlayer.seekTo(event.position));
};
