import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth, signOut, updateProfile, User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const auth = getAuth(app);
const userId = auth.currentUser?.uid;

export default function AccountManagement() {
  const user = auth.currentUser;
  const [name, setName] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/accounts');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:clothgo2025@gmail.com');
  };

  useEffect(() => {
  if (userId) {
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setName(userData.name);
        setIsDetailsLoading(false);
      }
    });

    return () => unsubscribe();
  }
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Ionicons name="settings" size={40} color="#714463" />
          </View>
          <Text style={styles.greeting}>Settings</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/(details)/account_details')}
        >
          <Ionicons name="person-circle-outline" size={24} color="#714463" />
          <Text style={styles.optionText}>Account Details</Text>
          <Ionicons name="chevron-forward" size={24} color="#714463" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
           onPress={() => setSupportModalVisible(true)}
        >
          <Ionicons name="help-circle-outline" size={24} color="#714463" />
          <Text style={styles.optionText}>Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#714463" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#714463" />
          <Text style={styles.optionText} onPress={handleLogout}>Logout</Text>
          <Ionicons name="chevron-forward" size={24} color="#714463" />
        </TouchableOpacity>
      </View>

      {/* Support Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={supportModalVisible}
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-circle" size={40} color="#714463" />
              <Text style={styles.modalTitle}>Contact Support</Text>
            </View>
            
            <Text style={styles.modalText}>
              For any questions or assistance, please contact us at:
            </Text>
            
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.emailText}>clothgo2025@gmail.com</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalText}>
              We`ll get back to you as soon as possible.
            </Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/*Footer Module*/}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Part of the Directrix </Text>
          <MaterialIcons name="public" size={16} color="#232323" />
          <Text style={styles.footerText}> Creativity</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  optionsContainer: {
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#714463',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#714463',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

