//  import React, { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
//   KeyboardAvoidingView, Platform, Image, ActivityIndicator, Keyboard, Animated
// } from 'react-native';
// import { Link, router } from 'expo-router';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { app } from '../../firebaseConfig';
// import { getAuth, signInWithEmailAndPassword, AuthError} from 'firebase/auth';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';

// const auth = getAuth(app);
// const db = getFirestore(app);

// export default function SignIn() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showComingSoon, setShowComingSoon] = useState(false);
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   // Handle the "Coming Soon" popup animation
//   useEffect(() => {
//     if (showComingSoon) {
//       Animated.sequence([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.delay(1500),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         })
//       ]).start(() => {
//         setShowComingSoon(false);
//       });
//     }
//   }, [showComingSoon]);

//   const handleGoogleSignIn = () => {
//     // Show the "Coming Soon" popup instead of actual implementation
//     setShowComingSoon(true);
//   };

//   const handleSignIn = async () => {
//     Keyboard.dismiss();
//     if (!email.trim() || !password) {
//       setErrorMessage('Please fill in your registered Email and Password');
//       return;
//     }

//     setLoading(true);
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // Check email verification first for ALL users
//       if (!user.emailVerified) {
//         setErrorMessage('Email verification is pending. Please check your inbox and verify your email before signing in.');
//         setLoading(false);
//         return;
//       }

//       const userDocRef = doc(db, 'users', user.uid);
//       const userDoc = await getDoc(userDocRef);

//       // If no lastLogin, redirect to onboarding (for first-time verified users)
//       if (!userDoc.data()?.lastLogin) {
//         router.replace('/(auth)/onboarding');
//         return;
//       }

//       // Continue with normal sign in flow for existing verified users
//       router.replace('/(tabs)');

//       } catch (error) {
//         const authError = error as AuthError;
//         console.log('Firebase Auth Error:', authError.code, authError.message);
//         setErrorMessage('Invalid Email or Password. Please try again.');
//       } finally {
//       }
//   };


// return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.formWrapper}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>Almari</Text>
//           <Text style={styles.subtitle}>Sign in to your Account</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <View style={styles.inputGroup}>
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={email}
//               onChangeText={(text) => {
//                 setEmail(text);
//                 setErrorMessage('');
//               }}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               autoComplete="email"
//             />
//           </View>

//           <View style={styles.inputGroup}>
//             <View style={styles.passwordContainer}>
//               <TextInput
//                 style={styles.passwordInput}
//                 placeholder="Password"
//                 value={password}
//                 onChangeText={(text) => {
//                   setPassword(text);
//                   setErrorMessage('');
//                 }}
//                 secureTextEntry={!showPassword}
//                 autoComplete="password"
//               />
//               <TouchableOpacity
//                 onPress={() => setShowPassword(!showPassword)}
//                 style={styles.eyeIcon}
//               >
//                 <Ionicons
//                   name={showPassword ? "eye-off-outline" : "eye-outline"}
//                   size={24}
//                   color="#666"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <Link href="/(auth)/forgot_password" style={styles.forgotPassword} onPress={() => setErrorMessage('')}>
//             <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//           </Link>

//           <View style={styles.inputGroup}>
//             {errorMessage ? (
//               <Text style={styles.errorText}>{errorMessage}</Text>
//             ) : null}
//           </View>

//           <TouchableOpacity
//             style={[styles.signInButton, loading && styles.disabledButton]}
//             onPress={handleSignIn}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.signInText}>Login</Text>
//             )}
//           </TouchableOpacity>

//           <View style={styles.orContainer}>
//             <View style={styles.orLine} />
//             <Text style={styles.orText}>Or login with</Text>
//             <View style={styles.orLine} />
//           </View>

//           <View style={styles.socialButtons}>
//             <TouchableOpacity 
//               style={styles.socialButton}
//               onPress={handleGoogleSignIn}
//             >
//               <Image
//                 source={{ uri: 'https://www.google.com/favicon.ico' }}
//                 style={styles.socialIcon}
//               />
//               <Text style={styles.socialButtonText}>Google</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.registerContainer}>
//             <Text style={styles.registerText}>Don`t have an account? </Text>
//             <Link href="/(auth)/register" onPress={() => setErrorMessage('')}>
//               <Text style={styles.registerLinkText}>Register</Text>
//             </Link>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
      
//       {/* Footer with Directrix text and globe icon */}
//       <View style={styles.footer}>
//         <View style={styles.footerTextContainer}>
//           <Text style={styles.footerText}>Part of the Directrix </Text>
//           <MaterialIcons name="public" size={16} color="#232323" />
//           <Text style={styles.footerText}> Creativity</Text>
//         </View>
//       </View>

//       {/* Coming Soon Popup */}
//       {showComingSoon && (
//         <Animated.View style={[styles.comingSoonContainer, { opacity: fadeAnim }]}>
//           <View style={styles.comingSoonContent}>
//             <Text style={styles.comingSoonText}>Coming Soon! Use Email Option</Text>
//           </View>
//         </Animated.View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   formWrapper: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center',
//   },
//   header: {
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   formContainer: {
//     width: '100%',
//     maxWidth: 400,
//     alignSelf: 'center',
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//   },
//   passwordInput: {
//     flex: 1,
//     height: 50,
//     paddingHorizontal: 16,
//     fontSize: 16,
//   },
//   eyeIcon: {
//     padding: 12,
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 24,
//   },
//   forgotPasswordText: {
//     color: '#714463',
//     fontSize: 14,
//   },
//   signInButton: {
//     backgroundColor: '#714463',
//     height: 50,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   signInText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   orLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#ddd',
//   },
//   orText: {
//     color: '#666',
//     paddingHorizontal: 16,
//     fontSize: 14,
//   },
//   socialButtons: {
//     marginBottom: 24,
//   },
//   socialButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//   },
//   socialIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 8,
//   },
//   socialButtonText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   registerText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   registerLinkText: {
//     color: '#714463',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
//   errorText: {
//     color: '#e02e2e',
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 8
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 20,
//     width: '100%',
//     alignItems: 'center',
//   },
//   footerTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   footerText: {
//     fontSize: 14,
//     color: '#232323',
//     fontWeight: '500',
//   },
//   // Coming Soon popup styles
//   comingSoonContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     zIndex: 1000,
//   },
//   comingSoonContent: {
//     backgroundColor: 'transparent',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     bottom: -325,
//     // alignItems: 'center',
//     // justifyContent: 'center',
//     // shadowColor: '#000',
//     // shadowOffset: { width: 0, height: 2 },
//     // shadowOpacity: 0.3,
//     // shadowRadius: 4,
//     // elevation: 5,
//   },
//   comingSoonText: {
//     color: '#714463',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, Keyboard, Animated
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { app } from '../../firebaseConfig';
import { getAuth, signInWithEmailAndPassword, AuthError, reload } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Handle the "Coming Soon" popup animation
  useEffect(() => {
    if (showComingSoon) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowComingSoon(false);
      });
    }
  }, [showComingSoon]);

  const handleGoogleSignIn = () => {
    // Show the "Coming Soon" popup instead of actual implementation
    setShowComingSoon(true);
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in your registered Email and Password');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Reload user to get the latest verification status
      await reload(user);
      
      // Check email verification after reloading user data
      if (!user.emailVerified) {
        setErrorMessage('Email verification is pending. Please check your inbox and verify your email before signing in.');
        setLoading(false);
        return;
      }

      // Get user document from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If no lastLogin, redirect to onboarding (for first-time verified users)
      if (!userDoc.exists() || !userDoc.data()?.lastLogin) {
        router.replace('/(auth)/onboarding');
        return;
      }

      // Continue with normal sign in flow for existing verified users
      router.replace('/(tabs)');

    } catch (error) {
      const authError = error as AuthError;
      console.log('Firebase Auth Error:', authError.code, authError.message);
      
      // Handle specific error codes
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-email':
        case 'auth/invalid-credential':
          setErrorMessage('Invalid Email or Password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many failed attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setErrorMessage('This account has been disabled. Please contact support.');
          break;
        default:
          setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formWrapper}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Almari</Text>
          <Text style={styles.subtitle}>Sign in to your Account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Link href="/(auth)/forgot_password" style={styles.forgotPassword} onPress={() => setErrorMessage('')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Link>

          <View style={styles.inputGroup}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Or login with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don`t have an account? </Text>
            <Link href="/(auth)/register" onPress={() => setErrorMessage('')}>
              <Text style={styles.registerLinkText}>Register</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Footer with Directrix text and globe icon */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Part of the Directrix </Text>
          <MaterialIcons name="public" size={16} color="#232323" />
          <Text style={styles.footerText}> Creativity</Text>
        </View>
      </View>

      {/* Coming Soon Popup */}
      {showComingSoon && (
        <Animated.View style={[styles.comingSoonContainer, { opacity: fadeAnim }]}>
          <View style={styles.comingSoonContent}>
            <Text style={styles.comingSoonText}>Coming Soon! Use Email Option</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formWrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#714463',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#333',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#714463',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: '#e02e2e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8
  },
  footer: {
    position: 'absolute',
    bottom: 20,
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
  // Coming Soon popup styles
  comingSoonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  comingSoonContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  comingSoonText: {
    color: '#714463',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});