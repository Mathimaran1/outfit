import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingAnimation from '../../components/loading_ani';
import { router } from 'expo-router';
import AppearanceForm from '../../components/face_from';
import { useFocusEffect } from '@react-navigation/native';

interface AppearanceDetailsProps {
  onClose?: () => void;
}

export default function AppearanceDetails({ onClose }: AppearanceDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [appearanceData, setAppearanceData] = useState<any>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAppearanceForm, setShowAppearanceForm] = useState(false);

  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  const fetchAppearanceData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true); // Show loading screen

    try {
      const db = getFirestore(app);
      
      // Fetch the appearance profile data
      const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
      const appearanceDoc = await getDoc(appearanceRef);
      
      if (appearanceDoc.exists()) {
        setAppearanceData(appearanceDoc.data());
      }
      
    } catch (error) {
      console.error('Error fetching appearance data:', error);
    } finally {
      // Add a slight delay to show the loading screen (optional)
      setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms delay for better UX
    }
  };

  useEffect(() => {
    const fetchAppearanceData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore(app);
        
        // Fetch the appearance profile data
        const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
        const appearanceDoc = await getDoc(appearanceRef);
        
        if (appearanceDoc.exists()) {
          setAppearanceData(appearanceDoc.data());
        }
        
      } catch (error) {
        console.error('Error fetching appearance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppearanceData();
  }, [userId]);

  useEffect(() => {
    fetchAppearanceData();
  }, [userId]);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const getBodyTypeLabel = (type: string) => {
    switch (type) {
      case 'ectomorph': return 'Ectomorph (Slim)';
      case 'mesomorph': return 'Mesomorph (Athletic)';
      case 'endomorph': return 'Endomorph (Rounded)';
      default: return type;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'non-binary': return 'Non-binary';
      case 'not-specified': return 'Prefer not to say';
      default: return gender;
    }
  };

  const handleUpdateComplete = () => {
    setShowUpdateForm(false);
    fetchAppearanceData(); // Refresh data with loading screen
  };

  const handleUpdatePress = () => {
    setShowAppearanceForm(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAppearanceData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingAnimation />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  if (!appearanceData) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#714463" />
        </TouchableOpacity>
        
        <View style={styles.noDataContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#714463" />
          <Text style={styles.noDataText}>No appearance data found</Text>
          <Text style={styles.noDataSubtext}>Please complete your profile setup first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppearanceForm 
        visible={showAppearanceForm}
        onComplete={() => {
          setShowAppearanceForm(false);
        }}
      />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={24} color="#714463" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Appearance Profile</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Face Analysis</Text>
            <Text style={styles.analysisText}>{appearanceData.faceAnalysis || 'No analysis available'}</Text>
          </View>
        </View>
        
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Physical Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="human-male-height" size={24} color="#714463" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Height</Text>
                <Text style={styles.detailValue}>{appearanceData.height} cm</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="weight" size={24} color="#714463" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{appearanceData.weight} kg</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={24} color="#714463" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{appearanceData.age} years</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="percent" size={24} color="#714463" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Fat %</Text>
                <Text style={styles.detailValue}>{appearanceData.fatPercentage}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.fullDetailItem}>
            <MaterialCommunityIcons name="human-male" size={24} color="#714463" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Body Type</Text>
              <Text style={styles.detailValue}>{getBodyTypeLabel(appearanceData.bodyType)}</Text>
            </View>
          </View>
          
          <View style={styles.fullDetailItem}>
            <Ionicons name="person-outline" size={24} color="#714463" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{getGenderLabel(appearanceData.gender)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.updateSection}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdatePress}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>Update Appearance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e9de',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4e9de',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#714463',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 1000,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 90,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#401730',
    marginBottom: 10,
    marginTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  analysisContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#401730',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  fullDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#401730',
  },
  updateSection: {
    marginTop: 20,
    paddingHorizontal: 50,
    paddingBottom: 20,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#401730',
    marginTop: 20,
  },
  noDataSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
