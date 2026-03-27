import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { app } from '../../firebaseConfig';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

const auth = getAuth(app);

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (password: string) => {
    const validations = [
      { condition: password.length >= 7, message: 'Password must be at least 7 characters long' },
      { condition: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'Password must contain at least one special character' },
      { condition: /[a-z]/.test(password), message: 'Password must contain at least one lowercase letter' },
      { condition: /[A-Z]/.test(password), message: 'Password must contain at least one uppercase letter' },
      { condition: /[0-9]/.test(password), message: 'Password must contain at least one number' }
    ];

    for (const validation of validations) {
      if (!validation.condition) {
        setErrorMessage(validation.message);
        return false;
      }
    }
    return true;
  };

  const handlePasswordReset = async () => {
    setErrorMessage('');
    Keyboard.dismiss();

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    setIsLoading(true);
    try {
      const oobCode = 'YOUR_OOB_CODE'; // Replace with actual code from navigation params
      await confirmPasswordReset(auth, oobCode, newPassword);
      router.replace('/(auth)/sign_in');
    } catch (error) {
      setErrorMessage('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setErrorMessage('');
        }}
        secureTextEntry
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formWrapper}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ClothGo</Text>
          <Text style={styles.subtitle}>Create New Password</Text>
        </View>

        <View style={styles.formContainer}>
          {renderPasswordInput("New Password", newPassword, setNewPassword)}
          {renderPasswordInput("Confirm Password", confirmPassword, setConfirmPassword)}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.disabledButton]}
            onPress={handlePasswordReset}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  resetButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    width: 200,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e02e2e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7
  }
});
