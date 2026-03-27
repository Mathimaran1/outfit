import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Modal} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ClothPopup from '../../components/ui/cloth_pop';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import * as FileSystem from 'expo-file-system';
import { sha256 } from 'js-sha256';
import ClothingAnalysisDisplay from '../../components/Cloth_Desc';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const auth = getAuth(app);
const CLOUDINARY_URL = "cloudinary://258546172366246:TvdBDuunxGyrEYaJwVE2QlbeMXo@dudzs3nys";
const UPLOAD_PRESET = "costume";
const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;


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

// Interface for cached wardrobe data
interface CachedWardrobeData {
  clothes: ClothingItem[];
  timestamp: number;
}

export default function WardrobeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ClothType | 'All'>('All');
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollX = useRef(0);
  const [user, setUser] = useState(auth.currentUser);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimizedLinks, setOptimizedLinks] = useState<{[key: string]: string}>({});
  const [cachedImages, setCachedImages] = useState<{[key: string]: string}>({});
  const [dataInitialized, setDataInitialized] = useState(false);
  
  // New state variables for clothing analysis display
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState('');
  const [analysisImageUri, setAnalysisImageUri] = useState('');
  const [editAction, setEditAction] = useState<'save' | 'analyze'>('save');

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
      setUser(user);
      if (!user) {
        router.replace('/(auth)/accounts');
        return;
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to get cached image or download and cache it
  const getCachedImage = useCallback(async (imageUrl: string, itemId: string): Promise<string> => {
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
  }, []);

  // Load cached wardrobe data
  const loadCachedWardrobeData = useCallback(async (): Promise<ClothingItem[] | null> => {
    try {
      const cachedData = await AsyncStorage.getItem('wardrobeItems');
      if (cachedData) {
        const parsedData: CachedWardrobeData = JSON.parse(cachedData);
        // Check if cache is fresh (less than 1 hour old)
        const isCacheFresh = Date.now() - parsedData.timestamp < 3600000; // 1 hour
        if (isCacheFresh) {
          return parsedData.clothes;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading cached wardrobe data:', error);
      return null;
    }
  }, []);

  // Cache wardrobe data
  const cacheWardrobeData = useCallback(async (clothes: ClothingItem[]) => {
    try {
      const dataToCache: CachedWardrobeData = {
        clothes,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem('wardrobeItems', JSON.stringify(dataToCache));
    } catch (error) {
      console.error('Error caching wardrobe data:', error);
    }
  }, []);

  // Function to cache a single item's image
  const cacheItemImage = useCallback(async (item: ClothingItem) => {
    if (item.imageUrl && !cachedImages[item.id]) {
      const cachedUrl = await getCachedImage(item.imageUrl, item.id);
      setCachedImages(prev => ({...prev, [item.id]: cachedUrl}));
    }
  }, [getCachedImage]); // Removed cachedImages from dependencies

  // Fetch wardrobe items from Firestore
  const fetchWardrobeItems = useCallback(async () => {
    setIsLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setIsLoading(false);
      return;
    }

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
      setDataInitialized(true);
      
      // Cache the fetched data
      await cacheWardrobeData(items);
      
      // Start caching images in the background
      items.forEach(item => {
        cacheItemImage(item);
      });
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cacheWardrobeData, cacheItemImage]);

  // Fetch wardrobe items in background without blocking UI
  const fetchWardrobeItemsInBackground = useCallback(async () => {
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
      
      // Only update state if there are changes
      setClothes(prevClothes => {
        if (JSON.stringify(items) !== JSON.stringify(prevClothes)) {
          cacheWardrobeData(items);
          
          // Start caching new images in the background
          items.forEach(item => {
            cacheItemImage(item);
          });
          
          return items;
        }
        return prevClothes;
      });
    } catch (error) {
      console.error('Failed to fetch wardrobe items in background:', error);
    }
  }, [cacheWardrobeData, cacheItemImage]); // Removed clothes and cachedImages from dependencies

  // Initialize wardrobe data - FIXED: Removed dependencies that cause loops
  const initializeWardrobeData = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // First try to load from cache
    const cachedClothes = await loadCachedWardrobeData();
    if (cachedClothes) {
      setClothes(cachedClothes);
      setDataInitialized(true);
      
      // Start caching images in the background
      cachedClothes.forEach(item => {
        cacheItemImage(item);
      });
      
      // Add a small delay for smoother transition
      setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 500);
      
      // Refresh data in background
      fetchWardrobeItemsInBackground();
    } else {
      // No cache, fetch from Firestore
      await fetchWardrobeItems();
      setIsInitialLoad(false);
    }
  }, [loadCachedWardrobeData, cacheItemImage, fetchWardrobeItemsInBackground, fetchWardrobeItems]);

  // Initialize data on first render - FIXED: Only run once
  useEffect(() => {
    if (user) {
      initializeWardrobeData();
    }
  }, [user]); // Only depend on user

  // Refresh data when screen comes into focus - FIXED: Simplified dependencies
  useFocusEffect(
    useCallback(() => {
      if (user && dataInitialized) {
        // If data is already initialized, refresh in background
        fetchWardrobeItemsInBackground();
      }
    }, [user, dataInitialized, fetchWardrobeItemsInBackground])
  );

  // FIXED: Simplified optimized links effect
  useEffect(() => {
    const updateOptimizedLinks = () => {
      const newOptimizedLinks: {[key: string]: string} = {};
      let hasChanges = false;

      clothes.forEach(item => {
        if (item.imageUrl.includes('secure.cloudinary.com')) {
          const publicId = item.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            const optimizedUrl = `https://res.cloudinary.com/dudzs3nys/image/upload/f_auto,q_auto/${publicId}`;
            newOptimizedLinks[item.id] = optimizedUrl;
            
            if (!optimizedLinks[item.id]) {
              hasChanges = true;
              // Cache the optimized URL
              getCachedImage(optimizedUrl, item.id).then(cachedUrl => {
                setCachedImages(prev => ({...prev, [item.id]: cachedUrl}));
              });
            }
          }
        }
      });

      if (hasChanges) {
        setOptimizedLinks(prev => ({...prev, ...newOptimizedLinks}));
      }
    };

    updateOptimizedLinks();
  }, [clothes.length]); // Only depend on clothes length, not the entire array

  const handleScroll = useCallback((event: any) => {
    lastScrollX.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleFilterPress = useCallback((filter: ClothType | 'All') => {
    setSelectedFilter(filter);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        x: lastScrollX.current,
        animated: false
      });
    });
  }, []);

  const getOptimizedImageUrl = useCallback((cloudinaryData: any) => {
    if (cloudinaryData.public_id) {
      return `https://res.cloudinary.com/dudzs3nys/image/upload/f_auto,q_auto/${cloudinaryData.public_id}`;
    }
    return cloudinaryData.secure_url;
  }, []);

  const handleAddClothing = useCallback(async (data: { 
    name: string; 
    type: ClothingItem['type']; 
    image: File | FormData;
    brand: string;
    size: string;
    description?: string;
  }) => {
    setIsSaving(true);
    setIsUploading(true);
    const outfitId = Date.now().toString();
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      setIsSaving(false);
      setIsUploading(false);
      return;
    }

    try {
      // First, get the image data
      const imageData = (data.image as FormData).get('image');
      
      if (imageData && typeof imageData === 'object') {
        // Create a new FormData for sending to the backend for analysis
        const analyzeFormData = new FormData();
        analyzeFormData.append('images', {
          uri: (imageData as any).uri,
          type: 'image/jpeg',
          name: 'upload.jpg'
        } as any);
        
        // Send the image to the backend for analysis first
        try {
          const analyzeResponse = await axios.post(`${BACKEND_URL}/api/analyze-clothing`, 
            analyzeFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              timeout: 30000 // 30 seconds timeout
            }
          );
          
          // Now upload to Cloudinary
          const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dudzs3nys/image/upload";
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', {
            uri: (imageData as any).uri,
            type: 'image/jpeg',
            name: 'upload.jpg'
          } as any);
          cloudinaryFormData.append('upload_preset', UPLOAD_PRESET);
          cloudinaryFormData.append('cloud_name', 'dudzs3nys');

          const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: cloudinaryFormData
          });

          const cloudinaryData = await response.json();
          const imageUrl = getOptimizedImageUrl(cloudinaryData);
          
          // Extract descriptions and labels from the analysis response
          let generatedDescription = "No description available.";
          let generatedLabels = "";
          
          if (analyzeResponse.status === 200) {
            const analyzeData = analyzeResponse.data;
            if (analyzeData.descriptions && analyzeData.descriptions.length > 0) {
              generatedDescription = analyzeData.descriptions[0]; // Take first description
            }
            if (analyzeData.labels && analyzeData.labels.length > 0) {
              generatedLabels = analyzeData.labels[0]; // Take first label
            }
          }

          // Create the new item with the analysis results
          const newItem: ClothingItem = {
            id: outfitId,
            name: data.name,
            imageUrl: imageUrl,
            type: data.type,
            brand: data.brand,
            size: data.size,
            description: generatedDescription,
            class: generatedLabels,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const db = getFirestore(app);
          const wardrobeRef = doc(db, 'users', userId, 'wardrobe', outfitId);
          await setDoc(wardrobeRef, newItem);
          
          // Update local state and cache
          setClothes(prevClothes => {
            const updatedClothes = [...prevClothes, newItem];
            cacheWardrobeData(updatedClothes);
            return updatedClothes;
          });
          
          // Cache the new image
          cacheItemImage(newItem);
          
          // Close the popup
          setIsPopupOpen(false);
          
          // Show the analysis popup with the generated description
          setAnalysisData(generatedDescription);
          setAnalysisImageUri(imageUrl);
          
          setTimeout(() => {
            setIsUploading(false);
            setShowAnalysis(true);
          }, 1000);
          
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.error('Server error:', error.response.status, error.response.data);
            } else if (error.request) {
              console.error('Network error - no response received:', error.request);
            } else {
              console.error('Request setup error:', error.message);
            }
          } else {
            console.error('Unexpected error:', error);
          }
          
          // Even if analysis fails, still try to upload to Cloudinary and save the item
          try {
            const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dudzs3nys/image/upload";
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', {
              uri: (imageData as any).uri,
              type: 'image/jpeg',
              name: 'upload.jpg'
            } as any);
            cloudinaryFormData.append('upload_preset', UPLOAD_PRESET);
            cloudinaryFormData.append('cloud_name', 'dudzs3nys');

            const response = await fetch(cloudinaryUrl, {
              method: 'POST',
              body: cloudinaryFormData
            });

            const cloudinaryData = await response.json();
            const imageUrl = getOptimizedImageUrl(cloudinaryData);
            
            // Create the new item without analysis results
            const newItem: ClothingItem = {
              id: outfitId,
              name: data.name,
              imageUrl: imageUrl,
              type: data.type,
              brand: data.brand,
              size: data.size,
              description: data.description || "Analysis failed. No description available.",
              class: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const db = getFirestore(app);
            const wardrobeRef = doc(db, 'users', userId, 'wardrobe', outfitId);
            await setDoc(wardrobeRef, newItem);
            
            // Update local state and cache
            setClothes(prevClothes => {
              const updatedClothes = [...prevClothes, newItem];
              cacheWardrobeData(updatedClothes);
              return updatedClothes;
            });
            
            // Cache the new image
            cacheItemImage(newItem);
            
            // Close the popup
            setIsPopupOpen(false);
            setIsUploading(false);
            
          } catch (cloudinaryError) {
            console.error('Failed to upload to Cloudinary:', cloudinaryError);
            setIsUploading(false);
          }
        }
      }
      setIsSaving(false);
    } catch (error) {
      console.error('Operation failed:', error);
      setIsSaving(false);
      setIsUploading(false);
    }
  }, [getOptimizedImageUrl, cacheWardrobeData, cacheItemImage]);
  
  const handleDelete = useCallback(async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    // First close the detail view modal
    setIsDetailViewOpen(false);
    
    // Wait for the modal animation to complete before showing loading and starting deletion
    setTimeout(() => {
      // Now show loading and start the deletion process
      setIsDeleting(true);
      
      // Perform the actual deletion in the background
      deleteItem(userId, id).then(() => {
        setIsDeleting(false);
      }).catch(error => {
        console.error('Delete failed:', error);
        setIsDeleting(false);
      });
    }, 500); // Increased timeout to ensure modal is fully closed
  }, []);

  // Separate the deletion logic for cleaner code
  const deleteItem = useCallback(async (userId: string, id: string) => {
    try {
      const db = getFirestore(app);
      const itemToDelete = clothes.find(item => item.id === id);
      
      if (itemToDelete) {
        const urlParts = itemToDelete.imageUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        
        const cloudinaryDeleteUrl = `https://api.cloudinary.com/v1_1/dudzs3nys/image/destroy`;
        await fetch(cloudinaryDeleteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: '258546172366246',
            upload_preset: UPLOAD_PRESET
          })
        });
        
        // Remove cached image
        setCachedImages(prev => {
          if (prev[id]) {
            try {
              const cachedPath = prev[id].replace('file://', '');
              FileSystem.deleteAsync(cachedPath, { idempotent: true });
            } catch (error) {
              console.error('Error deleting cached image:', error);
            }
            const newCache = {...prev};
            delete newCache[id];
            return newCache;
          }
          return prev;
        });
      }

      await deleteDoc(doc(db, 'users', userId, 'wardrobe', id));
      
      // Update local state and cache
      setClothes(prevClothes => {
        const updatedClothes = prevClothes.filter(item => item.id !== id);
        cacheWardrobeData(updatedClothes);
        return updatedClothes;
      });
      
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }, [clothes, cacheWardrobeData]);

  const handleEdit = useCallback(async (data: { 
    name: string; 
    type: ClothingItem['type']; 
    image: File | FormData;
    brand: string;
    size: string;
    description?: string;
  }, action: 'save' | 'analyze' = 'analyze') => {
    if (!selectedItem || !auth.currentUser?.uid) return;
  
    setIsSaving(true);
    const userId = auth.currentUser.uid;
  
    try {
      // Check if image has actually changed by comparing with original
      let hasNewImage = false;
      let imageUri = null;
      
      // Check if data.image is FormData and has actual new image data
      if (data.image instanceof FormData) {
        const imageData = data.image.get('image');
        if (imageData && typeof imageData === 'object' && (imageData as any).uri) {
          // Check if the URI is different from the existing image URL
          const newImageUri = (imageData as any).uri;
          if (newImageUri !== selectedItem.imageUrl && !newImageUri.startsWith('http')) {
            hasNewImage = true;
            imageUri = newImageUri;
          }
        }
      }
  
      // Check what metadata has changed
      const nameChanged = data.name !== selectedItem.name;
      const brandChanged = data.brand !== selectedItem.brand;
      const sizeChanged = data.size !== selectedItem.size;
      const typeChanged = data.type !== selectedItem.type;
      
      console.log('Edit analysis:', {
        nameChanged,
        brandChanged, 
        sizeChanged,
        typeChanged,
        hasNewImage,
        imageUri: imageUri ? 'present' : 'none'
      });
  
      if (!hasNewImage) {
        // NO NEW IMAGE - Just update metadata, no analysis
        console.log('METADATA UPDATE ONLY - No backend analysis');
        
        const updatedItem: ClothingItem = {
          ...selectedItem,
          name: data.name,
          type: data.type,
          brand: data.brand,
          size: data.size,
          // Keep ALL existing data unchanged
          description: selectedItem.description,
          class: selectedItem.class,
          imageUrl: selectedItem.imageUrl,
          updatedAt: new Date().toISOString()
        };
  
        // Save directly to Firestore
        const db = getFirestore(app);
        const wardrobeRef = doc(db, 'users', userId, 'wardrobe', selectedItem.id);
        await setDoc(wardrobeRef, updatedItem);
        
        // Update local state and cache
        setClothes(prevClothes => {
          const updatedClothes = prevClothes.map(item => 
            item.id === selectedItem.id ? updatedItem : item
          );
          cacheWardrobeData(updatedClothes);
          return updatedClothes;
        });
        
        // Close edit popup immediately - no analysis
        setIsEditing(false);
        setIsDetailViewOpen(false);
        setIsSaving(false);
        
        console.log('Metadata update completed - NO ANALYSIS PERFORMED');
        
      } else {
        // NEW IMAGE DETECTED - Perform analysis
        console.log('NEW IMAGE DETECTED - Performing analysis');
        
        const analyzeFormData = new FormData();
        analyzeFormData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'upload.jpg'
        } as any);
        
        try {
          // Send to backend for analysis
          const analyzeResponse = await axios.post(`${BACKEND_URL}/api/analyze-clothing`, 
            analyzeFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              timeout: 30000
            }
          );
          
          // Upload to Cloudinary
          const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dudzs3nys/image/upload";
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'upload.jpg'
          } as any);
          cloudinaryFormData.append('upload_preset', UPLOAD_PRESET);
          cloudinaryFormData.append('cloud_name', 'dudzs3nys');
  
          const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: cloudinaryFormData
          });
  
          const cloudinaryData = await response.json();
          const imageUrl = getOptimizedImageUrl(cloudinaryData);
          
          // Extract analysis results
          let generatedDescription = "No description available.";
          let generatedLabels = "";
          
          if (analyzeResponse.status === 200) {
            const analyzeData = analyzeResponse.data;
            if (analyzeData.descriptions && analyzeData.descriptions.length > 0) {
              generatedDescription = analyzeData.descriptions[0];
            }
            if (analyzeData.labels && analyzeData.labels.length > 0) {
              generatedLabels = analyzeData.labels[0];
            }
          }
  
          // Update with analysis results
          const updatedItem: ClothingItem = {
            ...selectedItem,
            name: data.name,
            type: data.type,
            brand: data.brand,
            size: data.size,
            description: generatedDescription,
            class: generatedLabels,
            imageUrl: imageUrl,
            updatedAt: new Date().toISOString()
          };
  
          const db = getFirestore(app);
          const wardrobeRef = doc(db, 'users', userId, 'wardrobe', selectedItem.id);
          await setDoc(wardrobeRef, updatedItem);
          
          // Update local state and cache
          setClothes(prevClothes => {
            const updatedClothes = prevClothes.map(item => 
              item.id === selectedItem.id ? updatedItem : item
            );
            cacheWardrobeData(updatedClothes);
            return updatedClothes;
          });
          
          cacheItemImage(updatedItem);
          
          // Close edit popup and show analysis
          setIsEditing(false);
          setIsDetailViewOpen(false);
          
          setAnalysisData(generatedDescription);
          setAnalysisImageUri(imageUrl);
          
          setTimeout(() => {
            setIsSaving(false);
            setShowAnalysis(true);
          }, 1000);
          
        } catch (error) {
          console.error('Analysis failed:', error);
          setIsSaving(false);
          setIsEditing(false);
          setIsDetailViewOpen(false);
        }
      }
      
    } catch (error) {
      console.error('Edit failed:', error);
      setIsSaving(false);
      setIsEditing(false);
      setIsDetailViewOpen(false);
    }
  }, [selectedItem, getOptimizedImageUrl, cacheWardrobeData, cacheItemImage]);

  const handleSaveAnalysis = useCallback((editedData: string) => {
    // Here you could update the database with the edited analysis if needed
    setAnalysisData(editedData);
    setShowAnalysis(false);
  }, []);

  const FilterSection = () => (
    <View style={styles.filterContainer}>
    <Text style={styles.wardrobeHeader}>Wardrobe</Text>
    <TouchableOpacity 
      style={styles.analyzerButton}
      onPress={() => router.push('/(processing)/analyzer_select')}
    >
      <Ionicons name="color-wand" size={24} color="#714463" />
      <Text style={styles.analyzerButtonText}>Analyzer Mode</Text>
    </TouchableOpacity>
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
            Welcome to{'\n'}your{' '}
            <View style={styles.appName}>
              <Text style={styles.appNameText}>Wardrobe</Text>
            </View>
          </Text>
          <Text style={styles.text}>
            Start building your digital wardrobe by adding your first clothing fit.
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsPopupOpen(true)}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Drop your Outfit</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const DetailView = () => (
    <Modal
      visible={isDetailViewOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsDetailViewOpen(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedItem && (
            <>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setIsDetailViewOpen(false)}
              >
                <View>
                  <MaterialIcons name="cancel" size={24} color="#000000" />
                </View>
              </TouchableOpacity>
              
              {/* Updated image container with consistent styling */}
              <View style={styles.modalImageContainer}>
                <Image 
                  source={{ uri: cachedImages[selectedItem.id] || selectedItem.imageUrl }} 
                  style={styles.modalImage} 
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.modalTitle}>{selectedItem.name}</Text>
              <Text style={styles.modalDetail}>Type: {selectedItem.type}</Text>
              <Text style={styles.modalDetail}>Brand: {selectedItem.brand}</Text>
              <Text style={styles.modalDetail}>Size: {selectedItem.size}</Text>  
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    if (selectedItem) {
                      setIsEditing(true);
                      setIsDetailViewOpen(false);
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(selectedItem.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Show loading only for initial load
  if (isLoading && isInitialLoad) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LoadingAnimation />
      </View>
    );
  }

return (
  <View style={[styles.container, { overflow: 'hidden' }]}>
    {isUploading && (
      <View style={styles.loadingOverlay}>
        <LoadingAnimation />
      </View>
    )}
    {isDeleting && (
      <Modal
        visible={isDeleting}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      </Modal>
    )}
    {clothes.length === 0 && !isLoading ? (
      <EmptyWardrobe />
    ) : (
      <View style={styles.mainContainer}>
        <FilterSection />
        <ScrollView contentContainerStyle={styles.clothingGrid}>
          {clothes
            .filter(item => selectedFilter === 'All' ? true : item.type === selectedFilter)
            .map((item: ClothingItem) => (
              <TouchableOpacity
                key={item.id}
                style={styles.clothingFrame}
                onPress={() => {
                  setSelectedItem(item);
                  setIsDetailViewOpen(true);
                }}
              >
                <View style={styles.clothingImageContainer}>
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
            
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedItem(null);
              setIsPopupOpen(true);
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )}
    
<ClothPopup
  isOpen={isPopupOpen || isEditing}
  onClose={() => {
    if (!isSaving) {
      setIsPopupOpen(false);
      setIsEditing(false);
    }
  }}
  onSubmit={(data, action) => {
    if (isEditing) {
      handleEdit(data, action);
    } else {
      handleAddClothing(data);
    }
  }}
  initialValues={isEditing && selectedItem ? {
    name: selectedItem.name,
    type: selectedItem.type,
    brand: selectedItem.brand,
    size: selectedItem.size,
    description: selectedItem.description,
    image: selectedItem.imageUrl
  } : undefined}
  modalStyle={styles.popupContainer}
  isSaving={isSaving}
  isEditing={isEditing}
/>


    <DetailView />

    {/* Add the ClothingAnalysisDisplay component */}
    <ClothingAnalysisDisplay
      imageUri={analysisImageUri}
      analysisData={analysisData}
      isVisible={showAnalysis}
      onClose={() => setShowAnalysis(false)}
      onSave={handleSaveAnalysis}
      isLoading={false}
    />
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
},
clothingImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
},
modalImageContainer: {
  width: '100%',
  height: 250,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  marginBottom: 16,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
},
modalImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
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
mainContainer: {
  flex: 1,
},
popupContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: -2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
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
loadingContainer: {
  justifyContent: 'center',
  alignItems: 'center',
},
filterTextActive: {
  color: '#ffffff',
},
closeIcon: {
  position: 'absolute',
  right: 10,
  top: 10,
  width: 30,
  height: 30,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  backgroundColor: '#f0f0f0',
  borderRadius: 15,
},
closeIconText: {
  fontSize: 24,
  color: '#666',
  fontWeight: 'bold',
  lineHeight: 29,
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
appName: {
  backgroundColor: '#fff2dd',
  transform: [{ rotate: '-5deg' }],
  paddingHorizontal: 6,
},
appNameText: {
  fontSize: 28,
  fontWeight: '700',
  color: '#281b52',
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
},
clothingFrame: {
  width: '48%',
  marginBottom: 1,
  backgroundColor: 'white',
  borderRadius: 8,
  padding: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  marginTop: 5,
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
addButton: {
  width: '48%',
  height: 220,
  backgroundColor: '#f0e6e3',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#714463',
  borderStyle: 'dashed',
  marginTop: 5,
},
addButtonText: {
  fontSize: 40,
  color: '#714463',
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  width: '90%',
  maxWidth: 400,
  alignItems: 'center',
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
  marginTop: 20,
},
actionButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  minWidth: 100,
  alignItems: 'center',
},
editButton: {
  backgroundColor: '#714463',
},
deleteButton: {
  backgroundColor: '#ff4444',
},
actionButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
},
closeButton: {
  marginTop: 20,
  padding: 10,
},
closeButtonText: {
  color: '#666',
  fontSize: 16,
},
headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 20,
  marginBottom: 25,
},
analyzerButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff2dd',
  marginBottom: 20,
  padding: 10,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#714463',
},
analyzerButtonText: {
  marginLeft: 8,
  color: '#714463',
  fontWeight: '500',
},
modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 12,
  color: '#281b52',
},
modalDetail: {
  fontSize: 16,
  marginBottom: 8,
  color: '#666',
},
});

