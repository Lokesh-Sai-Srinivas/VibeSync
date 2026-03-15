import { getState, getTrackPlayer } from '@/src/services/AudioService';
import { useFavorites } from '@/src/store/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ChevronDown,
    Heart,
    Mic2,
    MoreVertical,
    Music,
    Pause,
    Play,
    Repeat,
    Share2,
    Shuffle,
    SkipBack,
    SkipForward,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LyricView } from '../../../components/LyricView';
import { useDominantColor } from '../../../hooks/useDominantColor';
import { MusicAPI } from '../../services/MusicAPI';

const { width } = Dimensions.get('window');

// Import hooks from react-native-track-player safely
let useActiveTrack: (() => any) | null = null;
let usePlaybackState: (() => any) | null = null;
let useProgress: (() => any) | null = null;

try {
    if (Platform.OS !== 'web') {
        const mod = require('react-native-track-player');
        useActiveTrack = mod.useActiveTrack || null;
        usePlaybackState = mod.usePlaybackState || null;
        useProgress = mod.useProgress || null;
    }
} catch {
    // Not available in Expo Go
}

const hasNativePlayer = !!(useActiveTrack && usePlaybackState && useProgress);

const NowPlaying = () => {
    const router = useRouter();
    const TrackPlayer = getTrackPlayer();
    const State = getState();

    // Conditionally call hooks — only when native player is available
    const track = useActiveTrack?.();
    const playbackState = usePlaybackState?.();
    const rawProgress = useProgress?.();
    const progress = rawProgress || { position: 0, duration: 0 };

    const colors = useDominantColor(track?.artwork);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [showLyrics, setShowLyrics] = useState(false);

    const trackFaved = track ? isFavorite(track.id) : false;

    const isPlaying = State?.Playing != null
        ? playbackState?.state === State.Playing
        : false;

    useEffect(() => {
        if (track?.title && track?.artist) {
            MusicAPI.getLyrics(track.title, track.artist).then(setLyrics);
        }
    }, [track]);

    const togglePlayback = async () => {
        if (!TrackPlayer) return;
        try {
            if (isPlaying) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } catch (e) {
            console.warn('Playback toggle error:', e);
        }
    };

    const handleSeek = (ratio: number) => {
        if (!TrackPlayer || !progress.duration) return;
        TrackPlayer.seekTo(ratio * progress.duration).catch(console.warn);
    };

    // Beautiful fallback screen for Expo Go
    if (!hasNativePlayer) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#1a1a2e', '#0d0d0d']} style={StyleSheet.absoluteFill} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <ChevronDown size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.devClientFallback}>
                    <Music size={80} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.devClientTitle}>Build to Unlock Audio</Text>
                    <Text style={styles.devClientBody}>
                        Full audio playback requires a Development Client.{'\n'}
                        All search, discovery, and navigation features work right now.
                    </Text>
                    <View style={styles.devClientCommand}>
                        <Text style={styles.devClientCmd}>npx expo run:android</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background || '#121212', '#050505']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ChevronDown size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerLabelWrapper}>
                    <Text style={styles.headerLabel}>PLAYING FROM VIBE</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>{track?.artist || 'Unknown'}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <MoreVertical size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                {!showLyrics ? (
                    <View style={styles.artworkWrapper}>
                        <Image
                            source={{ uri: track?.artwork || 'https://via.placeholder.com/300' }}
                            style={styles.artworkImg}
                        />
                    </View>
                ) : (
                    <LyricView
                        lyrics={lyrics}
                        currentTime={progress.position}
                        onSeek={(t) => TrackPlayer?.seekTo?.(t)}
                    />
                )}

                <View style={styles.trackDetails}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.mainTitle} numberOfLines={1}>{track?.title || 'Not Playing'}</Text>
                        <Text style={styles.subArtist} numberOfLines={1}>{track?.artist || 'Select a track'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => track && toggleFavorite({ id: track.id, title: track.title, artist: track.artist, album: '', artwork: track.artwork || '', duration: 0 })}>
                        <Heart size={28} color={trackFaved ? '#e91e8c' : 'rgba(255,255,255,0.3)'} fill={trackFaved ? '#e91e8c' : 'transparent'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressArea}>
                    <TouchableOpacity
                        style={styles.progressBarBg}
                        activeOpacity={1}
                        onPress={(e) => {
                            const pct = e.nativeEvent.locationX / (width - 60);
                            handleSeek(Math.max(0, Math.min(1, pct)));
                        }}
                    >
                        <View
                            style={[
                                styles.progressIndicator,
                                {
                                    width: `${Math.min(100, (progress.position / (progress.duration || 1)) * 100)}%`,
                                    backgroundColor: colors.primary || '#1ed760',
                                },
                            ]}
                        />
                    </TouchableOpacity>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>{formatTime(progress.position)}</Text>
                        <Text style={styles.timeLabel}>{formatTime(progress.duration)}</Text>
                    </View>
                </View>

                <View style={styles.playbackControls}>
                    <TouchableOpacity><Shuffle size={22} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => TrackPlayer?.skipToPrevious?.().catch?.(() => { })}>
                        <SkipBack size={38} color="#fff" fill="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlayback} style={styles.playPauseBtn}>
                        {isPlaying
                            ? <Pause size={34} color="#000" fill="#000" />
                            : <Play size={34} color="#000" fill="#000" style={{ marginLeft: 4 }} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => TrackPlayer?.skipToNext?.().catch?.(() => { })}>
                        <SkipForward size={38} color="#fff" fill="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity><Repeat size={22} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)}>
                        <Mic2 size={24} color={showLyrics ? '#1ed760' : 'rgba(255,255,255,0.5)'} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Share2 size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 30,
        height: 82,
    },
    iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerLabelWrapper: { alignItems: 'center', flex: 1 },
    headerLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    headerTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
    mainContent: {
        flex: 1,
        paddingHorizontal: 30,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    artworkWrapper: {
        width: width - 60,
        height: width - 60,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.7,
        shadowRadius: 30,
        elevation: 20,
    },
    artworkImg: { width: '100%', height: '100%', borderRadius: 20 },
    trackDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
    mainTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    subArtist: { color: 'rgba(255,255,255,0.6)', fontSize: 17, fontWeight: '500', marginTop: 4 },
    progressArea: { marginTop: 20 },
    progressBarBg: {
        height: 5,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 3,
    },
    progressIndicator: { height: '100%', borderRadius: 3 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    timeLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
    playbackControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playPauseBtn: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    devClientFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    devClientTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    devClientBody: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 24,
    },
    devClientCommand: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    devClientCmd: {
        color: '#1ed760',
        fontWeight: '800',
        fontSize: 15,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default NowPlaying;
