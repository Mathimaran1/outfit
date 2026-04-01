// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Modal, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform, Animated, Keyboard, Alert, Linking, ActivityIndicator, ImageStyle, ImageResizeMode } from 'react-native';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Picker } from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { ClothType } from '../(tabs)/explore';

// const { width, height } = Dimensions.get('window');

// // Constants
// const BACKEND_URL = 'http://10.126.203.185:5000'; // Update with your actual backend URL
// const TEMP_STORAGE_KEY = 'tempAnalyzedClothing';
// const MAX_TEMP_ITEMS = 100;

// // Custom ClothingAnalysisDisplay component with Proceed button
// interface EnhancedClothingAnalysisDisplayProps {
//   imageUri: string;
//   analysisData: string;
//   isVisible: boolean;
//   isLoading: boolean;
//   onClose: () => void;
//   onSave: (editedData: string) => void;
//   onProceed: () => void;
//   imageStyle?: ImageStyle;
//   imageResizeMode?: ImageResizeMode;
// }

// const EnhancedClothingAnalysisDisplay: React.FC<EnhancedClothingAnalysisDisplayProps> = ({
//   imageUri,
//   analysisData,
//   isVisible,
//   isLoading,
//   onClose,
//   onSave,
//   onProceed,
//   imageStyle = {},
//   imageResizeMode = "contain"
// }) => {
//   const [editedData, setEditedData] = useState(analysisData);
//   const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//     setEditedData(analysisData);
//   }, [analysisData]);

//   const handleSave = () => {
//     onSave(editedData);
//     setIsEditing(false);
//   };

//   return (
//     <Modal
//       visible={isVisible}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={onClose}
//           >
//             <MaterialIcons name="close" size={26} color="#000" />
//           </TouchableOpacity>

//           <View style={styles.imageContainer}>
//             <Image
//               source={{ uri: imageUri }}
//               style={[styles.image, imageStyle]}
//               resizeMode={imageResizeMode}
//             />
//           </View>

//           {isLoading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#714463" />
//               <Text style={styles.loadingText}>Analyzing your clothing...</Text>
//             </View>
//           ) : (
//             <>
//               <View style={styles.analysisContainer}>
//                 <Text style={styles.sectionTitle}>Clothing Analysis</Text>
//                 {isEditing ? (
//                   <TextInput
//                     style={styles.editInput}
//                     multiline
//                     value={editedData}
//                     onChangeText={setEditedData}
//                   />
//                 ) : (
//                   <Text style={styles.analysisText}>{editedData}</Text>
//                 )}
//               </View>

//               <View style={styles.buttonContainer}>
//                 {isEditing ? (
//                   <>
//                     <TouchableOpacity
//                       style={[styles.button, styles.cancelButton]}
//                       onPress={() => {
//                         setEditedData(analysisData);
//                         setIsEditing(false);
//                       }}
//                     >
//                       <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={[styles.button, styles.saveButton]}
//                       onPress={handleSave}
//                     >
//                       <Text style={styles.buttonText}>Save</Text>
//                     </TouchableOpacity>
//                   </>
//                 ) : (
//                   <>
//                     <TouchableOpacity
//                       style={[styles.button, styles.editButton]}
//                       onPress={() => setIsEditing(true)}
//                     >
//                       <Text style={styles.buttonText}>Edit</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={[styles.button, styles.proceedButton]}
//                       onPress={onProceed}
//                     >
//                       <Text style={styles.buttonText}>Proceed</Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//               </View>
//             </>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// };

// function SimpleClothPopup({ 
//   isOpen, 
//   onClose, 
//   onSubmit, 
//   isSaving 
// }: { 
//   isOpen: boolean; 
//   onClose: () => void; 
//   onSubmit: (data: { name: string; type: ClothType; image: File | FormData; }) => void; 
//   isSaving: boolean; 
// }) {
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [clothName, setClothName] = useState('');
//   const [clothType, setClothType] = useState<ClothType>('Select Type');
//   const [validationError, setValidationError] = useState('');
//   const [showImagePicker, setShowImagePicker] = useState(false);
//   const contentHeight = new Animated.Value(1);

//   useEffect(() => {
//     const keyboardWillShow = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       () => {
//         Animated.timing(contentHeight, {
//           toValue: 0.7,
//           duration: 250,
//           useNativeDriver: false,
//         }).start();
//       }
//     );

//     const keyboardWillHide = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         Animated.timing(contentHeight, {
//           toValue: 1,
//           duration: 250,
//           useNativeDriver: false,
//         }).start();
//       }
//     );

//     return () => {
//       keyboardWillShow.remove();
//       keyboardWillHide.remove();
//     };
//   }, []);

//   const ImageSourceModal = () => (
//     <Modal
//       transparent
//       visible={showImagePicker}
//       animationType="fade"
//       onRequestClose={() => setShowImagePicker(false)}
//     >
//       <View style={styles.imageSourceOverlay}>
//         <View style={styles.imageSourceContainer}>
//           <TouchableOpacity 
//             style={styles.closeButton}
//             onPress={() => setShowImagePicker(false)}
//           >
//             <Ionicons name="close" size={24} color="#714463" />
//           </TouchableOpacity>
          
//           <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
//           <Text style={styles.imageSourceSubtitle}>
//             Would you like to take a new photo or select from your gallery?
//           </Text>

//           <View style={styles.imageSourceButtons}>
//             <TouchableOpacity 
//               style={styles.sourceButton}
//               onPress={async () => {
//                 setShowImagePicker(false);
//                 try {
//                   const result = await ImagePicker.launchCameraAsync({
//                     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//                     allowsEditing: true,
//                     quality: 0.8,
//                   });

//                   if (!result.canceled) {
//                     setSelectedImage(result.assets[0].uri);
//                   }
//                 } catch (error) {
//                   Alert.alert(
//                     'Camera Error',
//                     'Unable to access camera. Please try using the gallery instead.',
//                     [{ text: 'OK' }]
//                   );
//                 }
//               }}
//             >
//               <Ionicons name="camera-outline" size={24} color="#714463" />
//               <Text style={styles.sourceButtonText}>Camera</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={styles.sourceButton}
//               onPress={async () => {
//                 setShowImagePicker(false);
//                 try {
//                   const result = await ImagePicker.launchImageLibraryAsync({
//                     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//                     allowsEditing: true,
//                     quality: 0.8,
//                   });

//                   if (!result.canceled) {
//                     setSelectedImage(result.assets[0].uri);
//                   }
//                 } catch (error) {
//                   Alert.alert(
//                     'Gallery Error',
//                     'Unable to access photo gallery. Please try again.',
//                     [{ text: 'OK' }]
//                   );
//                 }
//               }}
//             >
//               <Ionicons name="images-outline" size={24} color="#714463" />
//               <Text style={styles.sourceButtonText}>Gallery</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const pickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
//     if (permissionResult.granted === false || cameraPermission.granted === false) {
//       Alert.alert(
//         'Permission Required',
//         'To add outfits to your wardrobe, we need access to your camera and photos.',
//         [
//           { text: 'Not Now', style: 'cancel' },
//           {
//             text: 'Open Settings',
//             onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings(),
//           }
//         ]
//       );
//       return;
//     }

//     setShowImagePicker(true);
//   };

//   const handleCancel = () => {
//     setSelectedImage(null);
//     setClothName('');
//     setClothType('Select Type');
//     setValidationError('');
//     onClose();
//   };

//   const handleSubmit = async () => {
//     if (!selectedImage || !clothName.trim() || clothType === 'Select Type') {
//       const missingFields = [
//         !selectedImage && 'Image',
//         !clothName.trim() && 'Name',
//         clothType === 'Select Type' && 'Type'
//       ].filter(Boolean);

//       setValidationError(`Please fill in all fields to proceed:\n${missingFields.join(', ')}`);
//       return;
//     }

//     setValidationError('');

//     try {
//       if (Platform.OS === 'web') {
//         const response = await fetch(selectedImage);
//         const blob = await response.blob();
//         const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
//         onSubmit({
//           name: clothName.trim(),
//           type: clothType,
//           image: file
//         });
//       } else {
//         const formData = new FormData();
//         formData.append('image', {
//           uri: selectedImage,
//           type: 'image/jpeg',
//           name: 'image.jpg'
//         } as any);

//         onSubmit({
//           name: clothName.trim(),
//           type: clothType,
//           image: formData
//         });
//       }

//       handleCancel();
//     } catch (error) {
//       console.error('Error processing image:', error);
//       setValidationError('Error uploading image. Please try again.');
//     }
//   };

//   return (
//     <Modal
//       visible={isOpen}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={handleCancel}
//     >
//       <View style={styles.modalContainer}>
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.keyboardAvoidingView}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
//         >
//           <Animated.View style={[styles.modalContent, { maxHeight: contentHeight.interpolate({
//             inputRange: [0.7, 1],
//             outputRange: ['70%', '90%']
//           })}]}>
            
//             {validationError ? (
//               <Text style={styles.errorText}>{validationError}</Text>
//             ) : null}

//             <Text style={styles.title1}>Compare with</Text>

//             <ScrollView 
//               contentContainerStyle={styles.scrollContainer}
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//               bounces={false}
//             >
//               <TouchableOpacity
//                 style={styles.imageUpload}
//                 onPress={pickImage}
//               >
//                 {selectedImage ? (
//                   <Image
//                     source={{ uri: selectedImage }}
//                     style={styles.previewImage}
//                   />
//                 ) : (
//                   <Text>Tap to upload image</Text>
//                 )}
//               </TouchableOpacity>

//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter outfit name"
//                 value={clothName}
//                 onChangeText={setClothName}
//               />

//               <View style={styles.pickerWrapper}>
//                 <Text style={[styles.typeLabel, clothType !== 'Select Type' && styles.selectedTypeLabel]}>{clothType}</Text>
//                 <Picker
//                   selectedValue={clothType}
//                   onValueChange={(value) => setClothType(value as ClothType)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Top" value="Top" />
//                   <Picker.Item label="Bottom" value="Bottom" />
//                   <Picker.Item label="Footwear" value="Footwear" />
//                   <Picker.Item label="Outerwear" value="Outerwear" />
//                   <Picker.Item label="Accessories" value="Accessories" />
//                 </Picker>
//               </View>

//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity
//                   style={[styles.button, styles.cancelButton]}
//                   onPress={handleCancel}
//                 >
//                   <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                                     style={[styles.button, styles.saveButton]}
//                   onPress={handleSubmit}
//                 >
//                   <Text style={styles.buttonText}>Analyze</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </Animated.View>
//         </KeyboardAvoidingView>
//       </View>
//       <ImageSourceModal />
//     </Modal>
//   );
// }

// export default function AnalyzerSelect() {
//   const router = useRouter();
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [analysisData, setAnalysisData] = useState('');
//   const [tempStorageCount, setTempStorageCount] = useState(0);
//   const [lastAnalyzedItem, setLastAnalyzedItem] = useState<any>(null);

//   // Load the current count of temporary items on component mount
//   useEffect(() => {
//     const loadTempStorageCount = async () => {
//       try {
//         const tempItems = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
//         if (tempItems) {
//           const items = JSON.parse(tempItems);
//           setTempStorageCount(items.length);
//         }
//       } catch (error) {
//         console.error('Error loading temp storage count:', error);
//       }
//     };
    
//     loadTempStorageCount();
//   }, []);

//   // Function to save temporary item to AsyncStorage
//   const saveTempItem = async (item: any) => {
//     try {
//       // Clear existing items first
//       const existingItemsJson = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
//       if (existingItemsJson) {
//         const existingItems = JSON.parse(existingItemsJson);
//         if (existingItems.length > 0) {
//           // If there are existing items, clear them all
//           await AsyncStorage.removeItem(TEMP_STORAGE_KEY);
//           console.log('Cleared existing temporary items');
//         }
//       }
      
//       // Save the new item directly
//       const newItems = [{
//         ...item,
//         imageUrl: item.imageUri, // Add imageUrl property based on imageUri
//         temporary: true,
//         createdAt: new Date().toISOString()
//       }];
      
//       // Save to storage
//       await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(newItems));
      
//       // Update the count
//       setTempStorageCount(1);
      
//       // Save the last analyzed item for easy access
//       setLastAnalyzedItem(item);
      
//       console.log('Temporary item saved directly');
//     } catch (error) {
//       console.error('Error saving temporary item:', error);
//     }
//   };

//   // Handle proceeding after analysis
//   const handleProceedAfterAnalysis = () => {
//     setIsAnalysisOpen(false);
//     router.push({
//       pathname: '/(processing)/cloth_rank_analysis',
//       params: { source: 'analyzer' }
//     });
//   };


//   // Handle new cloth submission
//   const handleClothSubmit = async (data: {
//     name: string;
//     type: ClothType;
//     image: File | FormData;
//   }) => {
//     try {
//       // Extract image URI
//       let imageUri = '';
//       if (data.image instanceof FormData) {
//         const formDataParts = (data.image as any)._parts;
//         if (Array.isArray(formDataParts)) {
//           for (const [_, value] of formDataParts) {
//             if (value && typeof value === 'object' && 'uri' in value) {
//               imageUri = value.uri as string;
//               setSelectedImage(imageUri);
//               break;
//             }
//           }
//         }
//       } else if (typeof data.image === 'object' && 'uri' in data.image) {
//         imageUri = data.image.uri as string;
//         setSelectedImage(imageUri);
//       }

//       if (!imageUri) {
//         throw new Error('Could not extract image URI');
//       }

//       // Show analysis modal and set loading state
//       setIsAnalyzing(true);
//       setIsAnalysisOpen(true);

//       // Create a FormData for sending to the backend for analysis
//       const analyzeFormData = new FormData();
//       analyzeFormData.append('images', {
//         uri: imageUri,
//         type: 'image/jpeg',
//         name: 'upload.jpg'
//       } as any);

//       // Send the image to the backend for analysis
//       console.log('Sending image to backend for analysis...');
      
//       try {
//         const analyzeResponse = await axios.post(
//           `${BACKEND_URL}/api/analyze-clothing`,
//           analyzeFormData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data'
//             },
//             timeout: 30000 // 30 seconds timeout
//           }
//         );

//         // Extract descriptions and labels from the analysis response
//         let generatedDescription = "No description available.";
//         let generatedLabels = "";

//         if (analyzeResponse.status === 200) {
//           const analyzeData = analyzeResponse.data;
//           if (analyzeData.descriptions && analyzeData.descriptions.length > 0) {
//             generatedDescription = analyzeData.descriptions[0]; // Take first description
//           }
//           if (analyzeData.labels && analyzeData.labels.length > 0) {
//             generatedLabels = analyzeData.labels[0]; // Take first label
//           }
//         }
        
//         // Set the analysis data to display
//         setAnalysisData(generatedDescription);
        
//         // Create a temporary item object
//         const tempItem = {
//           id: `temp_${Date.now()}`,
//           name: data.name,
//           imageUrl: imageUri, // Use imageUrl instead of imageUri
//           imageUri: imageUri, // Keep imageUri for backward compatibility
//           type: data.type,
//           description: generatedDescription,
//           label: generatedLabels,
//         };

//         // Save to temporary storage
//         await saveTempItem(tempItem);
        
//         // Complete the analysis process
//         setIsAnalyzing(false);
        
//       } catch (error) {
//         console.error('Error calling backend API:', error);
        
//         // Fallback to mock data if API call fails
//         const mockDescription = `Name: ${data.name}\nType: ${data.type}\nMaterial: Cotton blend\nStyle: Casual\nSeason: All seasons`;
//         setAnalysisData(mockDescription);
        
//         // Create a temporary item with mock data
//         const tempItem = {
//           id: `temp_${Date.now()}`,
//           name: data.name,
//           imageUri: imageUri,
//           type: data.type,
//           description: mockDescription,
//           label: data.type,
//         };
        
//         // Save to temporary storage
//         await saveTempItem(tempItem);
        
//         setIsAnalyzing(false);
//       }

//     } catch (error) {
//       console.error('Error analyzing clothing:', error);
//       setAnalysisData('Error analyzing clothing. Please try again.');
//       setIsAnalyzing(false);
//       Alert.alert('Analysis Error', 'Failed to analyze clothing. Please try again.');
//     }
//   };

//   // Handle saving edited analysis data
//   const handleSaveAnalysis = async (editedData: string) => {
//     setAnalysisData(editedData);
    
//     // Update the temporary storage with the edited data
//     try {
//       const tempItems = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
//       if (tempItems) {
//         const items = JSON.parse(tempItems);
//         // Find the most recently added item (should be the last one)
//         if (items.length > 0) {
//           const lastItem = items[items.length - 1];
//           lastItem.description = editedData;
//           await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(items));
//           console.log('Updated temporary item with edited analysis');
//         }
//       }
//     } catch (error) {
//       console.error('Error updating temporary item:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       {/* Decorative elements */}
//       <View style={[styles.decorCircle, styles.decorCircle1]} />
//       <View style={[styles.decorCircle, styles.decorCircle2]} />
//       <View style={[styles.decorCircle, styles.decorCircle3]} />
//       <View style={[styles.decorCircle, styles.decorCircle4]} />
//       <View style={[styles.decorCircle, styles.decorCircle5]} />
//       <View style={[styles.decorCircle, styles.decorCircle6]} />
//       <View style={[styles.decorCircle, styles.decorCircle7]} />
      
//       {/* Back button */}
//       <TouchableOpacity 
//         style={styles.backButton}
//         onPress={() => router.push('/(tabs)/explore')}
//       >
//         <AntDesign name="arrowleft" size={24} color="#714463" />
//       </TouchableOpacity>
      
//       {/* Header with gradient background */}
//       <LinearGradient
//         colors={['#714463', '#8a5576']}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//       >
//         <Text style={styles.title}>Clothing Analyzer</Text>
//         <Text style={styles.subtitle}>
//           MatchUp your clothes
//         </Text>

//       </LinearGradient>

//       <View style={styles.optionsContainer}>
//         {/* Add New Clothing Option */}
//         <TouchableOpacity
//           style={styles.optionCard}
//           onPress={() => setIsPopupOpen(true)}
//           activeOpacity={0.9}
//         >
//           <LinearGradient
//             colors={['rgba(113, 68, 99, 0.1)', 'rgba(113, 68, 99, 0.05)']}
//             style={styles.cardGradient}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <View style={styles.iconCircle}>
//               <Ionicons name="add-circle" size={40} color="#714463" />
//             </View>
//             <View style={styles.cardContent}>
//               <Text style={styles.optionTitle}>Add New Clothing</Text>
//               <Text style={styles.optionDescription}>
//                 Upload a new item to analyze its details
//               </Text>
//               <View style={styles.arrowContainer}>
//                 <FontAwesome5 name="arrow-right" size={16} color="#714463" />
//               </View>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>

//         {/* Select from Wardrobe Option */}
//         <TouchableOpacity
//           style={styles.optionCard}
//           onPress={() => router.push('/selection_wardrobe' as any)}
//           activeOpacity={0.9}
//         >
//           <LinearGradient
//             colors={['rgba(113, 68, 99, 0.1)', 'rgba(113, 68, 99, 0.05)']}
//             style={styles.cardGradient}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <View style={styles.iconCircle}>
//               <MaterialIcons name="style" size={40} color="#714463" />
//             </View>
//             <View style={styles.cardContent}>
//               <Text style={styles.optionTitle}>Select from Wardrobe</Text>
//               <Text style={styles.optionDescription}>
//                 Choose an existing item from your collection
//               </Text>
//               <View style={styles.arrowContainer}>
//                 <FontAwesome5 name="arrow-right" size={16} color="#714463" />
//               </View>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Using our simplified ClothPopup component */}
//       <SimpleClothPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         onSubmit={handleClothSubmit}
//         isSaving={false}
//       />

//       {/* Using our enhanced ClothingAnalysisDisplay component with Proceed button */}
//       {selectedImage && (
//         <EnhancedClothingAnalysisDisplay
//           imageUri={selectedImage}
//           analysisData={analysisData}
//           isVisible={isAnalysisOpen}
//           isLoading={isAnalyzing}
//           onClose={() => setIsAnalysisOpen(false)}
//           onSave={handleSaveAnalysis}
//           onProceed={handleProceedAfterAnalysis}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f5f0',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   header: {
//     marginTop: 120, 
//     marginHorizontal: 20,
//     paddingTop: 30,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   title1: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#714463',
//     marginBottom: 3,
//     textAlign: 'center',
//     paddingBottom: 2,
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: 'rgba(255, 255, 255, 0.9)',
//     textAlign: 'center',
//     letterSpacing: 0.5,
//   },
//   optionsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     gap: 25,
//     marginTop: 20,
//   },
//   optionCard: {
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#714463',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//     backgroundColor: '#fff',
//   },
//   cardGradient: {
//     flexDirection: 'row',
//     padding: 20,
//     alignItems: 'center',
//   },
//   iconCircle: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#714463',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardContent: {
//     flex: 1,
//     marginLeft: 15,
//     position: 'relative',
//   },
//   optionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#714463',
//     marginBottom: 8,
//   },
//   optionDescription: {
//     fontSize: 14,
//     color: '#666',
//     paddingRight: 20,
//     lineHeight: 20,
//   },
//   arrowContainer: {
//     position: 'absolute',
//     right: -4,
//     top: '50%',
//     marginTop: -18,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#714463',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   // Decorative circles
//   decorCircle: {
//     position: 'absolute',
//     borderRadius: 100,
//     backgroundColor: 'rgba(113, 68, 99, 0.3)',
//   },
//   decorCircle1: {
//     width: 150,
//     height: 150,
//     top: -30,
//     right: -50,
//   },
//   decorCircle2: {
//     width: 200,
//     height: 200,
//     bottom: -80,
//     left: -70,
//   },
//   decorCircle3: {
//     width: 100,
//     height: 100,
//     bottom: 100,
//     right: -30,
//   },
//   decorCircle4: {
//     width: 120,
//     height: 120,
//     top: 260,
//     left: 10,
//     backgroundColor: 'rgba(113, 68, 99, 0.3)',
//   },
//   decorCircle5: {
//     width: 150,
//     height: 150,
//     top: 320,
//     right: -70,
//     backgroundColor: 'rgba(113, 68, 99, 0.3)',
//   },
//   decorCircle6: {
//     width: 140,
//     height: 140,
//     top: height / 2 + 70,
//     left: -70,
//     backgroundColor: 'rgba(113, 68, 99, 0.3)',
//   },
//   decorCircle7: {
//     width: 180,
//     height: 180,
//     top: height / 2,
//     backgroundColor: 'rgba(113, 68, 99, 0.3)',
//     zIndex: -1,
//   },
  
//   // Styles for SimpleClothPopup component
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     width: '90%', // Use percentage instead of fixed width
//     maxWidth: 400,
//     maxHeight: '90%',
//     alignSelf: 'center', // Center horizontally
//     marginVertical: 'auto', // Center vertically
//   },
//   scrollContainer: {
//     flexGrow: 1,
//   },
//   imageUpload: {
//     height: 200,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   previewImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 8,
//     resizeMode: 'contain',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 16,
//     height: 50,
//     justifyContent: 'center',
//     paddingLeft: 0,
//   },
//   typeLabel: {
//     fontSize: 14,
//     color: '#a2a2a2',
//     paddingLeft: 12,
//   },
//   selectedTypeLabel: {
//     color: '#000',
//   },
//   picker: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     paddingBottom: 57,
//     color: '#fff',
//     opacity: 0,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     flexWrap: 'wrap', // Allow wrapping if needed
//     gap: 10, // Add gap between buttons
//   },
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#e8ccb9',
//   },
//   saveButton: {
//     backgroundColor: '#714463',
//   },
//   editButton: {
//     backgroundColor: '#8a5576',
//   },
//   proceedButton: {
//     backgroundColor: '#4CAF50', // Green color for proceed button
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#FF0000',
//     fontSize: 14,
//     marginBottom: 15,
//     textAlign: 'center',
//     fontWeight: '500',
//     paddingHorizontal: 20,
//     lineHeight: 20,
//   },
//   imageSourceOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageSourceContainer: {
//     backgroundColor: '#f0e6e3',
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     alignItems: 'center',
//     position: 'relative',
//   },
//   closeButton: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     padding: 5,
//     zIndex: 10,
//   },
//   imageSourceTitle: {
//     color: '#714463',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   imageSourceSubtitle: {
//     color: '#714463',
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//     opacity: 0.8,
//   },
//   imageSourceButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     paddingHorizontal: 20,
//   },
//   sourceButton: {
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 10,
//     backgroundColor: 'rgba(113, 68, 99, 0.1)',
//     width: '45%',
//   },
//   sourceButtonText: {
//     color: '#714463',
//     marginTop: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   tempStorageIndicator: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginTop: 10,
//     alignSelf: 'center',
//   },
//   tempStorageText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },
  
//   // Styles for EnhancedClothingAnalysisDisplay component
//   imageContainer: {
//     width: '100%',
//     height: 250,
//     marginBottom: 20,
//     borderRadius: 8,
//     overflow: 'hidden',
//     backgroundColor: '#f0f0f0',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#714463',
//     textAlign: 'center',
//   },
//   analysisContainer: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#714463',
//   },
//   analysisText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#333',
//   },
// editInput: {
//   fontSize: 16,
//   lineHeight: 24,
//   color: '#333',
//   borderWidth: 1,
//   borderColor: '#ddd',
//   borderRadius: 8,
//   padding: 10,
//   minHeight: 150, // Use minHeight instead of fixed height
//   maxHeight: 300, // Add maxHeight
//   textAlignVertical: 'top',
//   width: '100%', // Ensure full width
// },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Modal, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform, Animated, Keyboard, Alert, Linking, ActivityIndicator, ImageStyle, ImageResizeMode } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ClothType } from '../(tabs)/explore';

const { width, height } = Dimensions.get('window');

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const TEMP_STORAGE_KEY = 'tempAnalyzedClothing';

// Custom ClothingAnalysisDisplay component with Proceed button
interface EnhancedClothingAnalysisDisplayProps {
  imageUri: string;
  analysisData: string;
  isVisible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (editedData: string) => void;
  onProceed: () => void;
  imageStyle?: ImageStyle;
  imageResizeMode?: ImageResizeMode;
}

const EnhancedClothingAnalysisDisplay: React.FC<EnhancedClothingAnalysisDisplayProps> = ({
  imageUri,
  analysisData,
  isVisible,
  isLoading,
  onClose,
  onSave,
  onProceed,
  imageStyle = {},
  imageResizeMode = "contain"
}) => {
  const [editedData, setEditedData] = useState(analysisData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedData(analysisData);
  }, [analysisData]);

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={26} color="#000" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, imageStyle]}
              resizeMode={imageResizeMode}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#714463" />
              <Text style={styles.loadingText}>Analyzing your clothing...</Text>
            </View>
          ) : (
            <>
              <View style={styles.analysisContainer}>
                <Text style={styles.sectionTitle}>Clothing Analysis</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    multiline
                    value={editedData}
                    onChangeText={setEditedData}
                  />
                ) : (
                  <Text style={styles.analysisText}>{editedData}</Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setEditedData(analysisData);
                        setIsEditing(false);
                      }}
                    >
                      <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleSave}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.proceedButton]}
                      onPress={onProceed}
                    >
                      <Text style={styles.buttonText}>Proceed</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

function SimpleClothPopup({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSaving 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: { name: string; type: ClothType; image: File | FormData; }) => void; 
  isSaving: boolean; 
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clothName, setClothName] = useState('');
  const [clothType, setClothType] = useState<ClothType>('Select Type');
  const [validationError, setValidationError] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const contentHeight = new Animated.Value(1);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(contentHeight, {
          toValue: 0.7,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(contentHeight, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const ImageSourceModal = () => (
    <Modal
      transparent
      visible={showImagePicker}
      animationType="fade"
      onRequestClose={() => setShowImagePicker(false)}
    >
      <View style={styles.imageSourceOverlay}>
        <View style={styles.imageSourceContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowImagePicker(false)}
          >
            <Ionicons name="close" size={24} color="#714463" />
          </TouchableOpacity>
          
          <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
          <Text style={styles.imageSourceSubtitle}>
            Would you like to take a new photo or select from your gallery?
          </Text>

          <View style={styles.imageSourceButtons}>
            <TouchableOpacity 
              style={styles.sourceButton}
              onPress={async () => {
                setShowImagePicker(false);
                try {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.8,
                  });

                  if (!result.canceled) {
                    setSelectedImage(result.assets[0].uri);
                  }
                } catch (err) {
                  console.error('Camera error:', err);
                  Alert.alert(
                    'Camera Error',
                    'Unable to access camera. Please try using the gallery instead.',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <Ionicons name="camera-outline" size={24} color="#714463" />
              <Text style={styles.sourceButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sourceButton}
              onPress={async () => {
                setShowImagePicker(false);
                try {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.8,
                  });

                  if (!result.canceled) {
                    setSelectedImage(result.assets[0].uri);
                  }
                } catch (err) {
                  console.error('Gallery error:', err);
                  Alert.alert(
                    'Gallery Error',
                    'Unable to access photo gallery. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <Ionicons name="images-outline" size={24} color="#714463" />
              <Text style={styles.sourceButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false || cameraPermission.granted === false) {
      Alert.alert(
        'Permission Required',
        'To add outfits to your wardrobe, we need access to your camera and photos.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings(),
          }
        ]
      );
      return;
    }

    setShowImagePicker(true);
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setClothName('');
    setClothType('Select Type');
    setValidationError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedImage || !clothName.trim() || clothType === 'Select Type') {
      const missingFields = [
        !selectedImage && 'Image',
        !clothName.trim() && 'Name',
        clothType === 'Select Type' && 'Type'
      ].filter(Boolean);

      setValidationError(`Please fill in all fields to proceed:\n${missingFields.join(', ')}`);
      return;
    }

    setValidationError('');

    try {
      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        onSubmit({
          name: clothName.trim(),
          type: clothType,
          image: file
        });
      } else {
        const formData = new FormData();
        formData.append('image', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'image.jpg'
        } as any);

        onSubmit({
          name: clothName.trim(),
          type: clothType,
          image: formData
        });
      }

      handleCancel();
    } catch (err) {
      console.error('Error processing image:', err);
      setValidationError('Error uploading image. Please try again.');
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <Animated.View style={[styles.modalContent, { maxHeight: contentHeight.interpolate({
            inputRange: [0.7, 1],
            outputRange: ['70%', '90%']
          })}]}>
            
            {validationError ? (
              <Text style={styles.errorText}>{validationError}</Text>
            ) : null}

            <Text style={styles.title1}>Compare with</Text>

            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={pickImage}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#999" />
                    <Text>Tap to upload image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Enter outfit name"
                value={clothName}
                onChangeText={setClothName}
              />

              <View style={styles.pickerWrapper}>
                <Text style={[styles.typeLabel, clothType !== 'Select Type' && styles.selectedTypeLabel]}>{clothType}</Text>
                <Picker
                  selectedValue={clothType}
                  onValueChange={(value) => setClothType(value as ClothType)}
                  style={styles.picker}
                >
                  <Picker.Item label="Top" value="Top" />
                  <Picker.Item label="Bottom" value="Bottom" />
                  <Picker.Item label="Footwear" value="Footwear" />
                  <Picker.Item label="Outerwear" value="Outerwear" />
                  <Picker.Item label="Accessories" value="Accessories" />
                </Picker>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
      <ImageSourceModal />
    </Modal>
  );
}

export default function AnalyzerSelect() {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState('');
  const [tempStorageCount, setTempStorageCount] = useState(0);
  const [lastAnalyzedItem, setLastAnalyzedItem] = useState<any>(null);

  // Load the current count of temporary items on component mount
  useEffect(() => {
    const loadTempStorageCount = async () => {
      try {
        const tempItems = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
        if (tempItems) {
          const items = JSON.parse(tempItems);
          setTempStorageCount(items.length);
        }
      } catch (err) {
        console.error('Error loading temp storage count:', err);
      }
    };
    
    loadTempStorageCount();
  }, []);

  // Function to save temporary item to AsyncStorage
  const saveTempItem = async (item: any) => {
    try {
      // Clear existing items first
      const existingItemsJson = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
      if (existingItemsJson) {
        const existingItems = JSON.parse(existingItemsJson);
        if (existingItems.length > 0) {
          // If there are existing items, clear them all
          await AsyncStorage.removeItem(TEMP_STORAGE_KEY);
          console.log('Cleared existing temporary items');
        }
      }
      
      // Save the new item directly
      const newItems = [{
        ...item,
        imageUrl: item.imageUri, // Add imageUrl property based on imageUri
        temporary: true,
        createdAt: new Date().toISOString()
      }];
      
      // Save to storage
      await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(newItems));
      
      // Update the count
      setTempStorageCount(1);
      
      // Save the last analyzed item for easy access
      setLastAnalyzedItem(item);
      
      console.log('Temporary item saved directly');
    } catch (err) {
      console.error('Error saving temporary item:', err);
    }
  };

  // Handle proceeding after analysis
  const handleProceedAfterAnalysis = () => {
    setIsAnalysisOpen(false);
    router.push({
      pathname: '/(processing)/cloth_rank_analysis',
      params: { source: 'analyzer' }
    });
  };

  // Handle new cloth submission
  const handleClothSubmit = async (data: {
    name: string;
    type: ClothType;
    image: File | FormData;
  }) => {
    try {
      // Extract image URI
      let imageUri = '';
      if (data.image instanceof FormData) {
        const formDataParts = (data.image as any)._parts;
        if (Array.isArray(formDataParts)) {
          for (const [_, value] of formDataParts) {
            if (value && typeof value === 'object' && 'uri' in value) {
              imageUri = value.uri as string;
              setSelectedImage(imageUri);
              break;
            }
          }
        }
      } else if (typeof data.image === 'object' && 'uri' in data.image) {
        imageUri = data.image.uri as string;
        setSelectedImage(imageUri);
      }

      if (!imageUri) {
        throw new Error('Could not extract image URI');
      }

      // Show analysis modal and set loading state
      setIsAnalyzing(true);
      setIsAnalysisOpen(true);

      // Create a FormData for sending to the backend for analysis
      const analyzeFormData = new FormData();
      analyzeFormData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg'
      } as any);

      // Send the image to the backend for analysis
      console.log('Sending image to backend for analysis...');
      
      try {
        const analyzeResponse = await axios.post(
          `${BACKEND_URL}/api/analyze-clothing`,
          analyzeFormData,
          {
            headers: {
              Accept: 'application/json'
            },
            timeout: 90000 // 90 seconds timeout
          }
        );

        // Extract descriptions and labels from the analysis response
        let generatedDescription = "No description available.";
        let generatedLabels = "";

        if (analyzeResponse.status === 200 && analyzeResponse.data) {
          const analyzeData = analyzeResponse.data;
          
          // Validate that we received actual analysis data
          if (!analyzeData || (typeof analyzeData === 'object' && Object.keys(analyzeData).length === 0)) {
            throw new Error('Backend returned empty analysis');
          }
          
          if (analyzeData.descriptions && Array.isArray(analyzeData.descriptions) && analyzeData.descriptions.length > 0) {
            generatedDescription = analyzeData.descriptions[0]; // Take first description
          } else {
            throw new Error('No valid descriptions received from backend');
          }
          
          if (analyzeData.labels && Array.isArray(analyzeData.labels) && analyzeData.labels.length > 0) {
            generatedLabels = analyzeData.labels[0]; // Take first label
          }
        } else {
          throw new Error(`Backend returned status: ${analyzeResponse.status}`);
        }
        
        // Set the analysis data to display
        setAnalysisData(generatedDescription);
        
        // Create a temporary item object
        const tempItem = {
          id: `temp_${Date.now()}`,
          name: data.name,
          imageUrl: imageUri, // Use imageUrl instead of imageUri
          imageUri: imageUri, // Keep imageUri for backward compatibility
          type: data.type,
          description: generatedDescription,
          label: generatedLabels,
        };

        // Save to temporary storage
        await saveTempItem(tempItem);
        
        // Complete the analysis process
        setIsAnalyzing(false);
        
      } catch (err) {
        console.error('Error calling backend API:', err);
        
        // Enhanced error handling - no fallback to mock data
        const error = err as any;
        let errorMessage = 'Failed to analyze clothing. ';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage += 'Request timed out. Please check your connection and try again.';
        } else if (error.response?.status === 500) {
          errorMessage += 'Server error occurred. Please try again later.';
        } else if (error.response?.status === 404) {
          errorMessage += 'Analysis service not found. Please contact support.';
        } else if (error.message && error.message.includes('Backend')) {
          errorMessage += 'Unable to analyze this image. Please try with a different image.';
        } else {
          errorMessage += 'Please check your connection and try again.';
        }
        
        setAnalysisData(errorMessage);
        setIsAnalyzing(false);
        
        // Don't save anything to temp storage on error
        Alert.alert('Analysis Error', errorMessage);
      }

    } catch (err) {
      console.error('Error analyzing clothing:', err);
      const errorMessage = 'Error processing image. Please try again.';
      setAnalysisData(errorMessage);
      setIsAnalyzing(false);
      Alert.alert('Processing Error', errorMessage);
    }
  };

  // Handle saving edited analysis data
  const handleSaveAnalysis = async (editedData: string) => {
    setAnalysisData(editedData);
    
    // Update the temporary storage with the edited data
    try {
      const tempItems = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
      if (tempItems) {
        const items = JSON.parse(tempItems);
        // Find the most recently added item (should be the last one)
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          lastItem.description = editedData;
          await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(items));
          console.log('Updated temporary item with edited analysis');
        }
      }
    } catch (err) {
      console.error('Error updating temporary item:', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Decorative elements */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />
      <View style={[styles.decorCircle, styles.decorCircle4]} />
      <View style={[styles.decorCircle, styles.decorCircle5]} />
      <View style={[styles.decorCircle, styles.decorCircle6]} />
      <View style={[styles.decorCircle, styles.decorCircle7]} />
      
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <AntDesign name="arrowleft" size={24} color="#714463" />
      </TouchableOpacity>
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#714463', '#8a5576']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.title}>Clothing Analyzer</Text>
        <Text style={styles.subtitle}>
          MatchUp your clothes
        </Text>

      </LinearGradient>

      <View style={styles.optionsContainer}>
        {/* Add New Clothing Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setIsPopupOpen(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(113, 68, 99, 0.1)', 'rgba(113, 68, 99, 0.05)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="add-circle" size={40} color="#714463" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.optionTitle}>Add New Clothing</Text>
              <Text style={styles.optionDescription}>
                Upload a new item to analyze its details
              </Text>
              <View style={styles.arrowContainer}>
                <FontAwesome5 name="arrow-right" size={16} color="#714463" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Select from Wardrobe Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/selection_wardrobe' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(113, 68, 99, 0.1)', 'rgba(113, 68, 99, 0.05)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name="style" size={40} color="#714463" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.optionTitle}>Select from Wardrobe</Text>
              <Text style={styles.optionDescription}>
                Choose an existing item from your collection
              </Text>
              <View style={styles.arrowContainer}>
                <FontAwesome5 name="arrow-right" size={16} color="#714463" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Using our simplified ClothPopup component */}
      <SimpleClothPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleClothSubmit}
        isSaving={false}
      />

      {/* Using our enhanced ClothingAnalysisDisplay component with Proceed button */}
      {selectedImage && (
        <EnhancedClothingAnalysisDisplay
          imageUri={selectedImage}
          analysisData={analysisData}
          isVisible={isAnalysisOpen}
          isLoading={isAnalyzing}
          onClose={() => setIsAnalysisOpen(false)}
          onSave={handleSaveAnalysis}
          onProceed={handleProceedAfterAnalysis}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f5f0',
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    marginTop: 120, 
    marginHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#714463',
    marginBottom: 3,
    textAlign: 'center',
    paddingBottom: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 25,
    marginTop: 20,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#714463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#714463',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    position: 'relative',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#714463',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    paddingRight: 20,
    lineHeight: 20,
  },
  arrowContainer: {
    position: 'absolute',
    right: -4,
    top: '50%',
    marginTop: -18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#714463',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  // Decorative circles
  decorCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(113, 68, 99, 0.3)',
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -30,
    right: -50,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    bottom: -80,
    left: -70,
  },
  decorCircle3: {
    width: 100,
    height: 100,
    bottom: 100,
    right: -30,
  },
  decorCircle4: {
    width: 120,
    height: 120,
    top: 260,
    left: 10,
    backgroundColor: 'rgba(113, 68, 99, 0.3)',
  },
  decorCircle5: {
    width: 150,
    height: 150,
    top: 320,
    right: -70,
    backgroundColor: 'rgba(113, 68, 99, 0.3)',
  },
  decorCircle6: {
    width: 140,
    height: 140,
    top: height / 2 + 70,
    left: -70,
    backgroundColor: 'rgba(113, 68, 99, 0.3)',
  },
  decorCircle7: {
    width: 180,
    height: 180,
    top: height / 2,
    backgroundColor: 'rgba(113, 68, 99, 0.3)',
    zIndex: -1,
  },
  
  // Styles for SimpleClothPopup component
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%', // Use percentage instead of fixed width
    maxWidth: 400,
    maxHeight: '90%',
    alignSelf: 'center', // Center horizontally
    marginVertical: 'auto', // Center vertically
  },
  scrollContainer: {
    flexGrow: 1,
  },
  imageUpload: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 0,
  },
  typeLabel: {
    fontSize: 14,
    color: '#a2a2a2',
    paddingLeft: 12,
  },
  selectedTypeLabel: {
    color: '#000',
  },
  picker: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    paddingBottom: 57,
    color: '#fff',
    opacity: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap', // Allow wrapping if needed
    gap: 10, // Add gap between buttons
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e8ccb9',
  },
  saveButton: {
    backgroundColor: '#714463',
  },
  editButton: {
    backgroundColor: '#8a5576',
  },
  proceedButton: {
    backgroundColor: '#4CAF50', // Green color for proceed button
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  imageSourceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSourceContainer: {
    backgroundColor: '#f0e6e3',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
    zIndex: 10,
  },
  imageSourceTitle: {
    color: '#714463',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  imageSourceSubtitle: {
    color: '#714463',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  imageSourceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  sourceButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(113, 68, 99, 0.1)',
    width: '45%',
  },
  sourceButtonText: {
    color: '#714463',
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  tempStorageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    alignSelf: 'center',
  },
  tempStorageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Styles for EnhancedClothingAnalysisDisplay component
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#714463',
    textAlign: 'center',
  },
  analysisContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#714463',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  editInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 150, // Use minHeight instead of fixed height
    maxHeight: 300, // Add maxHeight
    textAlignVertical: 'top',
    width: '100%', // Ensure full width
  },
});

