import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({ 
  style, 
  lightColor,
  darkColor,
  ...props 
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = isDark 
    ? (darkColor || '#151718') 
    : (lightColor || '#fff');

  return (
    <View
      style={[
        { backgroundColor },
        style,
      ]}
      {...props}
    />
  );
}
