import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export const LoadingAnimation = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.Value(-100)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;
  const dotsColorAnim = useRef(new Animated.Value(0)).current;

  const [text, setText] = useState('YOUR...');

  const textColorInterpolation = textColorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#232323', '#FF4173', '#384c6c', '#8E44AD'],
  });

  const dotsColorInterpolation = dotsColorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#232323', '#FF4173', '#384c6c', '#8E44AD'],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(positionAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textColorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotsColorAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textColorAnim, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotsColorAnim, {
          toValue: 2,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textColorAnim, {
          toValue: 3,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotsColorAnim, {
          toValue: 3,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    dot1Anim.addListener(({ value }) => {
      if (value === 1) setText('YOUR CHOICE..');
    });
    dot2Anim.addListener(({ value }) => {
      if (value === 1) setText('YOUR LOOKS.');
    });
    dot3Anim.addListener(({ value }) => {
      if (value === 1) setText('YOUR FASHION GUIDE');
    });

    return () => {
      dot1Anim.removeAllListeners();
      dot2Anim.removeAllListeners();
      dot3Anim.removeAllListeners();
    };
  }, []);

  return (
    <LinearGradient
      colors={['#401730', '#714463','#e8ccb9','#efe2d9' ,'#e8ccb9', '#714463','#401730']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: positionAnim }],
          }}>
          <Animated.Text style={[styles.text, { color: textColorInterpolation }]}>
            {text}
          </Animated.Text>
        </Animated.View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.dotsContainer}>
            <Animated.View style={{ opacity: dot1Anim }}>
              <Animated.Text style={[styles.dot, { color: dotsColorInterpolation }]}>
                .
              </Animated.Text>
            </Animated.View>
            <Animated.View style={{ opacity: dot2Anim }}>
              <Animated.Text style={[styles.dot, { color: dotsColorInterpolation }]}>
                .
              </Animated.Text>
            </Animated.View>
            <Animated.View style={{ opacity: dot3Anim }}>
              <Animated.Text style={[styles.dot, { color: dotsColorInterpolation }]}>
                .
              </Animated.Text>
            </Animated.View>
          </View>
        </Animated.View>
        
        {/* Footer with Directrix text and globe icon */}
        <View style={styles.footer}>
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>Part of the Directrix </Text>
            <MaterialIcons name="public" size={16} color="#232323" />
            <Text style={styles.footerText}> Creativity</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  footerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#232323',
    fontWeight: '500',
  },
});
