import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function Accounts() {
  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'relative',
              top: -70,
            }}
            src={require('../../assets/web.mp4')}
          />
        ) : (
          <Video
            source={require('../../assets/Almari_Smart_Wardrobe_Styling.mp4')}
            style={styles.backgroundVideo}
            isLooping
            isMuted
            resizeMode={ResizeMode.COVER}
            shouldPlay
            useNativeControls={false}
          />
        )}
      </View>
      <View style={styles.overlay} />
      
      {/* Add gradient overlay at the bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.gradientOverlay}
      />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.maxWidthContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.headerSection}>
              <Text style={styles.appName}>Almari</Text>
              <Text style={styles.tagline}>Express Your Style</Text>
            </View>
            <View style={styles.bottomSection}>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.registerButton}>
                  <Text style={styles.registerText}>Create an account</Text>
                </TouchableOpacity>
              </Link>
              <View style={styles.signInWrapper}>
                <Text style={styles.alreadyUserText}></Text>
                <Link href="/(auth)/sign_in" asChild>
                  <Text style={styles.signInLink}>Sign in</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    {/* Footer with Directrix text and globe icon */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Part of the Directrix </Text>
          <MaterialIcons name="public" size={16} color="#e8ccb9" />
          <Text style={styles.footerText}> Creativity</Text>
        </View>
      </View>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
    zIndex: 2,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 1000,
    bottom: 0,
    maxWidth: 2000,
    alignSelf: 'center',
    width: '100%',
  },
  maxWidthContainer: {
    flex: 1,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#e8ccb9',
    marginBottom: 10,
    marginTop: 30,
    paddingTop: 100,
  },
  tagline: {
    fontSize: 18,
    color: '#e8ccb9',
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#714463',
    width: '80%',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 60,
  },
  registerText: {
    color: '#f0e6e3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alreadyUserText: {
    fontSize: 14,
    color: '#efe2d9',
  },
  signInLink: {
    fontSize: 16,
    color: '#e8ccb9',
    fontWeight: 'bold',
    marginTop: -70,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
    zIndex: 4, // Higher than other elements to ensure visibility
  },
  footerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#e8ccb9', // Using the same color as other text elements on this screen
    fontWeight: '500',
  },
});
