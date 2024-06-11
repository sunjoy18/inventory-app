import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '../../ctx';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return null;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="(cart)"
        options={{
          title: 'Cart',
          tabBarLabelStyle:( {color: 'black'}),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cart' : 'cart-outline'} color={'#007BFF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="(inventory)"
        options={{
          title: 'Inventory',
          tabBarLabelStyle:( {color: 'black'}),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'layers' : 'layers-outline'} color={'#007BFF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="(products)"
        options={{
          tabBarLabelStyle:( {color: 'black'}),
          title: 'Product',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bag-add' : 'bag-add-outline'} color={'#007BFF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="(sales)"
        options={{
          tabBarLabelStyle:( {color: 'black'}),
          title: 'Sales',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={'#007BFF'} />
          ),
        }}
      />
    </Tabs>
  );
}