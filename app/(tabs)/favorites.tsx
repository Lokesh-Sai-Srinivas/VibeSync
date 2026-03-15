import { MiniPlayer } from '@/components/MiniPlayer';
import { playTrack } from '@/src/services/AudioService';
import { SongMetadata } from '@/src/services/MusicAPI';
import { useFavorites } from '@/src/store/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Play, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const { favorites, toggleFavorite, clearFavorites } = useFavorites();
    const router = useRouter();

    const handlePlay = async (track: SongMetadata) => {
        await playTrack(track);
        router.push('/player');
    };

    const handleClear = () => {
        Alert.alert(
            'Clear Favorites',
            'Remove all saved tracks?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearFavorites },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a0a2e', '#0d0d0d']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSuper}>YOUR LIBRARY</Text>
                        <Text style={styles.headerTitle}>Favorites</Text>
                    </View>
                    {favorites.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                            <Trash2 size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats bar */}
                {favorites.length > 0 && (
                    <View style={styles.statsBar}>
                        <Heart size={14} color="#e91e8c" fill="#e91e8c" />
                        <Text style={styles.statsText}>{favorites.length} saved track{favorites.length !== 1 ? 's' : ''}</Text>

                        <TouchableOpacity
                            style={styles.playAllBtn}
                            onPress={() => favorites.length > 0 && handlePlay(favorites[0])}
                        >
                            <Play size={14} color="#000" fill="#000" />
                            <Text style={styles.playAllText}>Play All</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {favorites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Heart size={52} color="rgba(233,30,140,0.3)" />
                        </View>
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptySub}>
                            Tap the ♥ on any track to save it here
                        </Text>
                        <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
                            <Text style={styles.exploreBtnText}>Discover Music</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item, i) => item.id + i}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={styles.trackCard}
                                onPress={() => handlePlay(item)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.trackIndex}>{String(index + 1).padStart(2, '0')}</Text>
                                <Image source={{ uri: item.artwork }} style={styles.artwork} />
                                <View style={styles.trackInfo}>
                                    <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                                </View>
                                <View style={styles.trackActions}>
                                    <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.heartBtn}>
                                        <Heart size={20} color="#e91e8c" fill="#e91e8c" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handlePlay(item)} style={styles.playBtn}>
                                        <Play size={16} color="#1ed760" fill="#1ed760" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={<View style={{ height: 20 }} />}
                    />
                )}

                <MiniPlayer />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerSuper: {
        color: '#e91e8c',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
    clearBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        marginBottom: 20,
        gap: 8,
    },
    statsText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600', flex: 1 },
    playAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1ed760',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 22,
        gap: 6,
    },
    playAllText: { color: '#000', fontSize: 13, fontWeight: '800' },
    list: { paddingHorizontal: 22 },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    trackIndex: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
        fontWeight: '800',
        width: 28,
    },
    artwork: { width: 52, height: 52, borderRadius: 12, marginRight: 14 },
    trackInfo: { flex: 1 },
    trackTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
    trackArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
    trackActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    heartBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(233,30,140,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(30,215,96,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyIcon: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(233,30,140,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(233,30,140,0.1)',
    },
    emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    emptySub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    exploreBtn: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 22,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
