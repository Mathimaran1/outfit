import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
  Modal,
  InteractionManager,
  Alert,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AppearanceForm from '../../components/face_from';
import LoadingAnimation from '../../components/loading_ani';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface WardrobeData {
  itemCount: number;
  topBrands: string;
  topStyle: string;
  timestamp: number;
}

const slides = [
  {
    title: "Select Perfect",
    description: "Choose your best outfit for analysis",
    backgroundImage: require('../../assets/6.jpg'),
  },
  {
    title: "Capture",
    description: "Snap and organize your wardrobe pieces",
    backgroundImage: require('../../assets/5.jpg')
  },
  {
    title: "Wardrobe",
    description: "View your complete collection",
    backgroundImage: require('../../assets/3.jpg')
  },
  {
    title: "Smart Analysis",
    description: "AI-powered style insights",
    backgroundImage: require('../../assets/2.jpg')
  },
  {
    title: "Perfect Match",
    description: "Discover ideal outfit combinations",
    backgroundImage: require('../../assets/1.jpg')
  }
];

export default function HomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [itemCount, setItemCount] = useState(0);
  const db = getFirestore(app);
  const auth = getAuth();
  const [topBrands, setTopBrands] = useState<string>('-');
  const [topStyle, setTopStyle] = useState<string>('-');
  const [loading, setLoading] = useState(true);
  const [showAppearanceForm, setShowAppearanceForm] = useState(false);
  const [showEmptyWardrobeModal, setShowEmptyWardrobeModal] = useState(false);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [outfitBuilderLoading, setOutfitBuilderLoading] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(false);

  // New states for optimized loading
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Check if this is the first time the user is opening the app
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const hasVisitedBefore = await AsyncStorage.getItem('hasVisitedHomeBefore');
        if (hasVisitedBefore === 'true') {
          setIsFirstTimeUser(false);
        }
      } catch (error) {
        console.error('Error checking first time user:', error);
      }
    };

    checkFirstTimeUser();
  }, []);

  // Preload images in the background
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const preloadPromises = slides.map(slide => {
          if (slide.backgroundImage) {
            return Image.prefetch(Image.resolveAssetSource(slide.backgroundImage).uri);
          }
          return Promise.resolve();
        });

        await Promise.all(preloadPromises);
        setImagesPreloaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesPreloaded(true); // Still mark as loaded even if there's an error
      }
    };

    preloadImages();
  }, []);

  // Check if user has appearance data and initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Check if user has appearance data
        const userId = currentUser.uid;
        const appearanceCollectionRef = collection(db, 'users', userId, 'appearance');
        const q = query(appearanceCollectionRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setShowAppearanceForm(true);
          setLoading(false);
          return;
        }

        // Load cached data if available
        const cachedData = await loadCachedData();
        if (cachedData) {
          setItemCount(cachedData.itemCount);
          setTopBrands(cachedData.topBrands);
          setTopStyle(cachedData.topStyle);
          setDataInitialized(true);

          // If not first time user, we can show the UI immediately
          if (!isFirstTimeUser) {
            setLoading(false);

            // Refresh data in the background
            refreshDataInBackground();
            return;
          }
        }

        // For first time users or if no cached data, fetch everything
        await fetchAllData();

        // Mark that user has visited before
        await AsyncStorage.setItem('hasVisitedHomeBefore', 'true');

        // Add a small delay for first-time users only
        if (isFirstTimeUser) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    if (imagesPreloaded) {
      initializeApp();
    }
  }, [imagesPreloaded]);

  // Load cached data from AsyncStorage
  const loadCachedData = async () => {
    try {
      const cachedDataString = await AsyncStorage.getItem('wardrobeData');
      if (cachedDataString) {
        return JSON.parse(cachedDataString);
      }
      return null;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return null;
    }
  };

  // Save data to cache
  const cacheData = async (data: WardrobeData) => {
    try {
      await AsyncStorage.setItem('wardrobeData', JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  // Fetch all data and update cache
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchWardrobeCount(),
        fetchTopBrands(),
        fetchTopStyle()
      ]);

      // Cache the fetched data
      const dataToCache = {
        itemCount,
        topBrands,
        topStyle,
        timestamp: Date.now()
      };

      await cacheData(dataToCache);
      setDataInitialized(true);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  // Refresh data in background without blocking UI
  const refreshDataInBackground = async () => {
    InteractionManager.runAfterInteractions(() => {
      fetchAllData();
    });
  };

  // Handle completion of appearance form
  const handleAppearanceComplete = () => {
    setShowAppearanceForm(false);
    fetchAllData();
  };

  // Fetch wardrobe count
  const fetchWardrobeCount = async () => {
    if (auth.currentUser) {
      try {
        const wardrobeRef = collection(db, 'users', auth.currentUser.uid, 'wardrobe');
        const querySnapshot = await getDocs(wardrobeRef);
        setItemCount(querySnapshot.size);
        return querySnapshot.size;
      } catch (error) {
        console.error('Error fetching wardrobe count:', error);
        return 0;
      }
    }
    return 0;
  };

  // Fetch top brands
  const fetchTopBrands = async () => {
    if (auth.currentUser) {
      try {
        const wardrobeRef = collection(db, 'users', auth.currentUser.uid, 'wardrobe');
        const querySnapshot = await getDocs(wardrobeRef);

        const brandCounts = new Map<string, number>();
        let topBrandsList: string[] = [];
        let maxCount = 0;

        querySnapshot.forEach((doc) => {
          const brand = doc.data().brand as string;
          if (brand && brand.toLowerCase() !== 'unknown') {
            brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
          }
        });

        brandCounts.forEach((count, brand) => {
          if (count > maxCount) {
            maxCount = count;
            topBrandsList = [brand];
          } else if (count === maxCount) {
            topBrandsList.push(brand);
          }
        });

        const result = topBrandsList.length > 0 ? topBrandsList.join(' & ') : '-';
        setTopBrands(result);
        return result;
      } catch (error) {
        console.error('Error fetching top brands:', error);
        return '-';
      }
    }
    return '-';
  };

  // Fetch top style
  const fetchTopStyle = async () => {
    if (auth.currentUser) {
      try {
        const wardrobeRef = collection(db, 'users', auth.currentUser.uid, 'wardrobe');
        const querySnapshot = await getDocs(wardrobeRef);

        const labelCounts = new Map<string, number>();
        let topLabelList: string[] = [];
        let maxCount = 0;

        querySnapshot.forEach((doc) => {
          const label = doc.data().class as string;
          if (label && label.toLowerCase() !== 'unknown' && label !== '') {
            labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
          }
        });

        labelCounts.forEach((count, label) => {
          if (count > maxCount) {
            maxCount = count;
            topLabelList = [label];
          } else if (count === maxCount) {
            topLabelList.push(label);
          }
        });

        const result = topLabelList.length > 0 ? topLabelList.join(' & ') : '-';
        setTopStyle(result);
        return result;
      } catch (error) {
        console.error('Error fetching top style:', error);
        return '-';
      }
    }
    return '-';
  };

  // Only refresh data when screen comes into focus if data is not initialized
  useFocusEffect(
    React.useCallback(() => {
      if (!dataInitialized) {
        fetchAllData();
      } else {
        // If data is already initialized, refresh in background
        refreshDataInBackground();
      }
    }, [dataInitialized])
  );

  // Start carousel animation
  useEffect(() => {
    if (!loading && !showAppearanceForm) {
      const interval = setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;

        Animated.timing(slideAnim, {
          toValue: -(nextSlide * width),
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setCurrentSlide(nextSlide);
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentSlide, loading, showAppearanceForm, width]);

  // Navigation to outfit builder
  const handleOutfitBuilder = async () => {
    try {
      setOutfitBuilderLoading(true);

      // Check if user is authenticated
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.replace('/(auth)/accounts');
        return;
      }

      // Check if wardrobe has items
      if (itemCount === 0) {
        setShowEmptyWardrobeModal(true);
        return;
      }

      // Navigate to outfit selector
      router.push('/(matcher)/outfit_selector');

    } catch (error) {
      console.error('Error navigating to outfit builder:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to outfit builder. Please try again.');
    } finally {
      setOutfitBuilderLoading(false);
    }
  };

  // Navigation to weekly planner
  const handlePlanner = async () => {
    try {
      setPlannerLoading(true);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.replace('/(auth)/accounts');
        return;
      }

      router.push('/(planner)/weekly');

    } catch (error) {
      console.error('Error navigating to planner:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to outfit planner. Please try again.');
    } finally {
      setPlannerLoading(false);
    }
  };

  // Handle analyze button press (existing functionality)
  const handleAnalyze = async () => {
    try {
      setAnalyzerLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.replace('/(auth)/accounts');
        return;
      }

      if (itemCount > 0) {
        router.push('/(processing)/analyzer_select');
      } else {
        setShowEmptyWardrobeModal(true);
      }
    } catch (error) {
      console.error('Error checking wardrobe:', error);
      setShowEmptyWardrobeModal(true);
    } finally {
      setAnalyzerLoading(false);
    }
  };

  // Navigate to explore screen
  const navigateToExplore = () => {
    setShowEmptyWardrobeModal(false);
    router.push('/(tabs)/explore');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  if (showAppearanceForm) {
    return <AppearanceForm
      onComplete={handleAppearanceComplete}
      visible={showAppearanceForm}
    />;
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Almari <Text style={styles.headerColon}></Text></Text>
          <Text style={styles.headerTagline}>Shop for Fit, Style from Wardrobe</Text>
        </View>
      </View>
      <View style={styles.slideContainer}>
        <Animated.View
          style={[
            styles.slideTrack,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {slides.map((slide, slideIndex) => (
            <View key={slideIndex} style={[styles.slide, { width: width }]}>
              <ImageBackground
                source={slide.backgroundImage}
                style={styles.slideContent}
                imageStyle={{ borderRadius: 1, resizeMode: 'cover' }}
              >
                <View style={styles.slideOverlay}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideDescription}>{slide.description}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.vertLine} />

      <View style={styles.hangerIconContainer}>
        <MaterialCommunityIcons name="hanger" size={65} color="#797979" top={-40} />
      </View>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Wardrobe Stats</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statsBox}>
          <View style={[styles.statsContent, { backgroundColor: '#714463' }]}>
            <Text style={styles.statsNumber}>{itemCount}</Text>
            <Text style={styles.statsLabel}>Total Items</Text>
          </View>
        </View>

        <View style={styles.statsBox}>
          <View style={[styles.statsContent, { backgroundColor: '#714463' }]}>
            <Text style={styles.statsNumber}>{topBrands}</Text>
            <Text style={styles.statsLabel}>Top Brand</Text>
          </View>
        </View>

        <View style={styles.statsBox}>
          <TouchableOpacity
            style={[
              styles.statsContent,
              { backgroundColor: '#8a6d3b' },
              analyzerLoading && styles.statsContentDisabled
            ]}
            onPress={handleAnalyze}
            disabled={analyzerLoading}
            activeOpacity={0.7}
          >
            {analyzerLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="analytics-outline" size={24} color="#fff" />
            )}
            <Text style={styles.statsLabel}>
              {analyzerLoading ? 'Loading...' : 'Analyze'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsBox}>
          <TouchableOpacity
            style={[
              styles.statsContent,
              { backgroundColor: '#8a6d3b' },
              outfitBuilderLoading && styles.statsContentDisabled
            ]}
            onPress={handleOutfitBuilder}
            disabled={outfitBuilderLoading}
            activeOpacity={0.7}
          >
            {outfitBuilderLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="shirt-outline" size={24} color="#fff" />
            )}
            <Text style={styles.statsLabel}>
              {outfitBuilderLoading ? 'Loading...' : 'Build Outfit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsBox}>
          <View style={[styles.statsContent, { backgroundColor: '#714463' }]}>
            <Text style={styles.statsNumber}>{topStyle}</Text>
            <Text style={styles.statsLabel}>Top Style</Text>
          </View>
        </View>

        <View style={styles.statsBox}>
          <TouchableOpacity
            style={[
              styles.statsContent,
              { backgroundColor: '#2d5a87' },
              plannerLoading && styles.statsContentDisabled
            ]}
            onPress={handlePlanner}
            disabled={plannerLoading}
            activeOpacity={0.7}
          >
            {plannerLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="calendar-outline" size={24} color="#fff" />
            )}
            <Text style={styles.statsLabel}>
              {plannerLoading ? 'Loading...' : 'Outfit Planner'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty Wardrobe Modal */}
      <Modal
        visible={showEmptyWardrobeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmptyWardrobeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEmptyWardrobeModal(false)}
            >
              <Ionicons name="close" size={24} color="#714463" />
            </TouchableOpacity>

            <View style={styles.modalImageContainer}>
              <Image
                source={require('../../assets/card.png')}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.modalTitle}>Empty Wardrobe</Text>
            <Text style={styles.modalMessage}>
              You need at least one clothing item in your wardrobe to use the outfit builder.
              Add your first item to get started!
            </Text>

            <TouchableOpacity
              style={styles.addClothButton}
              onPress={navigateToExplore}
            >
              <Text style={styles.addClothButtonText}>Add Yours Now!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay for Outfit Builder */}
      {outfitBuilderLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
          <Text style={styles.loadingText}>Preparing outfit builder...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e9de',
  },
  statsContentDisabled: {
    opacity: 0.6,
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
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  sectionTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff2dd',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: -55,
    borderRadius: 8,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#281b56',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
    marginTop: 15,
    justifyContent: 'center',
  },
  statsBox: {
    width: '48%',
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  header: {
    height: height * 0.10,
    backgroundColor: '#401730',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    paddingHorizontal: 20,
  },
  hangerIconContainer: {
    alignItems: 'center',
    marginTop: -75,
    marginBottom: 0,
    zIndex: 1,
  },
  vertLine: {
    position: 'absolute',
    top: height * 0.60 - 87,
    left: 0,
    right: 0,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
    marginHorizontal: 0,
    zIndex: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerColon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e8ccb9',
  },
  headerTagline: {
    fontSize: 16,
    marginTop: 5,
    color: '#e8ccb9',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  slideContainer: {
    height: height * 0.55,
    overflow: 'hidden',
    marginBottom: -30,
  },
  slideTrack: {
    flexDirection: 'row',
    width: width * slides.length,
  },
  slide: {
    width: '100%',
    height: '100%',
  },
  slideContent: {
    height: '90%',
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e8ccb9',
    marginTop: 10,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 18,
    color: '#e8ccb9',
    textAlign: 'center',
    marginTop: 10,
  },
  slideOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '94%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -37,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#f4e9de',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  modalImageContainer: {
    width: '80%',
    height: 150,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  addClothButton: {
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  addClothButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
