import { FavoritesProvider } from '@/src/store/FavoritesContext';
import { PlayerProvider } from '@/src/store/PlayerContext';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <PlayerProvider>
          <FavoritesProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="import" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="player" options={{ presentation: 'fullScreenModal', headerShown: false }} />
              <Stack.Screen name="playlist" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="light" />
          </FavoritesProvider>
        </PlayerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
