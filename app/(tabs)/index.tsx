import { GlassView } from '@/components/GlassView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { playTrack, registerPlayerSetters } from '@/src/services/AudioService';
import { MusicAPI, SongMetadata } from '@/src/services/MusicAPI';
import { useFavorites } from '@/src/store/FavoritesContext';
import { usePlayerStore } from '@/src/store/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Music, Play, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', title: 'Top 50 Telugu', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: '2', title: 'Hindi Hits', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80' },
  { id: '3', title: 'English Pop', image: 'https://images.unsplash.com/photo-1514525253344-7814d9994a80?w=500&q=80' },
  { id: '4', title: 'Global Viral', image: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=500&q=80' },
  { id: '5', title: 'Chill Vibes', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80' },
  { id: '6', title: 'Workout Mix', image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=500&q=80' },
];

const MOODS = [
  { name: 'Heartbroken', color: '#ff4b2b', icon: '💔' },
  { name: 'Beast Mode', color: '#8e2de2', icon: '🔥' },
  { name: 'Cloud 9', color: '#00d2ff', icon: '☁️' },
  { name: 'Chill', color: '#16a085', icon: '🌊' },
  { name: 'Hype', color: '#f8a01e', icon: '⚡' },
];

const HERO = {
  title: 'Midnight City Gems',
  subtitle: 'Lush synthwave for urban late nights',
  image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
  query: 'synthwave midnight city',
};

export default function HomeScreen() {
  const [mood, setMood] = useState('Chill');
  const [discoveredTracks, setDiscoveredTracks] = useState<SongMetadata[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  // Register state setters with AudioService so it can update global state
  useEffect(() => {
    registerPlayerSetters(setCurrentTrack, setIsPlaying);
  }, [setCurrentTrack, setIsPlaying]);

  const handleMoodSelection = async (newMood: string) => {
    setMood(newMood);
    setMoodLoading(true);
    try {
      const tracks = await MusicAPI.searchJioSaavn(newMood + ' songs');
      setDiscoveredTracks(tracks.slice(0, 6));
    } catch (e) {
      console.warn('Mood search failed', e);
    } finally {
      setMoodLoading(false);
    }
  };

  const handleHeroPlay = async () => {
    setHeroPlaying(true);
    router.push({ pathname: '/playlist', params: { title: HERO.title, image: HERO.image } });
    setHeroPlaying(false);
  };

  const handleCategoryPress = (cat: typeof CATEGORIES[0]) => {
    router.push({ pathname: '/playlist', params: { title: cat.title, image: cat.image } });
  };

  const handleTrackPress = async (track: SongMetadata) => {
    await playTrack(track);
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="light-content" />
      <LinearGradient colors={['#1e1e1e', '#0d0d0d']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingHeader}>VibeSync</Text>
              <Text style={styles.usernameHeader}>Good Evening 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <GlassView style={styles.searchButton}>
                <Search size={22} color="#fff" />
              </GlassView>
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <TouchableOpacity style={styles.heroContainer} activeOpacity={0.9} onPress={handleHeroPlay}>
            <Image source={{ uri: HERO.image }} style={styles.heroImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTag}>FEATURED VIBE</Text>
                <Text style={styles.heroTitle}>{HERO.title}</Text>
                <Text style={styles.heroSubtitle}>{HERO.subtitle}</Text>
                <View style={styles.heroAction}>
                  {heroPlaying
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Play size={18} color="#000" fill="#000" />
                  }
                  <Text style={styles.heroActionText}>Listen Now</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Moods */}
          <View style={styles.sectionArea}>
            <Text style={styles.sectionHeaderTitle}>Today's Mood</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScrollArea}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.name}
                  onPress={() => handleMoodSelection(m.name)}
                  style={[styles.moodItemBtn, mood === m.name && styles.moodItemActive]}
                >
                  <View style={[styles.moodIconWrapper, { backgroundColor: m.color }]}>
                    <Text style={{ fontSize: 22 }}>{m.icon}</Text>
                  </View>
                  <Text style={[styles.moodBtnLabel, mood === m.name && { color: '#1ed760' }]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Collections */}
          <View style={styles.sectionArea}>
            <Text style={styles.sectionHeaderTitle}>Explore Collections</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.collectionCard} onPress={() => handleCategoryPress(cat)}>
                  <Image source={{ uri: cat.image }} style={styles.collectionImg} />
                  <Text style={styles.collectionName}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Top Vibe Matches */}
          <View style={styles.sectionArea}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeaderTitle}>Top Vibe Matches</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {moodLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1ed760" />
                <Text style={styles.loadingText}>Finding your vibe...</Text>
              </View>
            ) : discoveredTracks.length > 0 ? (
              discoveredTracks.map((track, i) => (
                <TouchableOpacity
                  key={track.id + i}
                  style={styles.trackRow}
                  onPress={() => handleTrackPress(track)}
                >
                  <Image source={{ uri: track.artwork }} style={styles.trackArtworkThumb} />
                  <View style={styles.trackMetaInfo}>
                    <Text style={styles.trackMainTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackSubArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <View style={styles.trackRightIcons}>
                    <TouchableOpacity onPress={() => toggleFavorite(track)}>
                      <Heart size={18} color={isFavorite(track.id) ? '#e91e8c' : 'rgba(255,255,255,0.3)'} fill={isFavorite(track.id) ? '#e91e8c' : 'transparent'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTrackPress(track)} style={{ marginLeft: 15 }}>
                      <Play size={18} color="#1ed760" fill="#1ed760" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <GlassView intensity={10} style={styles.emptyDiscovery}>
                <Music size={32} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyDiscoverText}>Tap a mood above to discover music</Text>
              </GlassView>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Mini Player */}
        <MiniPlayer />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  scrollContainer: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    marginBottom: 22,
  },
  greetingHeader: {
    color: '#1ed760',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  usernameHeader: { color: '#fff', fontSize: 28, fontWeight: '900' },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  heroContainer: {
    marginHorizontal: 22,
    height: 210,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 22,
  },
  heroContent: {},
  heroTag: { color: '#1ed760', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14 },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 8,
  },
  heroActionText: { color: '#000', fontSize: 14, fontWeight: '800' },
  sectionArea: { marginBottom: 28, paddingHorizontal: 22 },
  sectionHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 14, letterSpacing: -0.3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllText: { color: '#1ed760', fontSize: 14, fontWeight: '700' },
  moodScrollArea: { paddingRight: 20 },
  moodItemBtn: { alignItems: 'center', marginRight: 18, padding: 10, borderRadius: 20 },
  moodItemActive: { backgroundColor: 'rgba(30,215,96,0.08)', borderWidth: 1, borderColor: 'rgba(30,215,96,0.2)' },
  moodIconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  moodBtnLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '800' },
  horizontalCardScroll: { paddingRight: 20 },
  collectionCard: { marginRight: 16, width: 140 },
  collectionImg: { width: 140, height: 140, borderRadius: 22, marginBottom: 10 },
  collectionName: { color: '#fff', fontSize: 13, fontWeight: '800' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 13,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  trackArtworkThumb: { width: 54, height: 54, borderRadius: 13, marginRight: 14 },
  trackMetaInfo: { flex: 1 },
  trackMainTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  trackSubArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
  trackRightIcons: { flexDirection: 'row', alignItems: 'center' },
  emptyDiscovery: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  emptyDiscoverText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '600' },
});
