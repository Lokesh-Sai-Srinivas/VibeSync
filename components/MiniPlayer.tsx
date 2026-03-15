import { usePlayerStore } from '@/src/store/PlayerContext';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Pause, Play } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MiniPlayer() {
    const { currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
    const router = useRouter();

    // Try to get TrackPlayer for play/pause if available
    const togglePlayback = async () => {
        try {
            const TrackPlayerMod = Platform.OS !== 'web' ? require('react-native-track-player') : null;
            const TrackPlayer = TrackPlayerMod?.default || TrackPlayerMod;
            if (TrackPlayer) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                    setIsPlaying(false);
                } else {
                    await TrackPlayer.play();
                    setIsPlaying(true);
                }
            }
        } catch (e) {
            // Native module not available (Expo Go)
        }
    };

    if (!currentTrack) return null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/player')}
            activeOpacity={0.95}
        >
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.border} />

            <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
            </View>

            <TouchableOpacity onPress={togglePlayback} style={styles.playBtn}>
                {isPlaying
                    ? <Pause size={22} color="#fff" fill="#fff" />
                    : <Play size={22} color="#fff" fill="#fff" />
                }
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(20,20,20,0.85)',
        borderRadius: 20,
        marginHorizontal: 12,
        marginBottom: Platform.OS === 'ios' ? 4 : 6,
        overflow: 'hidden',
        position: 'relative',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    artwork: {
        width: 46,
        height: 46,
        borderRadius: 10,
        marginRight: 14,
    },
    info: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    artist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '500',
    },
    playBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#1ed760',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});
