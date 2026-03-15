import { MiniPlayer } from '@/components/MiniPlayer';
import { playTrack, registerPlayerSetters } from '@/src/services/AudioService';
import { MusicAPI, SongMetadata } from '@/src/services/MusicAPI';
import { usePlayerStore } from '@/src/store/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Globe, Heart, Mic2, Play, Search, TrendingUp, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BROWSE_CATEGORIES = [
    { id: '1', name: 'Trending Now', icon: TrendingUp, color: '#ff4b2b', query: 'trending hits 2024' },
    { id: '2', name: 'Romantic', icon: Heart, color: '#e91e8c', query: 'romantic love songs' },
    { id: '3', name: 'Workout', icon: Zap, color: '#f8a01e', query: 'workout gym motivation' },
    { id: '4', name: 'Focus', icon: Mic2, color: '#00b4d8', query: 'focus study lofi music' },
    { id: '5', name: 'Global Hits', icon: Globe, color: '#6a0dad', query: 'global pop hits' },
    { id: '6', name: 'Telugu Top', icon: TrendingUp, color: '#1ed760', query: 'Telugu top 50 hits' },
    { id: '7', name: 'Hindi Hits', icon: TrendingUp, color: '#ff6b35', query: 'Hindi Bollywood hits' },
    { id: '8', name: 'English Pop', icon: TrendingUp, color: '#0077b6', query: 'English pop top songs' },
];

export default function ExploreScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SongMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const { setCurrentTrack, setIsPlaying } = usePlayerStore();
    const router = useRouter();

    useEffect(() => {
        registerPlayerSetters(setCurrentTrack, setIsPlaying);
    }, [setCurrentTrack, setIsPlaying]);

    const handleSearch = useCallback(async (searchQuery?: string) => {
        const q = searchQuery || query;
        if (!q.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const tracks = await MusicAPI.searchJioSaavn(q.trim());
            setResults(tracks);
        } catch (e) {
            console.warn('Search failed', e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query]);

    const handleCategoryPress = (cat: typeof BROWSE_CATEGORIES[0]) => {
        router.push({ pathname: '/playlist', params: { title: cat.name, image: '' } });
    };

    const handleTrackPress = async (track: SongMetadata) => {
        await playTrack(track);
        router.push('/player');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a1a2e', '#121212']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Explore</Text>
                    <Text style={styles.headerSub}>Find your next favourite track</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Artists, songs, moods..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch()}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
                            <Text style={styles.clearBtn}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!searched ? (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                        <Text style={styles.sectionTitle}>Browse Categories</Text>
                        <View style={styles.categoryGrid}>
                            {BROWSE_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryCard, { backgroundColor: cat.color + '22' }]}
                                        onPress={() => handleCategoryPress(cat)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                                            <Icon size={22} color="#fff" />
                                        </View>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1 }}>
                        {loading ? (
                            <View style={styles.loadingState}>
                                <ActivityIndicator size="large" color="#1ed760" />
                                <Text style={styles.loadingText}>Searching...</Text>
                            </View>
                        ) : results.length > 0 ? (
                            <FlatList
                                data={results}
                                keyExtractor={(item, index) => item.id + index}
                                contentContainerStyle={styles.resultsList}
                                showsVerticalScrollIndicator={false}
                                ListHeaderComponent={
                                    <Text style={styles.resultsHeader}>{results.length} results for "{query}"</Text>
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.resultItem} onPress={() => handleTrackPress(item)}>
                                        <Image source={{ uri: item.artwork }} style={styles.resultArt} />
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.resultArtist} numberOfLines={1}>{item.artist}</Text>
                                        </View>
                                        <View style={styles.playIcon}>
                                            <Play size={16} color="#1ed760" fill="#1ed760" />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🎵</Text>
                                <Text style={styles.emptyTitle}>No results found</Text>
                                <Text style={styles.emptySub}>Try a different search term</Text>
                            </View>
                        )}
                    </View>
                )}
                <MiniPlayer />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { paddingHorizontal: 22, paddingTop: 10, marginBottom: 18 },
    headerTitle: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 4, fontWeight: '500' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 22,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    clearBtn: { color: 'rgba(255,255,255,0.4)', fontSize: 16, paddingLeft: 8 },
    scroll: { paddingHorizontal: 22, paddingBottom: 40 },
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 16 },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: (width - 44 - 12) / 2,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
    loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' },
    resultsList: { paddingHorizontal: 22, paddingBottom: 40 },
    resultsHeader: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
    },
    resultArt: { width: 52, height: 52, borderRadius: 10, marginRight: 14 },
    resultInfo: { flex: 1 },
    resultTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
    resultArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
    playIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(30,215,96,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    emptyEmoji: { fontSize: 60, marginBottom: 8 },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '500' },
});
