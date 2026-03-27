import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import { app } from '../../firebaseConfig';

// const { width } = Dimensions.get('window');
const auth = getAuth(app);
const db = getFirestore(app);

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Welcome to Almari",
      description: "Your personal fashion assistant"
    },
    {
      title: "Upload Photos",
      description: "Share your clothing items"
    },
    {
      title: "Get Recommendations",
      description: "AI-powered style suggestions"
    },
    {
      title: "Mix and Match",
      description: "Create perfect outfit combinations"
    },
    {
      title: "Ready to Start",
      description: "Let's begin your style journey"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      });
    }

    setTimeout(() => {
      router.replace("/(tabs)/explore");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stepsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                currentStep === index && styles.activeStep
              ]}
            />
          ))}
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, currentStep === 0 && styles.hiddenButton]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <Ionicons name="arrow-back" size={24} color="#714463" />
          </TouchableOpacity>

          {currentStep === steps.length - 1 ? (
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.disabledButton]}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <LoadingAnimation />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleNext}
            >
              <Ionicons name="arrow-forward" size={24} color="#714463" />
            </TouchableOpacity>
          )}
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: '#714463',
    width: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  navButton: {
    padding: 12,
  },
  hiddenButton: {
    opacity: 0,
  },
  continueButton: {
    backgroundColor: '#714463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000
  },
});
