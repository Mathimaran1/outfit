

// // // import React, { useRef, useEffect } from 'react';
// // // import { Animated, View } from 'react-native';

// // // const LoadingAnimation = () => {
// // //   const fadeAnim = useRef(new Animated.Value(0)).current;
// // //   const rotateAnim = useRef(new Animated.Value(0)).current;

// // //   useEffect(() => {
// // //     const fadeIn = Animated.timing(fadeAnim, {
// // //       toValue: 1,
// // //       duration: 1000,
// // //       useNativeDriver: true,
// // //     });

// // //     const rotate = Animated.loop(
// // //       Animated.timing(rotateAnim, {
// // //         toValue: 1,
// // //         duration: 2000,
// // //         useNativeDriver: true,
// // //       })
// // //     );

// // //     fadeIn.start();
// // //     rotate.start();
// // //   }, [fadeAnim, rotateAnim]);

// // //   return (
// // //     <View>
// // //       <Animated.View
// // //         style={{
// // //           opacity: fadeAnim,
// // //           transform: [{
// // //             rotate: rotateAnim.interpolate({
// // //               inputRange: [0, 1],
// // //               outputRange: ['0deg', '360deg'],
// // //             }),
// // //           }],
// // //         }}
// // //       >
// // //         {/* Your loading content */}
// // //       </Animated.View>
// // //     </View>
// // //   );
// // // };

// // // // export default LoadingAnimation;

// // import React, { useRef, useEffect, useState } from 'react';
// // import { Animated, View, StyleSheet } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';

// // const LoadingAnimation = () => {
// //   const flipAnim = useRef(new Animated.Value(0)).current;
// //   const [currentIconIndex, setCurrentIconIndex] = useState(0);
  
// //   const icons = ['shirt', 'glasses', 'watch', 'pricetag', 'bag', 'diamond'];

// //   useEffect(() => {
// //     const flipToNextIcon = () => {
// //       // Flip animation
// //       Animated.timing(flipAnim, {
// //         toValue: 1,
// //         duration: 300,
// //         useNativeDriver: true,
// //       }).start(() => {
// //         // Change to next icon at the middle of flip
// //         setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
        
// //         // Reset flip value and flip back
// //         flipAnim.setValue(-1);
// //         Animated.timing(flipAnim, {
// //           toValue: 0,
// //           duration: 1000,
// //           useNativeDriver: true,
// //         }).start();
// //       });
// //     };

// //     // Start the flip cycle
// //     const interval = setInterval(flipToNextIcon, 1700);

// //     return () => clearInterval(interval);
// //   }, [flipAnim, icons.length]);

// //   const rotateY = flipAnim.interpolate({
// //     inputRange: [-1, 0, 1],
// //     outputRange: ['-180deg', '0deg', '180deg'],
// //   });

// //   return (
// //     <View style={styles.container}>
// //       <Animated.View
// //         style={[
// //           styles.iconContainer,
// //           {
// //             transform: [{ rotateY }],
// //           },
// //         ]}
// //       >
// //         <Ionicons 
// //           name={icons[currentIconIndex] as any} 
// //           size={48} 
// //           color="#714463" 
// //         />
// //       </Animated.View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'transparent',
// //   },
// //   iconContainer: {
// //     width: 80,
// //     height: 80,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// // });

// // export default LoadingAnimation;
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { View, StyleSheet, Animated, Easing } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// const LoadingAnimation = () => {
//   const [currentIconIndex, setCurrentIconIndex] = useState(0);
//   const flipValue = useRef(new Animated.Value(0)).current;
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const isMountedRef = useRef(true);

//   const icons = useRef([
//     'shirt-outline',
//     'glasses-outline',
//     'watch-outline',
//     'pricetag-outline',
//     'checkroom',
//     'style'
//   ]).current;

//   const updateIconIndex = useCallback(() => {
//     if (isMountedRef.current) {
//       setCurrentIconIndex(prev => (prev + 1) % icons.length);
//     }
//   }, [icons.length]);

//   const animate = useCallback(() => {
//     if (!isMountedRef.current) return;
    
//     flipValue.setValue(0);
//     Animated.timing(flipValue, {
//       toValue: 1,
//       duration: 800,
//       easing: Easing.linear,
//       useNativeDriver: true
//     }).start((finished) => {
//       if (finished && isMountedRef.current) {
//         updateIconIndex();
//       }
//     });
//   }, [flipValue, updateIconIndex]);

//   useEffect(() => {
//     isMountedRef.current = true;
    
//     // Start the first animation
//     animate();
    
//     // Set up interval for subsequent animations
//     intervalRef.current = setInterval(() => {
//       if (isMountedRef.current) {
//         animate();
//       }
//     }, 800);

//     return () => {
//       isMountedRef.current = false;
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [animate]);

//   const flip = flipValue.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: ['0deg', '90deg', '180deg']
//   });

//   const opacity = flipValue.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: [1, 0.5, 0, 0.5, 1]
//   });

//   const isIonIcon = useCallback((iconName: string) => {
//     return iconName.includes('-outline');
//   }, []);

//   const currentIcon = icons[currentIconIndex];

//   return (
//     <View style={styles.loadingContainer}>
//       <Animated.View
//         style={[
//           styles.iconContainer,
//           {
//             transform: [{ rotateY: flip }],
//             opacity
//           }
//         ]}
//       >
//         {isIonIcon(currentIcon) ? (
//           <Ionicons 
//             name={currentIcon as any} 
//             size={40} 
//             color="#714463" 
//           />
//         ) : (
//           <MaterialIcons 
//             name={currentIcon as any} 
//             size={40} 
//             color="#714463" 
//           />
//         )}
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 100
//   },
//   iconContainer: {
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center'
//   }
// });

// export default LoadingAnimation;

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const LoadingAnimation = () => {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const flipValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const icons = useRef([
    'shirt-outline',
    'glasses-outline', 
    'watch-outline',
    'pricetag-outline',
    'checkroom',
    'style'
  ]).current;

  useEffect(() => {
    isMountedRef.current = true;

    const animateIcon = () => {
      if (!isMountedRef.current) return;

      // Stop any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      flipValue.setValue(0);
      
      animationRef.current = Animated.timing(flipValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      });

      animationRef.current.start((finished) => {
        if (finished && isMountedRef.current) {
          // Schedule the next icon change and animation
          timeoutRef.current = window.setTimeout(() => {
            if (isMountedRef.current) {
              setCurrentIconIndex(prev => (prev + 1) % icons.length);
              animateIcon();
            }
          }, 100);
        }
      });
    };

    // Start the animation cycle
    animateIcon();

    return () => {
      isMountedRef.current = false;
      
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [flipValue, icons.length]); // Added missing dependencies

  const rotateY = flipValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg']
  });

  const opacity = flipValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.7, 0.3, 0.7, 1]
  });

  const scale = flipValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1]
  });

  const currentIcon = icons[currentIconIndex];
  const isIonIcon = currentIcon.includes('-outline');

  return (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { rotateY },
              { scale }
            ],
            opacity
          }
        ]}
      >
        {isIonIcon ? (
          <Ionicons 
            name={currentIcon as any} 
            size={40} 
            color="#714463" 
          />
        ) : (
          <MaterialIcons 
            name={currentIcon as any} 
            size={40} 
            color="#714463" 
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: '100%'
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});

export default LoadingAnimation;
