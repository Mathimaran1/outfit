// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   ActivityIndicator
// } from 'react-native';
// import { router } from 'expo-router';
// import { getAuth, sendEmailVerification } from 'firebase/auth';
// import { app } from '../../firebaseConfig';
// import { MaterialIcons } from '@expo/vector-icons';

// const auth = getAuth(app);

// export default function Verify() {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [emailSent, setEmailSent] = useState(false);

//   const sendVerificationEmail = async (isAutomatic = false) => {
//       if (emailSent && !isAutomatic) return;
      
//       const user = auth.currentUser;
//       if (user && !user.emailVerified) {
//         try {
//           await sendEmailVerification(user);
//           setMessage('Verification email sent successfully!');
//           setEmailSent(true);
//         } catch (error: any) {
//           if (error.code === 'auth/too-many-requests') {
//             setMessage('Please wait a few minutes before requesting another email.');
//           } else {
//             setMessage('Failed to send verification email. Please try again.');
//           }
//         }
//       }
//   };

//   useEffect(() => {
//     // Automatically send verification email when component mounts
//     const sendInitialVerification = async () => {
//       const user = auth.currentUser;
//       if (user && !user.emailVerified) {
//         try {
//           await sendEmailVerification(user);
//           setMessage('Verification email sent successfully!');
//           setEmailSent(true);
//         } catch (error: any) {
//           if (error.code === 'auth/too-many-requests') {
//             setMessage('Please wait a few minutes before requesting another email.');
//           } else {
//             setMessage('Failed to send verification email. Please try again.');
//           }
//         }
//       }
//     };

//     sendInitialVerification();
//   }, []); // Empty dependency array - runs only once on mount

//   const handleResendVerification = async () => {
//     setLoading(true);
//     await sendVerificationEmail(false);
//     setLoading(false);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.formWrapper}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Almari</Text>
//           <Text style={styles.subtitle}>Verify your Email</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <View style={styles.messageBox}>
//             <Text style={styles.messageText}>
//               We have sent a verification email to your registered email address.
//               Please check your inbox.
//             </Text>
//             {message ? <Text style={styles.statusMessage}>{message}</Text> : null}
//           </View>

//           <TouchableOpacity
//             style={styles.signInButton}
//             onPress={() => router.replace('/(auth)/sign_in')}
//           >
//             <Text style={styles.signInText}>Back to Sign In</Text>
//           </TouchableOpacity>

//           <View style={styles.helpContainer}>
//             <Text style={styles.helpText}>Didn`t receive the email? </Text>
//             <TouchableOpacity
//               onPress={handleResendVerification}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#714463" />
//               ) : (
//                 <Text style={styles.resendText}>Resend verification</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       {/* Footer with Directrix text and globe icon */}
//       <View style={styles.footer}>
//         <View style={styles.footerTextContainer}>
//           <Text style={styles.footerText}>Part of the Directrix </Text>
//           <MaterialIcons name="public" size={16} color="#232323" />
//           <Text style={styles.footerText}> Creativity</Text>
//         </View>
//       </View>
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
//   messageBox: {
//     alignItems: 'center',
//     marginBottom: 32,
//     padding: 16,
//   },
//   verifyImage: {
//     width: 200,
//     height: 200,
//     marginBottom: 24,
//   },
//   messageText: {
//     color: '#666',
//     fontSize: 16,
//     textAlign: 'center',
//     lineHeight: 24,
//     marginBottom: 5,
//   },
//   signInButton: {
//     backgroundColor: '#714463',
//     height: 50,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//     width: '50%',
//     alignSelf: 'center'
//   },
//   signInText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   helpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   helpText: {
//     color: '#666',
//     fontSize: 14,
//   },
//   resendText: {
//     color: '#714463',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   statusMessage: {
//     marginTop: 10,
//     color: '#714463',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//     footer: {
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
// });

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

const auth = getAuth(app);

export default function Verify() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const hasSentInitialEmail = useRef(false); // Prevent duplicate sends

  const sendVerificationEmail = async (isAutomatic = false) => {
    if (emailSent && !isAutomatic) return;
    
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email sent successfully!');
        setEmailSent(true);
      } catch (error: any) {
        if (error.code === 'auth/too-many-requests') {
          setMessage('Please wait a few minutes before requesting another email.');
        } else {
          setMessage('Failed to send verification email. Please try again.');
        }
      }
    }
  };

  useEffect(() => {
    // Only send initial verification email once
    if (!hasSentInitialEmail.current) {
      hasSentInitialEmail.current = true;
      sendVerificationEmail(true);
    }
  }, []);

  const handleResendVerification = async () => {
    setLoading(true);
    await sendVerificationEmail(false);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Almari</Text>
          <Text style={styles.subtitle}>Verify your Email</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              We have sent a verification email to your registered email address.
              Please check your inbox.
            </Text>
            {message ? <Text style={styles.statusMessage}>{message}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={async () => {
              try {
                if (auth.currentUser) {
                  await signOut(auth);
                }
              } catch (e) {
                console.log('Error signing out:', e);
              }
              router.replace('/(auth)/sign_in');
            }}
          >
            <Text style={styles.signInText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Didn`t receive the email? </Text>
            <TouchableOpacity
              onPress={handleResendVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#714463" />
              ) : (
                <Text style={styles.resendText}>Resend verification</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Footer with Directrix text and globe icon */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Part of the Directrix </Text>
          <MaterialIcons name="public" size={16} color="#232323" />
          <Text style={styles.footerText}> Creativity</Text>
        </View>
      </View>
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
  messageBox: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
  },
  messageText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 5,
  },
  signInButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '50%',
    alignSelf: 'center'
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: '#666',
    fontSize: 14,
  },
  resendText: {
    color: '#714463',
    fontSize: 14,
    fontWeight: '600',
  },
  statusMessage: {
    marginTop: 10,
    color: '#714463',
    fontSize: 14,
    textAlign: 'center',
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
});