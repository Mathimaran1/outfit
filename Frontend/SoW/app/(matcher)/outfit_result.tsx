// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Modal, TextInput } from 'react-native';
// import { useState, useEffect } from 'react';
// import { router, useLocalSearchParams } from 'expo-router';
// import { getAuth } from 'firebase/auth';
// import { app } from '../../firebaseConfig';
// import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
// import LoadingAnimation from '../../components/loading_ani';
// import axios from 'axios';
// import Constants from 'expo-constants';

// const auth = getAuth(app);
// const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL
// export type ClothType = 'Select Type'| 'Top' | 'Bottom' | 'Footwear' | 'Outerwear' | 'Accessories';

// type ClothingItem = {
//   id: string;
//   name: string;
//   imageUrl: string;
//   brand: string;
//   size: string;
//   type: ClothType;
//   description?: string;
//   class: string;
//   createdAt: string;
//   updatedAt: string;
//   isTemporary?: boolean;
// }

// type OutfitSelection = {
//   top: ClothingItem | null;
//   bottom: ClothingItem | null;
//   footwear: ClothingItem | null;
//   outerwear: ClothingItem | null;
//   accessories: ClothingItem[];
// }

// // Updated type for facial data
// type FacialData = {
//   skinTone?: string;
//   faceShape?: string;
//   eyeColor?: string;
//   hairColor?: string;
//   style?: string;
//   preferences?: string[];
//   [key: string]: any; 
// }

// type UserProfile = {
//   uid: string;
//   displayName: string;
//   email: string;
//   profileImageUrl?: string;
//   faceAnalysis?: {
//     beardType: string;
//     hairDensity: string;
//     faceSize: string;
//     faceStructure: string;
//     skinColor: string;
//   };
//   bodyMetrics?: {
//     height: string;
//     weight: string;
//     bodyType: string;
//     age: string;
//   };
// }

// type AnalysisResult = {
//   overallScore: number;
//   compatibility: string;
//   recommendations: string[];
//   colorHarmony: number;
//   styleConsistency: number;
//   occasionSuitability: number;
//   personalizedFeedback: string;
//   improvements: string[];
//   detailedAnalysis: {
//     faceCompatibility: string;
//     bodyTypeMatch: string;
//     colorAnalysis: string;
//     styleRecommendations: string;
//   };
//   message?: string;
//   analysis?: string;
//   result?: string;
// }

// // Custom Alert Modal Component
// interface CustomAlertProps {
//   visible: boolean;
//   title: string;
//   message: string;
//   buttons: Array<{
//     text: string;
//     onPress: () => void;
//     style?: 'default' | 'cancel' | 'destructive';
//   }>;
//   onClose: () => void;
// }

// const CustomAlert: React.FC<CustomAlertProps> = ({
//   visible,
//   title,
//   message,
//   buttons,
//   onClose,
// }) => {
//   const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
//     switch (style) {
//       case 'cancel':
//         return [styles.alertButton, styles.cancelAlertButton];
//       case 'destructive':
//         return [styles.alertButton, styles.destructiveAlertButton];
//       default:
//         return [styles.alertButton, styles.defaultAlertButton];
//     }
//   };

//   const getButtonTextStyle = (style?: 'default' | 'cancel' | 'destructive') => {
//     switch (style) {
//       case 'cancel':
//         return [styles.alertButtonText, styles.cancelAlertButtonText];
//       case 'destructive':
//         return [styles.alertButtonText, styles.destructiveAlertButtonText];
//       default:
//         return [styles.alertButtonText, styles.defaultAlertButtonText];
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <View style={styles.alertOverlay}>
//         <View style={styles.alertContainer}>
//           <View style={styles.alertHeader}>
//             <Text style={styles.alertTitle}>{title}</Text>
//             <Text style={styles.alertMessage}>{message}</Text>
//           </View>
//           <View style={styles.alertButtonContainer}>
//             {buttons.map((button, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={getButtonStyle(button.style)}
//                 onPress={() => {
//                   button.onPress();
//                   onClose();
//                 }}
//               >
//                 <Text style={getButtonTextStyle(button.style)}>
//                   {button.text}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default function OutfitAnalysisScreen() {
//   const params = useLocalSearchParams();
//   const { source, itemCount } = params;

//   const [isLoading, setIsLoading] = useState(true);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [loadingMessage, setLoadingMessage] = useState('Loading outfit data...');
//   const [outfitData, setOutfitData] = useState<OutfitSelection | null>(null);
//   const [facialData, setFacialData] = useState<FacialData>({});
//   const [allWardrobeItems, setAllWardrobeItems] = useState<ClothingItem[]>([]);
//   const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [occasion, setOccasion] = useState<string>('');
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

//   // Custom Alert States
//   const [alertConfig, setAlertConfig] = useState<{
//     visible: boolean;
//     title: string;
//     message: string;
//     buttons: Array<{
//       text: string;
//       onPress: () => void;
//       style?: 'default' | 'cancel' | 'destructive';
//     }>;
//   }>({
//     visible: false,
//     title: '',
//     message: '',
//     buttons: []
//   });

//   // Custom Alert Function
//   const showCustomAlert = (
//     title: string,
//     message: string,
//     buttons: Array<{
//       text: string;
//       onPress: () => void;
//       style?: 'default' | 'cancel' | 'destructive';
//     }>
//   ) => {
//     setAlertConfig({
//       visible: true,
//       title,
//       message,
//       buttons
//     });
//   };

//   const hideCustomAlert = () => {
//     setAlertConfig(prev => ({ ...prev, visible: false }));
//   };

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (!user) {
//         router.replace('/(auth)/accounts');
//         return;
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     initializeAnalysis();
//   }, []);

//   const initializeAnalysis = async () => {
//     try {
//       setLoadingMessage('Loading outfit data...');
//       await loadOutfitData();

//       setLoadingMessage('Loading facial data...');
//       await fetchFacialData();

//       setLoadingMessage('Loading wardrobe data...');
//       await loadWardrobeData();

//       setIsLoading(false);
//     } catch (err) {
//       console.error('Error initializing analysis:', err);
//       setError('Failed to load data. Please try again.');
//       setIsLoading(false);
//     }
//   };

//   const loadOutfitData = async () => {
//     try {
//       const storedOutfit = await AsyncStorage.getItem('selectedOutfit');
//       if (storedOutfit) {
//         const parsedData = JSON.parse(storedOutfit);
//         setOutfitData(parsedData.outfit);
//       } else {
//         throw new Error('No outfit data found');
//       }
//     } catch (err) {
//       console.error('Error loading outfit data:', err);
//       throw err;
//     }
//   };

//   const fetchFacialData = async () => {
//     const userId = auth.currentUser?.uid;
//     if (!userId) {
//       setError('Please log in to access your profile data.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setLoadingMessage('Fetching your profile data...');
//       const db = getFirestore(app);
//       const profileRef = doc(db, 'users', userId, 'appearance', 'profile');
//       const profileDoc = await getDoc(profileRef);

//       if (profileDoc.exists()) {
//         const profileData = profileDoc.data() as FacialData;
//         setFacialData(profileData);
//         console.log('Facial data fetched successfully:', profileData);
//       } else {
//         console.log('No facial data found, using empty object');
//         setFacialData({});
//       }
//     } catch (err) {
//       console.error('Failed to fetch facial data:', err);
//       setError('Failed to load your profile data. Please check your connection and try again.');
//       setIsLoading(false);
//     }
//   };

//   const loadWardrobeData = async () => {
//     try {
//       const userId = auth.currentUser?.uid;
//       if (!userId) throw new Error('User not authenticated');

//       const db = getFirestore(app);
//       const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
//       const q = query(wardrobeRef, orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(q);

//       const items: ClothingItem[] = [];
//       querySnapshot.forEach((doc) => {
//         items.push({ ...doc.data() as ClothingItem, isTemporary: false });
//       });

//       setAllWardrobeItems(items);
//     } catch (err) {
//       console.error('Error loading wardrobe data:', err);
//       // Continue without wardrobe data
//       setAllWardrobeItems([]);
//     }
//   };

//   const startAnalysis = async () => {
//     if (!outfitData) {
//       setError('No outfit data available for analysis.');
//       return;
//     }

//     if (!occasion.trim()) {
//       showCustomAlert(
//         'Missing Information',
//         'Please specify the occasion for this outfit.',
//         [{ text: 'OK', onPress: () => {} }]
//       );
//       return;
//     }

//     setIsAnalyzing(true);
//     setError(null);
//     setLoadingMessage('Analyzing your outfit...');

//     try {
//       // Prepare outfit items for analysis
//       const outfitItems = [];

//       if (outfitData.top) outfitItems.push(outfitData.top);
//       if (outfitData.bottom) outfitItems.push(outfitData.bottom);
//       if (outfitData.footwear) outfitItems.push(outfitData.footwear);
//       if (outfitData.outerwear) outfitItems.push(outfitData.outerwear);
//       if (outfitData.accessories) outfitItems.push(...outfitData.accessories);

//       // Prepare analysis payload
//       const analysisPayload = {
//         // Backend expects 'clothing' (wardrobe items)
//         clothing: allWardrobeItems.map(item => ({
//           id: item.id,
//           name: item.name,
//           type: item.type,
//           description: item.description || '',
//           class: item.class || '',
//           imageUrl: item.imageUrl
//         })),

//         // Backend expects 'face' (appearance data)
//         face: facialData || {},

//         // Additional data (if backend supports)
//         selectedOutfit: outfitItems.map(item => ({
//           id: item.id,
//           name: item.name,
//           type: item.type,
//           description: item.description || '',
//           class: item.class || '',
//           imageUrl: item.imageUrl,
//           brand: item.brand,
//           size: item.size
//         })), // Full outfit

//         occasion: occasion.trim(),
//       };

//       // Call backend API using axios
//       const response = await axios.post(`${BACKEND_URL}/api/get-outfit-recommendations`, analysisPayload, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 60000
//       });

//       if (response.status === 200 && response.data) {
//         const responseData = response.data;

//         // Check if we actually received valid data
//         if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
//           throw new Error('Backend returned empty response');
//         }

//         // Handle different response formats
//         let formattedResult: AnalysisResult;

//         if (typeof responseData === 'string') {
//           // If backend returns a string, create a basic result
//           formattedResult = {
//             overallScore: 75,
//             compatibility: 'Good',
//             recommendations: [responseData],
//             colorHarmony: 75,
//             styleConsistency: 75,
//             occasionSuitability: 75,
//             personalizedFeedback: responseData,
//             improvements: [],
//             detailedAnalysis: {
//               faceCompatibility: 'Analysis based on your features',
//               bodyTypeMatch: 'Suitable for your body type',
//               colorAnalysis: 'Good color coordination',
//               styleRecommendations: 'Consider similar styles'
//             }
//           };
//         } else {
//           // If backend returns an object, map it properly
//           formattedResult = {
//             overallScore: responseData.overallScore || responseData.overall_score || 75,
//             compatibility: responseData.compatibility || 'Good',
//             recommendations: Array.isArray(responseData.recommendations) 
//               ? responseData.recommendations 
//               : [responseData.recommendations || responseData.message || responseData.analysis || 'No specific recommendations'],
//             colorHarmony: responseData.colorHarmony || responseData.color_harmony || 75,
//             styleConsistency: responseData.styleConsistency || responseData.style_consistency || 75,
//             occasionSuitability: responseData.occasionSuitability || responseData.occasion_suitability || 75,
//             personalizedFeedback: responseData.personalizedFeedback || responseData.personalized_feedback || responseData.message || 'Analysis completed',
//             improvements: Array.isArray(responseData.improvements) ? responseData.improvements : [],
//             detailedAnalysis: {
//               faceCompatibility: responseData.detailedAnalysis?.faceCompatibility || responseData.detailed_analysis?.face_compatibility || 'Analysis based on your features',
//               bodyTypeMatch: responseData.detailedAnalysis?.bodyTypeMatch || responseData.detailed_analysis?.body_type_match || 'Suitable for your body type',
//               colorAnalysis: responseData.detailedAnalysis?.colorAnalysis || responseData.detailed_analysis?.color_analysis || 'Good color coordination',
//               styleRecommendations: responseData.detailedAnalysis?.styleRecommendations || responseData.detailed_analysis?.style_recommendations || 'Consider similar styles'
//             }
//           };
//         }

//         console.log('Successfully processed analysis:', formattedResult);
//         setAnalysisResult(formattedResult);
//       } else {
//         throw new Error(`Backend returned status: ${response.status}`);
//       }

//     } catch (err) {
//       console.error('Error analyzing outfit:', err);

//       // Type assertion for error handling
//       const error = err as any;

//       // Set specific error messages based on error type
//       if (axios.isAxiosError(error)) {
//         if (error.code === 'ECONNABORTED') {
//           setError('Request timed out. Please check your connection and try again.');
//         } else if (error.response?.status === 500) {
//           setError('Server error occurred. Please try again later.');
//         } else if (error.response?.status === 404) {
//           setError('Analysis service not found. Please contact support.');
//         } else if (error.message && error.message.includes('Backend')) {
//           setError('Unable to analyze this outfit. Please try with a different outfit or try again later.');
//         } else if (error.request) {
//           setError('Unable to connect to the analysis server. Please check your internet connection.');
//         } else {
//           setError('An unexpected error occurred during analysis.');
//         }
//       } else {
//         setError('Failed to analyze outfit. Please check your connection and try again.');
//       }
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleRetryAnalysis = async () => {
//     setError(null);
//     await startAnalysis();
//   };

//   const handleSelectDifferentOutfit = () => {
//     router.push('/(matcher)/outfit_selector');
//   };

//   const getScoreText = (score: number) => {
//     if (score >= 80) return 'Excellent';
//     if (score >= 60) return 'Good';
//     return 'Needs Improvement';
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 80) return '#4CAF50';
//     if (score >= 60) return '#FF9800';
//     return '#F44336';
//   };

//   const renderOutfitItems = () => {
//     if (!outfitData) return null;

//     const items = [];
//     if (outfitData.top) items.push({ ...outfitData.top, category: 'Top' });
//     if (outfitData.bottom) items.push({ ...outfitData.bottom, category: 'Bottom' });
//     if (outfitData.footwear) items.push({ ...outfitData.footwear, category: 'Footwear' });
//     if (outfitData.outerwear) items.push({ ...outfitData.outerwear, category: 'Outerwear' });
//     outfitData.accessories.forEach((acc, index) =>
//       items.push({ ...acc, category: `Accessory ${index + 1}` })
//     );

//     return (
//       <View style={styles.outfitContainer}>
//         <Text style={styles.sectionTitle}>Your Outfit ({items.length} items)</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {items.map((item, index) => (
//             <View key={`${item.id}-${index}`} style={styles.outfitItem}>
//               <Image source={{ uri: item.imageUrl }} style={styles.outfitItemImage} />
//               <Text style={styles.outfitItemCategory}>{item.category}</Text>
//               <Text style={styles.outfitItemName} numberOfLines={2}>{item.name}</Text>
//               {item.isTemporary && (
//                 <View style={styles.tempBadge}>
//                   <Text style={styles.tempBadgeText}>TEMP</Text>
//                 </View>
//               )}
//             </View>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderOccasionInput = () => {
//     return (
//       <View style={styles.occasionContainer}>
//         <Text style={styles.occasionLabel}>Occasion</Text>
//         <Text style={styles.occasionSubtext}>What`s the occasion for this outfit?</Text>
//         <TextInput
//           style={styles.occasionInput}
//           placeholder="e.g., Casual outing, Business meeting, Date night, Wedding..."
//           placeholderTextColor="#999"
//           value={occasion}
//           onChangeText={setOccasion}
//           multiline={false}
//           maxLength={100}
//         />
//         <Text style={styles.occasionCounter}>{occasion.length}/100</Text>
//       </View>
//     );
//   };

//   const renderAnalysisResults = () => {
//     if (!analysisResult) return null;

//     // Safety check - if backend just returned a simple message
//     if (analysisResult.message && !analysisResult.overallScore) {
//       return (
//         <View style={styles.analysisContainer}>
//           <Text style={styles.sectionTitle}>Analysis Results</Text>
//           <View style={styles.scoreCard}>
//             <Text style={styles.scoreTitle}>Backend Response</Text>
//             <Text style={styles.feedbackText}>{analysisResult.message}</Text>
//           </View>
//         </View>
//       );
//     }

//     // Only render detailed results if we have the expected data structure
//     if (!analysisResult.overallScore) {
//       return (
//         <View style={styles.analysisContainer}>
//           <Text style={styles.sectionTitle}>Analysis Results</Text>
//           <View style={styles.scoreCard}>
//             <Text style={styles.scoreTitle}>Raw Response</Text>
//             <Text style={styles.feedbackText}>{JSON.stringify(analysisResult, null, 2)}</Text>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.analysisContainer}>
//         <Text style={styles.sectionTitle}>Analysis Results</Text>

//         {/* Overall Score */}
//         <View style={styles.scoreCard}>
//           <View style={styles.scoreHeader}>
//             <Text style={styles.scoreTitle}>Overall Compatibility</Text>
//             <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(analysisResult.overallScore) }]}>
//               <Text style={styles.scoreValue}>{analysisResult.overallScore}%</Text>
//             </View>
//           </View>
//           <Text style={styles.scoreDescription}>{getScoreText(analysisResult.overallScore)}</Text>
//           <Text style={styles.compatibilityText}>{analysisResult.compatibility}</Text>
//         </View>

//         {/* Detailed Scores */}
//         <View style={styles.detailedScores}>
//           <Text style={styles.subsectionTitle}>Detailed Analysis</Text>

//           <View style={styles.scoreRow}>
//             <Text style={styles.scoreLabel}>Color Harmony</Text>
//             <View style={styles.scoreBar}>
//               <View style={[styles.scoreProgress, { 
//                 width: `${analysisResult.colorHarmony}%`,
//                 backgroundColor: getScoreColor(analysisResult.colorHarmony)
//               }]} />
//             </View>
//             <Text style={styles.scorePercent}>{analysisResult.colorHarmony}%</Text>
//           </View>

//           <View style={styles.scoreRow}>
//             <Text style={styles.scoreLabel}>Style Consistency</Text>
//             <View style={styles.scoreBar}>
//               <View style={[styles.scoreProgress, { 
//                 width: `${analysisResult.styleConsistency}%`,
//                 backgroundColor: getScoreColor(analysisResult.styleConsistency)
//               }]} />
//             </View>
//             <Text style={styles.scorePercent}>{analysisResult.styleConsistency}%</Text>
//           </View>

//           <View style={styles.scoreRow}>
//             <Text style={styles.scoreLabel}>Occasion Suitability</Text>
//             <View style={styles.scoreBar}>
//               <View style={[styles.scoreProgress, { 
//                 width: `${analysisResult.occasionSuitability}%`,
//                 backgroundColor: getScoreColor(analysisResult.occasionSuitability)
//               }]} />
//             </View>
//             <Text style={styles.scorePercent}>{analysisResult.occasionSuitability}%</Text>
//           </View>
//         </View>

//         {/* Detailed Analysis */}
//         <View style={styles.detailedAnalysisContainer}>
//           <Text style={styles.subsectionTitle}>Personalized Insights</Text>

//           <View style={styles.insightCard}>
//             <Ionicons name="person-outline" size={20} color="#714463" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Face Compatibility</Text>
//               <Text style={styles.insightText}>{analysisResult.detailedAnalysis.faceCompatibility}</Text>
//             </View>
//           </View>

//           <View style={styles.insightCard}>
//             <Ionicons name="body-outline" size={20} color="#714463" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Body Type Match</Text>
//               <Text style={styles.insightText}>{analysisResult.detailedAnalysis.bodyTypeMatch}</Text>
//             </View>
//           </View>

//           <View style={styles.insightCard}>
//             <Ionicons name="color-palette-outline" size={20} color="#714463" />
//             <View style={styles.insightContent}>
//               <Text style={styles.insightTitle}>Color Analysis</Text>
//               <Text style={styles.insightText}>{analysisResult.detailedAnalysis.colorAnalysis}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Recommendations */}
//         <View style={styles.recommendationsContainer}>
//           <Text style={styles.subsectionTitle}>Recommendations</Text>
//           {analysisResult.recommendations.map((rec, index) => (
//             <View key={index} style={styles.recommendationItem}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//               <Text style={styles.recommendationText}>{rec}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Improvements */}
//         {analysisResult.improvements.length > 0 && (
//           <View style={styles.improvementsContainer}>
//             <Text style={styles.subsectionTitle}>Suggested Improvements</Text>
//             {analysisResult.improvements.map((imp, index) => (
//               <View key={index} style={styles.improvementItem}>
//                 <Ionicons name="bulb-outline" size={20} color="#FF9800" />
//                 <Text style={styles.improvementText}>{imp}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Personalized Feedback */}
//         <View style={styles.feedbackContainer}>
//           <Text style={styles.subsectionTitle}>Personalized Feedback</Text>
//           <Text style={styles.feedbackText}>{analysisResult.personalizedFeedback}</Text>
//         </View>

//         {/* Regenerate Analysis Button */}
//         <TouchableOpacity
//           style={[styles.button, styles.regenerateButton]}
//           onPress={handleRetryAnalysis}
//         >
//           <View style={styles.regenerateButtonContent}>
//             <Ionicons name="refresh-outline" size={20} color="white" style={styles.regenerateIcon} />
//             <Text style={styles.buttonText}>Regenerate Analysis</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LoadingAnimation />
//         <Text style={styles.loadingText}>{loadingMessage}</Text>
//       </View>
//     );
//   }

//   if (isAnalyzing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LoadingAnimation />
//         <Text style={styles.loadingText}>{loadingMessage}</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Ionicons name="alert-circle-outline" size={64} color="#714463" />
//           <Text style={styles.errorTitle}>Analysis Failed</Text>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.button} onPress={handleRetryAnalysis}>
//             <Text style={styles.buttonText}>Try Again</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSelectDifferentOutfit}>
//             <Text style={styles.secondaryButtonText}>Select Different Outfit</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!outfitData) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Ionicons name="shirt-outline" size={64} color="#714463" />
//           <Text style={styles.errorTitle}>No Outfit Selected</Text>
//           <Text style={styles.errorText}>Please select an outfit to analyze.</Text>
//           <TouchableOpacity style={styles.button} onPress={handleSelectDifferentOutfit}>
//             <Text style={styles.buttonText}>Select an Outfit</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Outfit Analysis</Text>
//           <Text style={styles.subtitle}>Get personalized insights for your outfit</Text>
//         </View>

//         {renderOutfitItems()}
//         {renderOccasionInput()}

//         {!analysisResult && (
//           <View style={styles.startAnalysisContainer}>
//             <TouchableOpacity style={styles.analyzeButton} onPress={startAnalysis}>
//               <View style={styles.analyzeButtonContent}>
//                 <Ionicons name="analytics-outline" size={20} color="white" style={styles.analyzeIcon} />
//                 <Text style={styles.analyzeButtonText}>Start Analysis</Text>
//               </View>
//             </TouchableOpacity>
//             <Text style={styles.analysisNote}>
//               This will analyze your outfit based on your profile, face features, wardrobe data, and the specified occasion.
//             </Text>
//           </View>
//         )}

//         {/* {analysisResult && renderAnalysisResults()} */}

//         <View style={styles.actionsContainer}>
//           {!analysisResult ? (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => router.push('/(matcher)/outfit_selector')}
//             >
//               <Text style={styles.buttonText}>Try Another Outfit</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => router.push('/(tabs)/explore')}
//             >
//               <Text style={styles.buttonText}>Back to Wardrobe</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={[styles.button, styles.secondaryButton]}
//             onPress={() => router.push('/(matcher)/outfit_selector')}
//           >
//             <Text style={styles.secondaryButtonText}>Select Different Outfit</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Custom Alert Modal */}
//       <CustomAlert
//         visible={alertConfig.visible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         buttons={alertConfig.buttons}
//         onClose={hideCustomAlert}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ecd6c3',
//   },
//   replaceSuggestionsContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   replaceCategoryContainer: {
//     marginBottom: 16,
//   },
//   replaceCategoryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 8,
//   },
//   replaceItemsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   replaceItemCard: {
//     width: '48%',
//     backgroundColor: '#f8f4f6',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     alignItems: 'center',
//   },
//   replaceItemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 6,
//     marginBottom: 6,
//   },
//   replaceItemPlaceholder: {
//     width: 60,
//     height: 60,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 6,
//   },
//   replaceItemName: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#281b52',
//     textAlign: 'center',
//     marginBottom: 2,
//   },
//   replaceItemType: {
//     fontSize: 10,
//     color: '#666',
//     textAlign: 'center',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ecd6c3',
//   },
//   loadingText: {
//     marginTop: 20,
//     fontSize: 16,
//     color: '#714463',
//     textAlign: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingTop: 60,
//     paddingBottom: 40,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 35,
//     fontWeight: 'bold',
//     color: '#281b52',
//     textAlign: 'center',
//     marginBottom: 10,
//     paddingHorizontal: 4,
//     backgroundColor: '#fff2dd',
//     transform: [{ rotate: '-2deg' }],
//     width: '100%',
//     alignSelf: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   outfitContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 16,
//   },
//   subsectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 12,
//   },
//   outfitItem: {
//     width: 120,
//     marginRight: 16,
//     alignItems: 'center',
//     position: 'relative',
//   },
//   outfitItemImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   outfitItemCategory: {
//     fontSize: 12,
//     color: '#714463',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   outfitItemName: {
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   tempBadge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: '#ff8c00',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   tempBadgeText: {
//     fontSize: 10,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   occasionContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   occasionLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 4,
//   },
//   occasionSubtext: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   occasionInput: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//     backgroundColor: '#f9f9f9',
//     minHeight: 48,
//   },
//   occasionCounter: {
//     fontSize: 12,
//     color: '#999',
//     textAlign: 'right',
//     marginTop: 4,
//   },
//   startAnalysisContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   analyzeButton: {
//     backgroundColor: '#714463',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   analyzeButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   analyzeIcon: {
//     marginRight: 8,
//   },
//   analyzeButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   analysisNote: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   analysisContainer: {
//     marginBottom: 20,
//   },
//   scoreCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   scoreHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   scoreTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//   },
//   scoreBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   scoreValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   scoreDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   compatibilityText: {
//     fontSize: 16,
//     color: '#714463',
//     fontWeight: '600',
//   },
//   detailedScores: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   scoreLabel: {
//     fontSize: 14,
//     color: '#333',
//     width: 120,
//     fontWeight: '500',
//   },
//   scoreBar: {
//     flex: 1,
//     height: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 4,
//     marginHorizontal: 12,
//     overflow: 'hidden',
//   },
//   scoreProgress: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   scorePercent: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//     width: 40,
//     textAlign: 'right',
//   },
//   detailedAnalysisContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   insightCard: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: '#f8f4f6',
//     borderRadius: 8,
//   },
//   insightContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   insightTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 4,
//   },
//   insightText: {
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 20,
//   },
//   recommendationsContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   recommendationItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   recommendationText: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 12,
//     flex: 1,
//     lineHeight: 20,
//   },
//   improvementsContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   improvementItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   improvementText: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 12,
//     flex: 1,
//     lineHeight: 20,
//   },
//   feedbackContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   feedbackText: {
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 22,
//   },
//   regenerateButton: {
//     backgroundColor: '#8a6d3b',
//     marginTop: 5,
//     marginBottom: 10,
//   },
//   regenerateButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   regenerateIcon: {
//     marginRight: 8,
//   },
//   actionsContainer: {
//     marginTop: 20,
//   },
//   button: {
//     backgroundColor: '#714463',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   secondaryButton: {
//     backgroundColor: '#ecd6e5',
//     borderWidth: 1,
//     borderColor: '#714463',
//   },
//   secondaryButtonText: {
//     color: '#714463',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Custom Alert Styles
//   alertOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   alertContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 24,
//     width: '90%',
//     maxWidth: 400,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   alertHeader: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   alertTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   alertMessage: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   alertButtonContainer: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   alertButton: {
//     flex: 1,
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 48,
//   },
//   defaultAlertButton: {
//     backgroundColor: '#714463',
//   },
//   cancelAlertButton: {
//     backgroundColor: '#f5f5f5',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   destructiveAlertButton: {
//     backgroundColor: '#ff4444',
//   },
//   alertButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   defaultAlertButtonText: {
//     color: 'white',
//   },
//   cancelAlertButtonText: {
//     color: '#333',
//   },
//   destructiveAlertButtonText: {
//     color: 'white',
//   },
// });

import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LoadingAnimation from '../../components/loading_ani';
import axios from 'axios';
import Constants from 'expo-constants';

const auth = getAuth(app);
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL
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
  isTemporary?: boolean;
}

type OutfitSelection = {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  footwear: ClothingItem | null;
  outerwear: ClothingItem | null;
  accessories: ClothingItem[];
}

// Updated type for facial data
type FacialData = {
  skinTone?: string;
  faceShape?: string;
  eyeColor?: string;
  hairColor?: string;
  style?: string;
  preferences?: string[];
  [key: string]: any;
}

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  profileImageUrl?: string;
  faceAnalysis?: {
    beardType: string;
    hairDensity: string;
    faceSize: string;
    faceStructure: string;
    skinColor: string;
  };
  bodyMetrics?: {
    height: string;
    weight: string;
    bodyType: string;
    age: string;
  };
}

type AnalysisResult = {
  overallScore: number;
  compatibility: string;
  recommendations: string[];
  colorHarmony: number;
  styleConsistency: number;
  occasionSuitability: number;
  personalizedFeedback: string;
  improvements: {
    replace_top: string[];
    replace_bottom: string[];
  };
  detailedAnalysis: {
    faceCompatibility: string;
    bodyTypeMatch: string;
    colorAnalysis: string;
    styleRecommendations: string;
  };
  message?: string;
  analysis?: string;
  result?: string;
  tempScore?: number;
  replaceSuggestions?: { [key: string]: string[] };
  breakdownScores?: { [key: string]: number };
}

// Custom Alert Modal Component
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'cancel':
        return [styles.alertButton, styles.cancelAlertButton];
      case 'destructive':
        return [styles.alertButton, styles.destructiveAlertButton];
      default:
        return [styles.alertButton, styles.defaultAlertButton];
    }
  };

  const getButtonTextStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'cancel':
        return [styles.alertButtonText, styles.cancelAlertButtonText];
      case 'destructive':
        return [styles.alertButtonText, styles.destructiveAlertButtonText];
      default:
        return [styles.alertButtonText, styles.defaultAlertButtonText];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
          </View>
          <View style={styles.alertButtonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style)}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
              >
                <Text style={getButtonTextStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function OutfitAnalysisScreen() {
  const params = useLocalSearchParams();
  const { source, itemCount } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading outfit data...');
  const [outfitData, setOutfitData] = useState<OutfitSelection | null>(null);
  const [facialData, setFacialData] = useState<FacialData>({});
  const [allWardrobeItems, setAllWardrobeItems] = useState<ClothingItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string>('');

  // Custom Alert States
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  // Custom Alert Function
  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons
    });
  };

  const hideCustomAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Helper function to get compatibility text based on score
  const getCompatibilityText = (score: number): string => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

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
    initializeAnalysis();
  }, []);

  const initializeAnalysis = async () => {
    try {
      setLoadingMessage('Loading outfit data...');
      await loadOutfitData();

      setLoadingMessage('Loading facial data...');
      await fetchFacialData();

      setLoadingMessage('Loading wardrobe data...');
      await loadWardrobeData();

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing analysis:', err);
      setError('Failed to load data. Please try again.');
      setIsLoading(false);
    }
  };

  const loadOutfitData = async () => {
    try {
      const storedOutfit = await AsyncStorage.getItem('selectedOutfit');
      if (storedOutfit) {
        const parsedData = JSON.parse(storedOutfit);
        setOutfitData(parsedData.outfit);
      } else {
        throw new Error('No outfit data found');
      }
    } catch (err) {
      console.error('Error loading outfit data:', err);
      throw err;
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
        // console.log('Facial data fetched successfully:', profileData);
      } else {
        // console.log('No facial data found, using empty object');
        setFacialData({});
      }
    } catch (err) {
      console.error('Failed to fetch facial data:', err);
      setError('Failed to load your profile data. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const loadWardrobeData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const db = getFirestore(app);
      const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
      const q = query(wardrobeRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const items: ClothingItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ ...doc.data() as ClothingItem, isTemporary: false });
      });

      setAllWardrobeItems(items);
    } catch (err) {
      console.error('Error loading wardrobe data:', err);
      // Continue without wardrobe data
      setAllWardrobeItems([]);
    }
  };

  const startAnalysis = async () => {
    if (!outfitData) {
      setError('No outfit data available for analysis.');
      return;
    }

    if (!occasion.trim()) {
      showCustomAlert(
        'Missing Information',
        'Please specify the occasion for this outfit.',
        [{ text: 'OK', onPress: () => { } }]
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setLoadingMessage('Analyzing your outfit...');

    try {
      // Prepare outfit items for analysis
      const outfitItems = [];

      if (outfitData.top) outfitItems.push(outfitData.top);
      if (outfitData.bottom) outfitItems.push(outfitData.bottom);
      if (outfitData.footwear) outfitItems.push(outfitData.footwear);
      if (outfitData.outerwear) outfitItems.push(outfitData.outerwear);
      if (outfitData.accessories) outfitItems.push(...outfitData.accessories);

      // Prepare analysis payload
      const analysisPayload = {
        // Backend expects 'clothing' (wardrobe items)
        clothing: allWardrobeItems.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description || '',
          class: item.class || '',
          imageUrl: item.imageUrl
        })),

        // Backend expects 'face' (appearance data)
        face: facialData || {},

        // Backend expects 'selectedOutfit' (the complete outfit)
        selectedOutfit: outfitItems.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description || '',
          class: item.class || '',
          imageUrl: item.imageUrl,
          brand: item.brand || '',
          size: item.size || ''
        })),

        // Backend expects 'occasion'
        occasion: occasion.trim(),
      };

      setLoadingMessage('Generating outfit analysis...');
      console.log('Sending request to backend:', BACKEND_URL);

      // Call backend API using axios
      const response = await axios.post(`${BACKEND_URL}/api/get-outfit-recommendations`, analysisPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });
      // console.log('Backend response:', response);
      if (response.status === 200 && response.data && response.data.success) {
        const responseData = response.data;
        // Check if we actually received valid data
        if (!responseData.recommendations && !responseData.outfit_score) {
          throw new Error('Backend returned empty response');
        }

        // Access individual breakdown scores
        const fitScore = response.data?.breakdown_scores?.Fit;        // 9
        const colorScore = response.data?.breakdown_scores?.Color;    // 9
        const designScore = response.data?.breakdown_scores?.Design;  // 8
        const materialScore = response.data?.breakdown_scores?.Material; // 9
        const occasionScore = response.data?.breakdown_scores?.Occasion; // 10
        const textureScore = response.data?.breakdown_scores?.Texture;   // 9

        console.log('Breakdown Scores:', {
          fit: fitScore,
          color: colorScore,
          design: designScore,
          material: materialScore,
          occasion: occasionScore,
          texture: textureScore
        });

        const formattedResult: AnalysisResult = {
          overallScore: responseData.outfit_score,
          compatibility: getCompatibilityText(responseData.outfit_score),
          recommendations: [responseData.recommendations || 'No specific recommendations available'],

          // Use the main outfit_score for all detailed scores for now
          colorHarmony: responseData.breakdown_scores?.Color || responseData.outfit_score,
          styleConsistency: responseData.breakdown_scores?.Design || responseData.outfit_score,
          occasionSuitability: responseData.breakdown_scores?.Occasion || responseData.outfit_score,

          personalizedFeedback: responseData.recommendations || 'Analysis completed successfully',
          improvements: {
            replace_top: responseData.improvements?.replace_top || [],
            replace_bottom: responseData.improvements?.replace_bottom || []
          },
          detailedAnalysis: {
            faceCompatibility: 'Analysis based on your facial features and the selected outfit',
            bodyTypeMatch: 'Outfit evaluated for your body type compatibility',
            colorAnalysis: 'Color coordination analyzed for the complete outfit',
            styleRecommendations: 'Outfit style evaluated based on personal features'
          },
          tempScore: responseData.temp_score
        };

        // Replace the problematic console.log with this simple one:
        // console.log('Successfully processed analysis with outfit score:', responseData.outfit_score);
        setAnalysisResult(formattedResult);

      } else {
        throw new Error(response.data?.error || `Backend returned status: ${response.status}`);
      }

    } catch (err) {
      console.error('Error analyzing outfit:', err);

      // Type assertion for error handling
      const error = err as any;

      // Set specific error messages based on error type
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Analysis service not found. Please contact support.');
      } else if (error.response?.data?.error) {
        setError(`Analysis failed: ${error.response.data.error}`);
      } else if (error.message && error.message.includes('Backend')) {
        setError('Unable to analyze this outfit. Please try with a different outfit or try again later.');
      } else if (error.request) {
        setError('Unable to connect to the analysis server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryAnalysis = async () => {
    setError(null);
    await startAnalysis();
  };

  const handleSelectDifferentOutfit = () => {
    router.push('/(matcher)/outfit_selector');
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderOutfitItems = () => {
    if (!outfitData) return null;

    const items = [];
    if (outfitData.top) items.push({ ...outfitData.top, category: 'Top' });
    if (outfitData.bottom) items.push({ ...outfitData.bottom, category: 'Bottom' });
    if (outfitData.footwear) items.push({ ...outfitData.footwear, category: 'Footwear' });
    if (outfitData.outerwear) items.push({ ...outfitData.outerwear, category: 'Outerwear' });
    outfitData.accessories.forEach((acc, index) =>
      items.push({ ...acc, category: `Accessory ${index + 1}` })
    );

    return (
      <View style={styles.outfitContainer}>
        <Text style={styles.sectionTitle}>Your Outfit ({items.length} items)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.outfitItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.outfitItemImage} />
              <Text style={styles.outfitItemCategory}>{item.category}</Text>
              <Text style={styles.outfitItemName} numberOfLines={2}>{item.name}</Text>
              {item.isTemporary && (
                <View style={styles.tempBadge}>
                  <Text style={styles.tempBadgeText}>TEMP</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // const renderOccasionInput = () => {
  //   return (
  //     <View style={styles.occasionContainer}>
  //       <Text style={styles.occasionLabel}>Occasion</Text>
  //       <Text style={styles.occasionSubtext}>What`s the occasion for this outfit?</Text>
  //       <TextInput
  //         style={styles.occasionInput}
  //         placeholder="e.g., Casual outing, Business meeting, Date night, Wedding..."
  //         placeholderTextColor="#999"
  //         value={occasion}
  //         onChangeText={setOccasion}
  //         multiline={false}
  //         maxLength={100}
  //       />
  //       <Text style={styles.occasionCounter}>{occasion.length}/100</Text>
  //     </View>
  //   );
  // };

  const renderOccasionInput = () => {
    return (
      <View style={styles.occasionContainer}>
        <Text style={styles.occasionLabel}>Occasion</Text>
        <Text style={styles.occasionSubtext}>What`s the occasion for this outfit?</Text>
        <TextInput
          style={[
            styles.occasionInput,
            analysisResult && styles.occasionInputDisabled // Add disabled style when analysis exists
          ]}
          placeholder="e.g., Casual outing, Business meeting, Date night, Wedding..."
          placeholderTextColor="#999"
          value={occasion}
          onChangeText={setOccasion}
          multiline={false}
          maxLength={100}
          editable={!analysisResult} // Disable editing when analysis exists
          selectTextOnFocus={!analysisResult} // Disable text selection when disabled
        />
        <Text style={styles.occasionCounter}>{occasion.length}/100</Text>

        {/* Show a message when disabled */}
        {analysisResult && (
          <Text style={styles.occasionDisabledMessage}>
            Occasion is locked after analysis. Regenerate to modify.
          </Text>
        )}
      </View>
    );
  };


  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    // Safety check - if backend just returned a simple message
    if (analysisResult.message && !analysisResult.overallScore) {
      return (
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Backend Response</Text>
            <Text style={styles.feedbackText}>{analysisResult.message}</Text>
          </View>
        </View>
      );
    }

    // Only render detailed results if we have the expected data structure
    if (!analysisResult.overallScore) {
      return (
        <View style={styles.analysisContainer}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Raw Response</Text>
            <Text style={styles.feedbackText}>{JSON.stringify(analysisResult, null, 2)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.analysisContainer}>
        <Text style={styles.sectionTitle}>Analysis Results</Text>

        {/* Overall Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.scoreTitle}>Overall Compatibility</Text>
              <TouchableOpacity 
                onPress={() => setIsInfoModalVisible(true)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="information-circle-outline" size={22} color="#714463" />
              </TouchableOpacity>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(analysisResult.overallScore * 10) }]}>
              <Text style={styles.scoreValue}>{analysisResult.overallScore}/10</Text>
            </View>
          </View>
          {/* Removed getScoreText to avoid double labels like Good/Fair */}
          <Text style={styles.compatibilityText}>{analysisResult.compatibility}</Text>
        </View>

        {/* Detailed Scores */}
        <View style={styles.detailedScores}>
          <Text style={styles.subsectionTitle}>Detailed Analysis</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Color Harmony</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, {
                width: `${(analysisResult.colorHarmony / 10) * 100}%`,
                backgroundColor: getScoreColor((analysisResult.colorHarmony / 10) * 100)
              }]} />
            </View>
            <Text style={styles.scorePercent}>{analysisResult.colorHarmony}/10</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Style Consistency</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, {
                width: `${(analysisResult.styleConsistency / 10) * 100}%`,
                backgroundColor: getScoreColor((analysisResult.styleConsistency / 10) * 100)
              }]} />
            </View>
            <Text style={styles.scorePercent}>{analysisResult.styleConsistency}/10</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Occasion Suitability</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, {
                width: `${(analysisResult.occasionSuitability / 10) * 100}%`,
                backgroundColor: getScoreColor((analysisResult.occasionSuitability / 10) * 100)
              }]} />
            </View>
            <Text style={styles.scorePercent}>{analysisResult.occasionSuitability}/10</Text>
          </View>

          {/* Temp Score Section - Only show if > 0 */}
          {analysisResult.tempScore !== undefined && analysisResult.tempScore > 0 && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Temp Item Score</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreProgress, {
                  width: `${(analysisResult.tempScore / 10) * 100}%`,
                  backgroundColor: getScoreColor((analysisResult.tempScore / 10) * 100)
                }]} />
              </View>
              <Text style={styles.scorePercent}>{analysisResult.tempScore}/10</Text>
            </View>
          )}
        </View>

        {/* Detailed Analysis */}
        {/* <View style={styles.detailedAnalysisContainer}>
          <Text style={styles.subsectionTitle}>Personalized Insights</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="person-outline" size={20} color="#714463" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Face Compatibility</Text>
              <Text style={styles.insightText}>{analysisResult.detailedAnalysis.faceCompatibility}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="body-outline" size={20} color="#714463" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Body Type Match</Text>
              <Text style={styles.insightText}>{analysisResult.detailedAnalysis.bodyTypeMatch}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="color-palette-outline" size={20} color="#714463" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Color Analysis</Text>
              <Text style={styles.insightText}>{analysisResult.detailedAnalysis.colorAnalysis}</Text>
            </View>
          </View>
        </View> */}

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.subsectionTitle}>Recommendations</Text>
          {analysisResult.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Replace Suggestions Section */}
        {analysisResult.improvements && (analysisResult.improvements.replace_top.length > 0 || analysisResult.improvements.replace_bottom.length > 0) && (
          <View style={styles.replaceSuggestionsContainer}>
            <Text style={styles.subsectionTitle}>Suggested Replacements</Text>
            
            {Object.entries(analysisResult.improvements).map(([key, itemNames]) => {
              if (!itemNames || itemNames.length === 0) return null;
              
              const categoryLabel = key === 'replace_top' ? 'Top' : 'Bottom';
              const wardrobeType = key === 'replace_top' ? 'Top' : 'Bottom';
              
              // Extract current outfit item IDs to ensure we don't suggest what they are already wearing
              const currentOutfitIds = [
                outfitData?.top?.id,
                outfitData?.bottom?.id,
                outfitData?.footwear?.id,
                outfitData?.outerwear?.id,
                ...(outfitData?.accessories?.map(a => a.id) || [])
              ].filter(Boolean);

              return (
                <View key={key} style={styles.replaceCategorySection}>
                  <Text style={styles.replaceCategoryTitle}>Replace {categoryLabel}:</Text>
                  <View style={styles.replaceGrid}>
                    {itemNames.map((itemName, index) => {
                      // Find the matching clothing item in allWardrobeItems
                      // CRITICAL: Must match the correct category (Top or Bottom) and not be currently worn
                      const matchingItem = allWardrobeItems.find(item =>
                        item.type === wardrobeType && 
                        !currentOutfitIds.includes(item.id) &&
                        (item.name.toLowerCase() === itemName.toLowerCase() ||
                          itemName.toLowerCase().includes(item.name.toLowerCase()))
                      );

                      return matchingItem ? (
                        <View key={`${key}-${index}`} style={styles.replaceGridItem}>
                          <View style={styles.replaceImageContainer}>
                            <Image
                              source={{ uri: matchingItem.imageUrl }}
                              style={styles.replaceImage}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.replaceCardInfo}>
                            <Text style={styles.replaceCardName}>{matchingItem.name}</Text>
                            <Text style={styles.replaceCardType}>{matchingItem.type}</Text>
                            {matchingItem.class && (
                              <View style={styles.replaceCardBadge}>
                                <Text style={styles.replaceCardBadgeText}>{matchingItem.class}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ) : (
                        <View key={`${key}-${index}`} style={styles.replaceGridItem}>
                          <View style={styles.replaceCardPlaceholder}>
                            <Ionicons name="shirt-outline" size={40} color="#714463" />
                            <Text style={styles.replaceCardName}>{itemName}</Text>
                            <Text style={styles.replaceCardPlaceholderText}>(Not Found or Current)</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.actionsContainer}>
          <View style={styles.buttonGroupContainer}>
            {/* Regenerate Analysis Button - Only show if analysis exists */}
            {analysisResult && (
              <TouchableOpacity
                style={[styles.button, styles.regenerateButton]}
                onPress={handleRetryAnalysis}
              >
                <View style={styles.regenerateButtonContent}>
                  <Ionicons name="refresh-outline" size={20} color="white" style={styles.regenerateIcon} />
                  <Text style={styles.buttonText}>Regenerate Analysis</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Back to Wardrobe / Try Another Outfit Button */}
            {!analysisResult ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(matcher)/outfit_selector')}
              >
                <Text style={styles.buttonText}>Try Another Outfit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.buttonText}>Back to Wardrobe</Text>
              </TouchableOpacity>
            )}

            {/* Select Different Outfit Button */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/(matcher)/outfit_selector')}
            >
              <Text style={styles.secondaryButtonText}>Select Different Outfit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (isAnalyzing) {
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
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={handleRetryAnalysis}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSelectDifferentOutfit}>
            <Text style={styles.secondaryButtonText}>Select Different Outfit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!outfitData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}        >
          <Ionicons name="shirt-outline" size={64} color="#714463" />
          <Text style={styles.errorTitle}>No Outfit Selected</Text>
          <Text style={styles.errorText}>Please select an outfit to analyze.</Text>
          <TouchableOpacity style={styles.button} onPress={handleSelectDifferentOutfit}>
            <Text style={styles.buttonText}>Select an Outfit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Outfit Analysis</Text>
          <Text style={styles.subtitle}>Get personalized insights for your outfit</Text>
        </View>

        {renderOutfitItems()}
        {renderOccasionInput()}

        {!analysisResult && (
          <View style={styles.startAnalysisContainer}>
            <TouchableOpacity style={styles.analyzeButton} onPress={startAnalysis}>
              <View style={styles.analyzeButtonContent}>
                <Ionicons name="analytics-outline" size={20} color="white" style={styles.analyzeIcon} />
                <Text style={styles.analyzeButtonText}>Start Analysis</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.analysisNote}>
              This will analyze your outfit based on your profile, face features, wardrobe data, and the specified occasion.
            </Text>
          </View>
        )}

        {analysisResult && renderAnalysisResults()}
      </ScrollView>

      {/* Info Modal explaining Match Logic */}
      <Modal
        visible={isInfoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsInfoModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.alertOverlay} 
          activeOpacity={1} 
          onPress={() => setIsInfoModalVisible(false)}
        >
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Ionicons name="information-circle-outline" size={32} color="#714463" />
              <Text style={styles.alertTitle}>How we Match</Text>
              <Text style={[styles.alertMessage, { textAlign: 'left', alignSelf: 'stretch' }]}>
                Our AI Stylist evaluates your outfit based on four key factors:
                {"\n\n"}
                • <Text style={{ fontWeight: 'bold' }}>Color Harmony</Text>: Calculates how well the colors of your top, bottom, and footwear complement each other.
                {"\n\n"}
                • <Text style={{ fontWeight: 'bold' }}>Style Consistency</Text>: Checks if the design and material of each piece belong to the same style family (e.g., Casual, Formal).
                {"\n\n"}
                • <Text style={{ fontWeight: 'bold' }}>Occasion Suitability</Text>: Matches the entire outfit against your specified occasion and personal profile.
                {"\n\n"}
                • <Text style={{ fontWeight: 'bold' }}>Fit & Body Type</Text>: Analyzes how the clothing fit (Slim, Oversized, etc.) matches your body metrics.
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.alertButton, styles.defaultAlertButton]}
              onPress={() => setIsInfoModalVisible(false)}
            >
              <Text style={styles.defaultAlertButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecd6c3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecd6c3',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#714463',
    textAlign: 'center',
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
  occasionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 48,
  },
  occasionInputDisabled: {
    backgroundColor: '#f0f0f0', // Grayed out background
    borderColor: '#ccc', // Lighter border
    color: '#666', // Dimmed text color
    opacity: 0.7, // Slightly transparent
  },
  occasionDisabledMessage: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  replaceSuggestionsContainer: {
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
  replaceCategorySection: {
    marginBottom: 20,
  },
  replaceCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
  },
  replaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  replaceGridItem: {
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
  replaceImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  replaceImage: {
    width: '90%',
    height: '90%',
  },
  replaceCardInfo: {
    alignItems: 'center',
  },
  replaceCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 4,
  },
  replaceCardType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  replaceCardBadge: {
    backgroundColor: 'rgba(113, 68, 99, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  replaceCardBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  replaceCardPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceCardPlaceholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
    backgroundColor: '#fff2dd',
    transform: [{ rotate: '-2deg' }],
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  outfitContainer: {
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
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
  },
  outfitItem: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
  },
  outfitItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  outfitItemCategory: {
    fontSize: 12,
    color: '#714463',
    fontWeight: '600',
    marginBottom: 4,
  },
  outfitItemName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  tempBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff8c00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tempBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  occasionContainer: {
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
  occasionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 4,
  },
  occasionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  occasionCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  startAnalysisContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButton: {
    backgroundColor: '#714463',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  compatibilityText: {
    fontSize: 16,
    color: '#714463',
    fontWeight: '600',
  },
  detailedScores: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#333',
    width: 120,
    fontWeight: '500',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scorePercent: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  detailedAnalysisContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f4f6',
    borderRadius: 8,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  replaceCategoryContainer: {
    marginBottom: 16,
  },
  replaceItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  replaceItemCard: {
    width: '48%',
    backgroundColor: '#f8f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  replaceItemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  replaceItemPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  replaceItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 2,
  },
  replaceItemType: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  improvementsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  improvementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  feedbackContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 0, // Remove any horizontal padding to allow full expansion
    marginTop: -10,
  },
  buttonGroupContainer: {
    // backgroundColor: 'rgba(240, 213, 140, 0.52)', // Golden background
    padding: 30,
    marginHorizontal: -15,
    borderWidth: 1,
    // borderColor: 'rgba(240, 213, 140, 0.35)', // Fixed to match background color
    minHeight: 200,
    marginBottom: -50,
    opacity: 0.9,
    // Glassy effect properties
    backdropFilter: 'blur(6px)', // Subtle blur for glass effect
    borderRadius: 12,
    shadowColor: 'rgba(240, 213, 140, 0.25)', // Golden shadow (fixed from purple comment)
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    // Additional brightness enhancement
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 235, 180, 0.4)', // Lighter golden highlight for top edge
  },
  button: {
    backgroundColor: '#714463',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateButton: {
    backgroundColor: '#8a6d3b',
    marginBottom: 12, // Changed from marginTop: 5, marginBottom: 10
  },
  regenerateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#ecd6e5',
    borderWidth: 1,
    borderColor: '#714463',
    marginBottom: 0, // Remove bottom margin for last button
  },
  secondaryButtonText: {
    color: '#714463',
    fontSize: 16,
    fontWeight: '600',
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  defaultAlertButton: {
    backgroundColor: '#714463',
  },
  cancelAlertButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  destructiveAlertButton: {
    backgroundColor: '#ff4444',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultAlertButtonText: {
    color: 'white',
  },
  cancelAlertButtonText: {
    color: '#333',
  },
  destructiveAlertButtonText: {
    color: 'white',
  },
});
