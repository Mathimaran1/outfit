import React, { useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Keyboard
} from 'react-native';
import { Link, router } from 'expo-router';
import { app } from '../../firebaseConfig';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

const auth = getAuth(app);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
    } catch (error) {
      setErrorMessage('Failed to send reset link. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.formWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>Almari</Text>
            <Text style={styles.subtitle}>Reset Link Sent</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              We`ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { marginTop: 24 }]}
              onPress={() => router.replace('/(auth)/sign_in')}
            >
              <Text style={styles.resetButtonText}>Continue to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formWrapper}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Almari</Text>
          <Text style={styles.subtitle}>Reset Password</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.description}>
            Enter your email address and we`ll send you a password reset link.
          </Text>
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

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <View style={styles.backContainer}>
            <Text style={styles.backText}>Remember your password? </Text>
            <Link href="/(auth)/sign_in" onPress={() => setErrorMessage('')}>
              <Text style={styles.backLinkText}>Sign in</Text>
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
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 24,
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
  resetButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: 180,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
  backLinkText: {
    color: '#714463',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#e02e2e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16
  },
  disabledButton: {
    opacity: 0.7
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
