// import React from 'react';
// import { Text, TextProps, StyleSheet } from 'react-native';
// import { useColorScheme } from 'react-native';

// interface ThemedTextProps extends TextProps {
//   type?: 'default' | 'title' | 'subtitle' | 'link';
//   lightColor?: string;
//   darkColor?: string;
// }

// export function ThemedText({ 
//   style, 
//   type = 'default', 
//   lightColor,
//   darkColor,
//   ...props 
// }: ThemedTextProps) {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
  
//   const textColor = isDark 
//     ? (darkColor || '#ECEDEE') 
//     : (lightColor || '#11181C');

//   return (
//     <Text
//       style={[
//         styles[type],
//         { color: textColor },
//         style,
//       ]}
//       {...props}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   default: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     lineHeight: 32,
//   },
//   subtitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   link: {
//     lineHeight: 30,
//     fontSize: 16,
//     color: '#0a7ea4',
//   },
// });
