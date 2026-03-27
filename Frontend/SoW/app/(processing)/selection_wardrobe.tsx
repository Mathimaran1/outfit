import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import * as FileSystem from 'expo-file-system';
import { sha256 } from 'js-sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth(app);
const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;
const TEMP_STORAGE_KEY = 'tempAnalyzedClothing';
const MAX_TEMP_ITEMS = 100;

export type ClothType = 'Select Type'| 'Top' | 'Bottom' | 'Footwear' | 'Outerwear' | 'Accessories';
type ClothingItem = {
  id: string;
  name: string;
  imageUrl: string;
  brand: string;
  size: string;
  type: ClothType;
  description?: string;
  class: string;
  createdAt: string;
  updatedAt: string;
}

export default function SelectionWardrobeScreen() {
  const params = useLocalSearchParams();
  const { returnTo } = params;
  
  const [isLoading, setIsLoading] = useState(false);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ClothType | 'All'>('All');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollX = useRef(0);
  const [cachedImages, setCachedImages] = useState<{[key: string]: string}>({});
  const [optimizedLinks, setOptimizedLinks] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);

  // Create cache directory if it doesn't exist
  useEffect(() => {
    const setupCacheDirectory = async () => {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_FOLDER);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGE_CACHE_FOLDER, { intermediates: true });
      }
    };
    
    setupCacheDirectory();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/(auth)/accounts');
        return;
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to get cached image or download and cache it
  const getCachedImage = async (imageUrl: string, itemId: string): Promise<string> => {
    try {
      // Create a unique filename based on the URL
      const filename = `${sha256(imageUrl)}.jpg`;
      const filePath = `${IMAGE_CACHE_FOLDER}${filename}`;
      
      // Check if file exists in cache
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        // Return the cached file URI
        return `file://${filePath}`;
      } else {
        // Download and cache the file
        const downloadResult = await FileSystem.downloadAsync(
          imageUrl,
          filePath
        );
        
        if (downloadResult.status === 200) {
          return `file://${filePath}`;
        } else {
          // If download fails, return original URL
          return imageUrl;
        }
      }
    } catch (error) {
      console.error('Error caching image:', error);
      return imageUrl; // Return original URL if caching fails
    }
  };

  const handleBackPress = () => {
    router.push('/(processing)/analyzer_select');
  };

  useEffect(() => {
    const fetchWardrobeItems = async () => {
      setIsLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        const db = getFirestore(app);
        const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
        const q = query(wardrobeRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const items: ClothingItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push(doc.data() as ClothingItem);
        });
        setClothes(items);
        
        // Start caching images in the background
        items.forEach(item => {
          cacheItemImage(item);
        });
      } catch (error) {
        console.error('Failed to fetch wardrobe items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWardrobeItems();
  }, []);

  // Function to cache a single item's image
  const cacheItemImage = async (item: ClothingItem) => {
    if (item.imageUrl) {
      const cachedUrl = await getCachedImage(item.imageUrl, item.id);
      setCachedImages(prev => ({...prev, [item.id]: cachedUrl}));
    }
  };

  useEffect(() => {
    clothes.forEach(item => {
      if (item.imageUrl.includes('secure.cloudinary.com')) {
        const publicId = item.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          const optimizedUrl = `https://res.cloudinary.com/dudzs3nys/image/upload/f_auto,q_auto/${publicId}`;
          setOptimizedLinks(prev => ({...prev, [item.id]: optimizedUrl}));
          
          // Cache the optimized URL
          if (optimizedUrl) {
            getCachedImage(optimizedUrl, item.id).then(cachedUrl => {
              setCachedImages(prev => ({...prev, [item.id]: cachedUrl}));
            });
          }
        }
      }
    });
  }, [clothes]);

  const handleScroll = (event: any) => {
    lastScrollX.current = event.nativeEvent.contentOffset.x;
  };

  const handleFilterPress = (filter: ClothType | 'All') => {
    setSelectedFilter(filter);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        x: lastScrollX.current,
        animated: false
      });
    });
  };

  const handleItemSelection = (id: string) => {
    // If the item is already selected, deselect it
    if (selectedItemId === id) {
      setSelectedItemId(null);
    } else {
      // Otherwise, select the new item
      setSelectedItemId(id);
    }
  };

  const saveToTempStorage = async (item: ClothingItem) => {
    try {
        // Check if there are existing items
        const tempItemsJson = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
        if (tempItemsJson) {
        const tempItems = JSON.parse(tempItemsJson);
        if (tempItems.length > 0) {
            // If there are existing items, clear them all
            await AsyncStorage.removeItem(TEMP_STORAGE_KEY);
            console.log('Cleared existing temporary items');
        }
        }
        
        // Create a new array with just the selected item
        const newItems = [item];
        
        // Save the updated temp items
        await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(newItems));
        
        console.log('Item saved directly to temporary storage:', item.name);
    } catch (error) {
        console.error('Error saving to temp storage:', error);
    }
  };

  const handleProceed = async () => {
    if (!selectedItemId) {
      alert('Please select an item');
      return;
    }
    
    // Don't use the loading state for navigation transitions
    // Instead, use it only for the async operation
    try {
      // Get the selected clothing item
      const selectedCloth = clothes.find(item => item.id === selectedItemId);
      
      if (!selectedCloth) {
        alert('Selected item not found');
        return;
      }
      
      // Show loading only during the async storage operation
      setIsSaving(true);
      // Save the selected item to temporary storage
      await saveToTempStorage(selectedCloth);
      setIsSaving(false);
      
      // Navigate without loading state
      const navigationParams = { 
        selectedItem: JSON.stringify(selectedCloth),
        source: 'wardrobe'
      };
      
      // Use immediate navigation without loading state
      if (typeof returnTo === 'string') {
        router.replace({  // Use replace instead of push
          pathname: returnTo as any,
          params: navigationParams
        });
      } else {
        router.replace({  // Use replace instead of push
          pathname: "/(processing)/cloth_rank_analysis" as any,
          params: navigationParams
        });
      }
    } catch (error) {
      console.error('Error during proceed:', error);
      alert('An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  const FilterSection = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.wardrobeHeader}>Select an Item</Text>
      <View style={styles.filterScrollContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          directionalLockEnabled={true}
          bounces={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0
          }}
        >
          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'All' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('All')}
            >
              <Text style={[styles.filterText, selectedFilter === 'All' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            {['Top', 'Bottom', 'Footwear', 'Outerwear', 'Accessories'].map((type) => (
              <TouchableOpacity 
                key={type}
                style={[styles.filterButton, selectedFilter === type && styles.filterButtonActive]}
                onPress={() => handleFilterPress(type as ClothType)}
              >
                <Text style={[styles.filterText, selectedFilter === type && styles.filterTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const EmptyWardrobe = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Image
          source={require('../../assets/card.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.title}>
            Your wardrobe is empty
          </Text>
          <Text style={styles.text}>
            Add some clothes to your wardrobe first.
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Go to Wardrobe</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Get filtered clothes based on selected filter
  const getFilteredClothes = () => {
    return clothes.filter(item => selectedFilter === 'All' ? true : item.type === selectedFilter);
  };

  const filteredClothes = getFilteredClothes();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingAnimation />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { overflow: 'hidden' }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <AntDesign name="arrowleft" size={24} color="#714463" />
      </TouchableOpacity>
      
      {clothes.length === 0 ? (
        <EmptyWardrobe />
      ) : (
        <View style={styles.mainContainer}>
          <FilterSection />
          
          {/* Show empty state when filtered clothes is empty but wardrobe has items */}
          {filteredClothes.length === 0 ? (
            <View style={styles.emptyFilterContainer}>
              <View style={styles.emptyContainer}>
                <Ionicons name="shirt-outline" size={64} color="#714463" />
                <Text style={styles.emptyText}>
                  No {selectedFilter === 'All' ? '' : selectedFilter.toLowerCase()} items found
                </Text>
                <Text style={styles.emptySubtext}>
                  {selectedFilter === 'All' 
                    ? 'Add some items to your wardrobe first' 
                    : `Add some ${selectedFilter.toLowerCase()} items to your wardrobe`
                  }
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.clothingGrid}>
              {filteredClothes.map((item: ClothingItem) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.clothingFrame,
                    selectedItemId === item.id && styles.selectedClothingFrame
                  ]}
                  onPress={() => handleItemSelection(item.id)}
                >
                  <View style={styles.clothingImageContainer}>
                    {selectedItemId === item.id && (
                      <View style={styles.selectedOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color="#714463" />
                      </View>
                    )}
                    {item.class && item.class !== "" && (
                      <View style={styles.classBadge}>
                        <Text style={styles.classBadgeText}>{item.class}</Text>
                      </View>
                    )}
                    <Image 
                      source={{ uri: cachedImages[item.id] || optimizedLinks[item.id] || item.imageUrl }} 
                      style={styles.clothingImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.clothingName}>{item.name}</Text>
                  <Text style={styles.clothingType}>{item.type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
                    {/* Proceed Button - Only show when there are filtered items */}
                    {filteredClothes.length > 0 && (
            <View style={styles.proceedButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  !selectedItemId && styles.proceedButtonDisabled
                ]}
                onPress={handleProceed}
                disabled={!selectedItemId}
              >
                <Text style={styles.proceedButtonText}>
                  {selectedItemId ? 'Proceed with selection' : 'Select an item to proceed'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecd6c3'
  },
  clothingImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  classBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(113, 68, 99, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    maxWidth: '80%',
  },
  classBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  filterContainer: {
    paddingTop: 70,
    paddingBottom: 1,
    backgroundColor: '#ecd6c3',
    alignItems: 'center',
  },
  wardrobeHeader: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 4,
    backgroundColor: '#fff2dd',
    transform: [{ rotate: '-5deg' }],
    width: '100%',
    alignSelf: 'center',
  },
  filterScrollContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    flexGrow: 0,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  // New style for empty filter container
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Account for potential proceed button space
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#714463',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9992a7',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0e6e3',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    marginBottom: 10,
    borderColor: '#714463',
    alignItems: 'center',
    minWidth: 100, 
    height: 40, 
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#714463',
  },
  filterText: {
    color: '#281b52',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  hero: {
    backgroundColor: '#f0e6e3',
    margin: 12,
    borderRadius: 16,
    maxWidth: 400,
    padding: 16,
    marginTop: 70,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  heroImage: {
    width: '100%',
    height: 325,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  contentHeader: {
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: '#9992a7',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  clothingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 100, // Add extra padding at the bottom for the proceed button
  },
  clothingFrame: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedClothingFrame: {
    borderWidth: 2,
    borderColor: '#714463',
    backgroundColor: '#fff2dd',
  },
  clothingImage: {
    width: '100%',
    height: 150,
    borderRadius: 4,
  },
  clothingName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  clothingType: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proceedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(236, 214, 195, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  proceedButton: {
    backgroundColor: '#714463',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
