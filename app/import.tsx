import { GlassView } from '@/components/GlassView';
import { MusicAPI, SongMetadata } from '@/src/services/MusicAPI';
import { SpotifyParser } from '@/src/services/SpotifyParser';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, Link as LinkIcon, Music } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImportScreen() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [tracks, setTracks] = useState<{ title: string, artist: string, resolved?: SongMetadata }[]>([]);

    const handleImport = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const parsedTracks = await SpotifyParser.parsePlaylist(url);
            setTracks(parsedTracks.map(t => ({ ...t })));
            // Proactively resolve the first few tracks to show it works
            await resolveTracks(parsedTracks.slice(0, 5));
        } catch (e) {
            console.error('Import failed', e);
        } finally {
            setLoading(false);
        }
    };

    const resolveTracks = async (subset: { title: string, artist: string }[]) => {
        const resolvedList = [...tracks];
        for (let i = 0; i < subset.length; i++) {
            const results = await MusicAPI.searchJioSaavn(`${subset[i].title} ${subset[i].artist}`);
            if (results.length > 0) {
                const index = tracks.findIndex(t => t.title === subset[i].title);
                if (index !== -1) {
                    resolvedList[index].resolved = results[0];
                }
            }
        }
        setTracks([...resolvedList]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#1e1e1e', '#121212']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Import Spotify</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.heroSection}>
                    <GlassView intensity={10} style={styles.heroCard}>
                        <Music size={40} color="#1DB954" style={{ marginBottom: 15 }} />
                        <Text style={styles.heroTitle}>Transfer Your Music</Text>
                        <Text style={styles.heroSubtitle}>Paste a Spotify playlist link to sync it with VibeSync in seconds.</Text>
                    </GlassView>
                </View>

                <View style={styles.inputSection}>
                    <GlassView intensity={20} style={styles.inputContainer}>
                        <LinkIcon size={20} color="#1DB954" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Playlist URL (e.g. spotify.com/playlist/...)"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </GlassView>
                    <TouchableOpacity
                        style={[styles.importButton, !url && styles.buttonDisabled]}
                        onPress={handleImport}
                        disabled={loading || !url}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.importButtonText}>Analyze Link</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {tracks.length > 0 ? (
                    <FlatList
                        data={tracks}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <GlassView intensity={5} style={styles.trackItem}>
                                <View style={styles.trackInfo}>
                                    <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                                </View>
                                {item.resolved ? (
                                    <CheckCircle2 size={24} color="#1DB954" />
                                ) : (
                                    <View style={styles.dot} />
                                )}
                            </GlassView>
                        )}
                    />
                ) : !loading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Ready to Vibe?</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    heroSection: {
        padding: 20,
    },
    heroCard: {
        padding: 25,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 60,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    importButton: {
        backgroundColor: '#1DB954',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: 'rgba(29, 185, 84, 0.3)',
    },
    importButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    trackArtist: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '500',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.1)',
        fontSize: 32,
        fontWeight: '900',
    }
});
