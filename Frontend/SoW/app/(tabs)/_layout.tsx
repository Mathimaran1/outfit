import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingAnimation } from '../../components/first_time_load';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const mainScreenFade = useRef(new Animated.Value(0)).current;
  const auth = getAuth();
  const isFromSignIn = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (router.canGoBack()) {
        isFromSignIn.current = true;
        setIsLoading(false);
        mainScreenFade.setValue(1);
        return;
      }

      const timer = setTimeout(() => {
        Animated.timing(mainScreenFade, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setIsLoading(false);
          if (!user) {
            router.replace('/(auth)/accounts');
          }
        });
      }, 4200);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading && !isFromSignIn.current) {
    return <LoadingAnimation />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: mainScreenFade }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#d9a3c7',
          tabBarInactiveTintColor: '#f0f0f0',
          tabBarShowLabel: false,
          headerShown: false, // Add this to hide headers globally
          tabBarStyle: {
            backgroundColor: '#401730',
            opacity: 0.8,
            elevation: 1,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          animation: 'fade',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="albums" size={size} color={color} paddingTop={4} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shirt-sharp" size={size} color={color} paddingTop={4} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts_mangement"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} paddingTop={4} />
            ),
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  TabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }
});
