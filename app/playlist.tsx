import { playTrack } from '@/src/services/AudioService';
import { MusicAPI, SongMetadata } from '@/src/services/MusicAPI';
import { useFavorites } from '@/src/store/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Play } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PlaylistScreen() {
    const { title, image } = useLocalSearchParams();
    const [tracks, setTracks] = useState<SongMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        async function loadTracks() {
            if (!title) return;
            setLoading(true);
            try {
                const results = await MusicAPI.searchJioSaavn(title as string);
                setTracks(results);
            } catch (e) {
                console.error('Failed to load playlist tracks', e);
            } finally {
                setLoading(false);
            }
        }
        loadTracks();
    }, [title]);

    const handlePlayAll = async () => {
        if (tracks.length > 0) {
            await playTrack(tracks[0]);
            router.push('/player');
        }
    };

    const handleTrackPress = async (track: SongMetadata) => {
        await playTrack(track);
        router.push('/player');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(30, 215, 96, 0.3)', 'transparent']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.heroSection}>
                        <Image
                            source={{ uri: (image as string) || 'https://via.placeholder.com/300' }}
                            style={styles.heroImage}
                        />
                        <Text style={styles.playlistTitle}>{title}</Text>
                        <Text style={styles.playlistSubtitle}>{tracks.length} Songs • Recommended for you</Text>

                        <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                            <Play size={24} color="#000" fill="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.trackList}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#1ed760" style={{ marginTop: 50 }} />
                        ) : tracks.length > 0 ? (
                            tracks.map((track) => (
                                <TouchableOpacity
                                    key={track.id}
                                    style={styles.trackItem}
                                    onPress={() => handleTrackPress(track)}
                                >
                                    <Image source={{ uri: track.artwork }} style={styles.trackThumb} />
                                    <View style={styles.trackInfo}>
                                        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                                        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.trackAction} onPress={() => toggleFavorite(track)}>
                                        <Heart size={18} color={isFavorite(track.id) ? '#e91e8c' : 'rgba(255,255,255,0.4)'} fill={isFavorite(track.id) ? '#e91e8c' : 'transparent'} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No tracks found in this category</Text>
                        )}
                    </View>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 30,
    },
    heroImage: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    playlistTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    playlistSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1ed760',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1ed760',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    trackList: {
        paddingHorizontal: 20,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 10,
        borderRadius: 12,
    },
    trackThumb: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15,
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    trackArtist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
    },
    trackAction: {
        padding: 10,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});
