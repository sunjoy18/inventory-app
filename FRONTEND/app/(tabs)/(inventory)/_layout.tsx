import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="product-detail" options={{headerShown: false}}/>
      <Stack.Screen name="edit-product-detail" options={{headerShown: false}}/>
    </Stack>
  );
}
