import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';

import {
  Stack
} from 'expo-router';

import {
  StatusBar
} from 'expo-status-bar';

import 'react-native-reanimated';

import {
  useColorScheme
} from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  const colorScheme =
    useColorScheme();

  return (

    <ThemeProvider

      value={

        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme

      }

    >

      <Stack
        initialRouteName="start"
      >

        <Stack.Screen
          name="start"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="become-worker"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="worker-profile"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="worker-withdraw"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="worker-transactions"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="admin-login"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="admin-dashboard"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false
          }}
        />

      </Stack>

      <StatusBar style="auto" />

    </ThemeProvider>

  );

}