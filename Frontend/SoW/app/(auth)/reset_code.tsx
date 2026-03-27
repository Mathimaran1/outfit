import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { app } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

export default function ResetCode() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage('');

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (!value && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }

    if (value && index === 5) {
      Keyboard.dismiss();
    }
  };

  const verifyOTP = async (enteredOTP: string) => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return false;

    const otpRef = doc(db, 'otpCodes', userEmail);
    const otpDoc = await getDoc(otpRef);
    
    if (!otpDoc.exists()) return false;

    const { code, expiresAt, attempts } = otpDoc.data();
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired) {
      await deleteDoc(otpRef);
      return false;
    }

    await setDoc(otpRef, { attempts: attempts + 1 }, { merge: true });
    
    if (attempts >= 3) {
      await deleteDoc(otpRef);
      return false;
    }

    const isValid = code === enteredOTP;
    if (isValid) {
      await deleteDoc(otpRef);
    }

    return isValid;
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOTP(otpString);
      if (isValid) {
        router.replace('/(auth)/resetting');
      } else {
        setErrorMessage('Invalid or expired OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.wrapper}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) {
                  inputRefs.current[index] = ref;
                }
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                errorMessage && !digit && styles.otpInputError
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#714463',
    backgroundColor: '#f8f4f6',
  },
  otpInputError: {
    borderColor: '#e02e2e',
  },
  verifyButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    alignSelf: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e02e2e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  resendButtonText: {
    color: '#714463',
    fontSize: 14,
    fontWeight: '600',
  },
  otpSentText: {
    color: '#714463',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});
