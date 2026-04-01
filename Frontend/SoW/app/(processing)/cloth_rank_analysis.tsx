import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const auth = getAuth(app);
const TEMP_STORAGE_KEY = 'tempAnalyzedClothing';


export type ClothType = 'Select Type' | 'Top' | 'Bottom' | 'Footwear' | 'Outerwear' | 'Accessories';
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

type FacialData = {
  skinTone?: string;
  faceShape?: string;
  eyeColor?: string;
  hairColor?: string;
  style?: string;
  preferences?: string[];
  [key: string]: any;
}

type RecommendationResponse = {
  recommendations: string;
  overall_score?: number;
  wardrobe_score?: number;
  top_rated_outfits?: string[];
  outfitSuggestions: {
    items: string[];
    description: string;
    style: string;
    occasion: string;
  }[];
}

export default function OutfitGeneratorScreen() {
  const params = useLocalSearchParams();
  const { selectedItem, source } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading your wardrobe...');
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
  const [facialData, setFacialData] = useState<FacialData>({});
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/(auth)/accounts');
        return;
      }

    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (recommendations?.top_rated_outfits) {
      console.log("Top rated outfits:", recommendations.top_rated_outfits);
      console.log("All clothes:", allClothes.map(c => ({ id: c.id, name: c.name })));
    }
  }, [recommendations, allClothes]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (selectedItem) {
          const parsedItem = JSON.parse(selectedItem as string) as ClothingItem;
          setSelectedClothing(parsedItem);
        } else {
          const tempItemsJson = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
          if (tempItemsJson) {
            const tempItems = JSON.parse(tempItemsJson) as ClothingItem[];
            if (tempItems.length > 0) {
              setSelectedClothing(tempItems[0]);
            }
          }
        }

        setLoadingMessage('Fetching your wardrobe...');
        await fetchWardrobeItems();

        setLoadingMessage('Fetching your profile data...');
        await fetchFacialData();

        // No longer automatically generating recommendations
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    initializeData();
  }, [selectedItem]);

  const fetchWardrobeItems = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Please log in to access your wardrobe.');
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

      if (items.length === 0) {
        setError('No items found in your wardrobe. Please add some clothes first.');
        setIsLoading(false);
        return;
      }

      setAllClothes(items);
    } catch (err) {
      console.error('Failed to fetch wardrobe items:', err);
      setError('Failed to load your wardrobe. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const fetchFacialData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Please log in to access your profile data.');
      setIsLoading(false);
      return;
    }

    try {
      setLoadingMessage('Fetching your profile data...');
      const db = getFirestore(app);
      const profileRef = doc(db, 'users', userId, 'appearance', 'profile');
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as FacialData;
        setFacialData(profileData);
        console.log('Facial data fetched successfully:', profileData);
      } else {
        console.log('No facial data found, using empty object');
        setFacialData({});
      }
    } catch (err) {
      console.error('Failed to fetch facial data:', err);
      setError('Failed to load your profile data. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedClothing || allClothes.length === 0) {
      setError('Please ensure you have selected an item and have clothes in your wardrobe.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null); // Clear any previous errors
      setLoadingMessage('Analyzing your style preferences...');

      // Format data according to the backend API expectations
      const requestData = {
        cloth_compare: {
          id: selectedClothing.id,
          name: selectedClothing.name,
          type: selectedClothing.type,
          description: selectedClothing.description || '',
          class: selectedClothing.class || '',
          imageUrl: selectedClothing.imageUrl
        },
        clothing: allClothes.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description || '',
          class: item.class || '',
          imageUrl: item.imageUrl
        })),
        face: facialData || {}
      };

      setLoadingMessage('Generating outfit recommendations...');
      console.log('Sending request to backend:', BACKEND_URL);
      const response = await axios.post(
        `${BACKEND_URL}/api/get-recommendations`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 90000
        }
      );

      if (response.status === 200 && response.data) {
        const responseData = response.data;

        // Check if we actually received valid data
        if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
          throw new Error('Backend returned empty response');
        }

        // Validate that we have meaningful data
        if (typeof responseData === 'string' && responseData.trim() === '') {
          throw new Error('Backend returned empty recommendations');
        }

        // Only proceed if we have actual data, no defaults
        let formattedData: RecommendationResponse;

        if (typeof responseData === 'string') {
          if (responseData.includes('Unable to') || responseData.includes('Error') || responseData.includes('Failed')) {
            throw new Error('Backend analysis failed');
          }
          formattedData = {
            recommendations: responseData,
            outfitSuggestions: []
          };
        } else if (typeof responseData === 'object') {
          // Validate we have actual recommendations, not defaults
          if (!responseData.recommendations && !responseData.analysis && !responseData.result) {
            throw new Error('No recommendations received from backend');
          }

          formattedData = {
            recommendations: responseData.recommendations || responseData.analysis || responseData.result,
            overall_score: responseData.overall_score,
            wardrobe_score: responseData.wardrobe_score,
            top_rated_outfits: responseData.top_rated_outfits,
            outfitSuggestions: responseData.outfitSuggestions || responseData.outfit_suggestions || []
          };
        } else {
          throw new Error('Invalid response format from backend');
        }

        console.log('Successfully processed recommendations:', formattedData);
        setRecommendations(formattedData);
        setIsGenerating(false);
      } else {
        throw new Error(`Backend returned status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setIsGenerating(false);

      // Fixed: Type assertion for error handling
      const error = err as any;

      // Set specific error messages based on error type
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Recommendation service not found. Please contact support.');
      } else if (error.message && error.message.includes('Backend')) {
        setError('Unable to analyze this item. Please try with a different item or try again later.');
      } else {
        setError('Failed to generate outfit recommendations. Please check your connection and try again.');
      }
    }
  };

  const handlebackto = async () => {
    router.push('/(tabs)/explore');
  };

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateRecommendations();
    } catch {
      // Removed unused error parameter
      setError('Failed to generate outfit recommendations. Please try again.');
    }
  };

  const handleSelectDifferentItem = () => {
    // Route based on the source parameter
    if (source === 'analyzer') {
      router.push('/(processing)/analyzer_select');
    } else {
      // Default to selection_wardrobe if source is 'wardrobe' or undefined
      router.push('/(processing)/selection_wardrobe');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#714463" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={handleGenerateRecommendations}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSelectDifferentItem}>
            <Text style={styles.secondaryButtonText}>Select Different Item</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedClothing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="shirt-outline" size={64} color="#714463" />
          <Text style={styles.errorTitle}>No Item Selected</Text>
          <Text style={styles.errorText}>Please select an item from your wardrobe to generate outfit recommendations.</Text>
          <TouchableOpacity style={styles.button} onPress={handleSelectDifferentItem}>
            <Text style={styles.buttonText}>Select an Item</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Style Analysis</Text>
          <Text style={styles.subtitle}>Based on your {selectedClothing.type.toLowerCase()}: {selectedClothing.name}</Text>
        </View>

        {/* Selected Item Display - Prominently shown at the top */}
        <View style={styles.selectedItemContainer}>
          <View style={styles.selectedItemImageContainer}>
            <Image
              source={{ uri: selectedClothing.imageUrl }}
              style={styles.selectedItemImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.selectedItemInfo}>
            <Text style={styles.selectedItemName}>{selectedClothing.name}</Text>
            <Text style={styles.selectedItemType}>{selectedClothing.type}</Text>
            {selectedClothing.class && (
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>{selectedClothing.class}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Scores Section - Only shown if scores exist */}
        {(recommendations?.overall_score !== undefined || recommendations?.wardrobe_score !== undefined) && (
          <View style={styles.scoresContainer}>
            <Text style={styles.sectionTitle}>Compatibility Scores</Text>

            <View style={styles.scoreRow}>
              {recommendations?.overall_score !== undefined && (
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>Overall Score</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{Math.round(Number(recommendations.overall_score))}</Text>
                    <Text style={styles.scoreMax}>/10</Text>
                  </View>
                </View>
              )}

              {recommendations?.wardrobe_score !== undefined && (
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>Wardrobe Compatibility</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{Math.round(Number(recommendations.wardrobe_score))}</Text>
                    <Text style={styles.scoreMax}>/10</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Top Rated Outfits Section - Only shown if top rated outfits exist */}
        {recommendations?.top_rated_outfits && recommendations.top_rated_outfits.length > 0 && (
          <View style={styles.topOutfitsContainer}>
            <Text style={styles.sectionTitle}>Top Rated Outfit Combinations</Text>
            <View style={styles.outfitGrid}>
              {recommendations.top_rated_outfits.map((outfitName, index) => {
                // Find the matching clothing item in allClothes
                const matchingItem = allClothes.find(item =>
                  item.name.toLowerCase() === outfitName.toLowerCase() ||
                  outfitName.toLowerCase().includes(item.name.toLowerCase())
                );

                return matchingItem ? (
                  <View key={index} style={styles.outfitGridItem}>
                    <View style={styles.outfitImageContainer}>
                      <Image
                        source={{ uri: matchingItem.imageUrl }}
                        style={styles.outfitImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.outfitCardInfo}>
                      <Text style={styles.outfitCardName}>{matchingItem.name}</Text>
                      <Text style={styles.outfitCardType}>{matchingItem.type}</Text>
                      {matchingItem.class && (
                        <View style={styles.outfitCardBadge}>
                          <Text style={styles.outfitCardBadgeText}>{matchingItem.class}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View key={index} style={styles.outfitGridItem}>
                    <View style={styles.outfitCardPlaceholder}>
                      <Ionicons name="shirt-outline" size={40} color="#714463" />
                      <Text style={styles.outfitCardPlaceholderText}>{outfitName}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}


        {/* Outfit Suggestions Section - Only shown if outfit suggestions exist */}
        {recommendations?.outfitSuggestions && recommendations.outfitSuggestions.length > 0 && (
          <View style={styles.outfitSuggestionsContainer}>
            <Text style={styles.sectionTitle}>Outfit Suggestions</Text>
            {recommendations.outfitSuggestions.map((outfit, index) => (
              <View key={index} style={styles.outfitCard}>
                <View style={styles.outfitHeader}>
                  <Text style={styles.outfitTitle}>Outfit {index + 1}</Text>
                  {outfit.style && (
                    <View style={styles.outfitBadge}>
                      <Text style={styles.outfitBadgeText}>{outfit.style}</Text>
                    </View>
                  )}
                  {outfit.occasion && (
                    <View style={[styles.outfitBadge, styles.occasionBadge]}>
                      <Text style={styles.outfitBadgeText}>{outfit.occasion}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.outfitDescription}>{outfit.description}</Text>
                <View style={styles.outfitItems}>
                  {outfit.items.map((itemId, itemIndex) => {
                    const item = allClothes.find(c => c.id === itemId);
                    return item ? (
                      <View key={itemIndex} style={styles.outfitItemContainer}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.outfitItemImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.outfitItemName}>{item.name}</Text>
                        {item.type && (
                          <Text style={styles.outfitItemType}>{item.type}</Text>
                        )}
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {recommendations?.recommendations && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Style Analysis</Text>
            <Markdown style={markdownStyles}>
              {typeof recommendations.recommendations === 'string'
                ? recommendations.recommendations.replace(/(\d+\.\d+)(?=\s*\/\s*10)/g, (match) => Math.round(parseFloat(match)).toString())
                : typeof recommendations === 'string'
                  ? (recommendations as string).replace(/(\d+\.\d+)(?=\s*\/\s*10)/g, (match) => Math.round(parseFloat(match)).toString())
                  : 'No detailed recommendations available'}
            </Markdown>
          </View>
        )}

        {/* Recommendations Section - Only shown if recommendations exist */}
        {recommendations && (
          <TouchableOpacity
            style={[styles.button, styles.regenerateButton]}
            onPress={handleGenerateRecommendations}
          >
            <View style={styles.regenerateButtonContent}>
              <Ionicons name="refresh-outline" size={20} color="white" style={styles.regenerateIcon} />
              <Text style={styles.buttonText}>Regenerate Analysis</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.actionsContainer}>
          {!recommendations ? (
            <TouchableOpacity style={styles.button} onPress={handleGenerateRecommendations}>
              <Text style={styles.buttonText}>Generate Recommendations</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handlebackto}
            >
              <Text style={styles.buttonText}>Back to Wardrobe</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSelectDifferentItem}
          >
            <Text style={styles.secondaryButtonText}>Select Different Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  outfitGridItem: {
    width: '48%', // Slightly less than 50% to account for spacing
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#ecd6c3',
  },
  primaryButton: {
    backgroundColor: '#714463',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecd6c3',
  },
  loadingText: {
    fontSize: 16,
    color: '#714463',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 70,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  outfitCombination: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  outfitCombinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outfitStar: {
    marginRight: 8,
  },
  outfitCombinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#281b52',
  },
  outfitItemsScroll: {
    marginBottom: 8,
  },
  outfitTextContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  outfitText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
    backgroundColor: '#fff2dd',
    transform: [{ rotate: '-5deg' }],
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    // paddingBottom: 90,
  },
  selectedItemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  selectedItemImageContainer: {
    width: '90%',
    height: 200,
    marginBottom: 7,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItemImage: {
    width: '90%',
    height: '90%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItemInfo: {
    alignItems: 'center',
  },
  selectedItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 0,
    textAlign: 'center',
  },
  selectedItemType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  classBadge: {
    backgroundColor: 'rgba(113, 68, 99, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 0,
  },
  classBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
  },
  recommendationsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  outfitSuggestionsContainer: {
    marginBottom: 20,
  },
  regenerateButton: {
    backgroundColor: '#8a6d3b',
    marginTop: 5,
    marginBottom: -10,
  },
  regenerateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateIcon: {
    marginRight: 8,
  },
  outfitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginRight: 10,
  },
  outfitBadge: {
    backgroundColor: '#714463',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  occasionBadge: {
    backgroundColor: '#8a6d3b',
  },
  outfitBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  outfitDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  outfitItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitItemContainer: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  outfitItemImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 8,
  },
  outfitItemName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  outfitItemType: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#714463',
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: '65%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    // marginTop: -5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    width: 'auto',
    height: 'auto',
  },
  secondaryButton: {
    backgroundColor: '#ecd6e5',
    borderWidth: 1,
    borderColor: '#714463',
    marginBottom: -25,
  },
  secondaryButtonText: {
    color: '#714463',
    fontSize: 16,
    fontWeight: '600',
  },
  scoresContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: 16,
    width: '45%',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#714463',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreMax: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
  },
  topOutfitsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topOutfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  outfitStar1: {
    marginRight: 8,
  },
  topOutfitText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  topOutfitsContainer1: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitCardsScroll: {
    marginTop: 12,
    marginBottom: 8,
  },
  outfitCard1: {
    width: 160,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  outfitImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  outfitImage: {
    width: '90%',
    height: '90%',
  },
  outfitCardInfo: {
    alignItems: 'center',
  },
  outfitCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 4,
  },
  outfitCardType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  outfitCardBadge: {
    backgroundColor: 'rgba(113, 68, 99, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  outfitCardBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  outfitCardPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitCardPlaceholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});

// Add these markdown styles after your existing styles
const markdownStyles = StyleSheet.create({
  // Body styling
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  // Heading styles
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 14,
    marginBottom: 7,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 12,
    marginBottom: 6,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 10,
    marginBottom: 5,
  },
  heading5: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 8,
    marginBottom: 4,
  },
  heading6: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#281b52',
    marginTop: 6,
    marginBottom: 3,
  },
  // Paragraph styling
  paragraph: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  // List styling
  list_item: {
    marginBottom: 6,
    flexDirection: 'row',
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  // Link styling
  link: {
    color: '#714463',
    textDecorationLine: 'underline',
  },
  // Emphasis styling
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  // Code styling
  code_inline: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  // Blockquote styling
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#714463',
    paddingLeft: 12,
    marginLeft: 8,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  // Table styling
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#f5f5f5',
  },
  th: {
    padding: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tr: {
    flexDirection: 'row',
  },
  td: {
    padding: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});


