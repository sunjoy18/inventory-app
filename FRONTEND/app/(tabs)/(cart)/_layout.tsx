import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="qr-scanner-screen" options={{headerShown: false}}/>
    </Stack>
  );
}
