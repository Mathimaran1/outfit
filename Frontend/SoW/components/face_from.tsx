// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   ScrollView,
//   Alert,
//   Dimensions,
//   Platform,
//   Modal,
//   BackHandler,
//   SafeAreaView
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// import { getAuth } from 'firebase/auth';
// import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
// import { Ionicons, AntDesign } from '@expo/vector-icons';
// import axios from 'axios';
// import LoadingAnimation from '../components/loading_ani';

// const { width, height } = Dimensions.get('window');

// const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
// interface AppearanceData {
//   age: number;
//   height: number;
//   weight: number;
//   fatPercentage: number;
//   bodyType: string;
//   gender: string;
//   faceAnalysis: string | null;
//   face: string | null;
//   updatedAt: Date;
//   createdAt?: Date; // Make createdAt optional
// }

// // Define prop types
// interface AppearanceFormProps {
//   onComplete: () => void;
//   visible: boolean; // Add visible prop to control when the form is shown
// }

// export default function AppearanceForm({ onComplete, visible }: AppearanceFormProps) {
//   // Form data states
//   const [image, setImage] = useState<string | null>(null);
//   const [age, setAge] = useState('');
//   const [height, setHeight] = useState('');
//   const [fatPercentage, setFatPercentage] = useState(0);
//   const [bodyType, setBodyType] = useState('');
//   const [weight, setWeight] = useState('');
//   const [gender, setGender] = useState('');
//   const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  
//   // UI states
//   const [loading, setLoading] = useState(false);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [faceAnalysisResult, setFaceAnalysisResult] = useState<string | null>(null);
//   const [analysisError, setAnalysisError] = useState<string | null>(null);
//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({}); // Will only be populated on submit
//   const [showImagePicker, setShowImagePicker] = useState(false);
  
//   // Step tracking
//   const [currentStep, setCurrentStep] = useState(1); // 1: Image, 2: Analysis, 3: Review, 4: Details
  
//   // Track if we're updating existing data
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [existingData, setExistingData] = useState<any>(null);

//   const auth = getAuth();
//   const db = getFirestore();

//   // Check for existing data when component becomes visible
//   useEffect(() => {
//     if (visible) {
//       checkForExistingData();
//     }
//   }, [visible]);

//   // Function to check if user already has appearance data
//   const checkForExistingData = async () => {
//     try {
//       const currentUser = auth.currentUser;
//       if (!currentUser) return;
      
//       const userId = currentUser.uid;
//       const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
//       const appearanceDoc = await getDoc(appearanceRef);
      
//       if (appearanceDoc.exists()) {
//         const data = appearanceDoc.data();
//         setExistingData(data);
//         setIsUpdating(true);
        
//         // Pre-fill form with existing data
//         setAge(data.age?.toString() || '');
//         setHeight(data.height?.toString() || '');
//         setWeight(data.weight?.toString() || '');
//         setFatPercentage(data.fatPercentage || 0);
//         setBodyType(data.bodyType || '');
//         setGender(data.gender || '');
//         setFaceAnalysisResult(data.faceAnalysis || null);
        
//         // If we have face analysis, we can skip to the details step
//         if (data.faceAnalysis) {
//           setCurrentStep(1);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking for existing data:', error);
//     }
//   };

//   // Reset form when visibility changes
//   useEffect(() => {
//     if (!visible) {
//       // Reset form when hidden
//       setImage(null);
//       setAge('');
//       setHeight('');
//       setFatPercentage(0);
//       setBodyType('');
//       setWeight('');
//       setGender('');
//       setFaceAnalysisResult(null);
//       setValidationErrors({});
//       setCurrentStep(1);
//       setShowImagePicker(false);
//       setIsUpdating(false);
//       setExistingData(null);
//     }
//   }, [visible]);

//   // Prevent back button from closing the form until completed
//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       if (visible) {
//         // Return true to prevent default behavior (app exit)
//         return true;
//       }
//       return false;
//     });

//     return () => backHandler.remove();
//   }, [visible]);

//   // Request camera permissions
//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestCameraPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert('Permission needed', 'Camera permission is required to take photos');
//         }
//       }
//     })();
//   }, []);

//   // Image picking functions
//   const pickImage = async () => {
//     try {
//       setShowImagePicker(false);
      
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });

//       if (!result.canceled) {
//         setImage(result.assets[0].uri);
//         setCurrentStep(2);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };

//   const takePhoto = async () => {
//     try {
//       setShowImagePicker(false);
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });

//       if (!result.canceled) {
//         setImage(result.assets[0].uri);
//         setCurrentStep(2);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };

//   const analyzeFace = async () => {
//     if (!image) {
//       setAnalysisError('Please take or select a photo first');
//       return;
//     }

//     setAnalyzing(true);
//     setAnalysisError(null);
    
//     try {
//       // Create FormData to send the image
//       const formData = new FormData();
      
//       // Get the file name from the URI
//       const uriParts = image.split('.');
//       const fileType = uriParts[uriParts.length - 1];
      
//       // Append the image to FormData with the correct type
//       formData.append('image', {
//         uri: image,
//         name: `photo.${fileType}`,
//         type: `image/${fileType}`
//       } as any);

//       // Send the image to the backend
//       const apiResponse = await axios.post(`${BACKEND_URL}/api/analyze-face`, formData, {
//         timeout: 30000,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       // Process the response
//       if (apiResponse.status === 200) {
//         setFaceAnalysisResult(apiResponse.data);
//         setCurrentStep(3);
//       } else {
//         throw new Error('Failed to analyze face');
//       }
//     } catch (error) {
//       console.error('Error analyzing face:', error);
//       setAnalysisError('Analysis Failed. Please Try Again');
//     } finally {
//       setAnalyzing(false);
//     }
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
//     let isValid = true;

//     if (!age) {
//         errors.age = 'Please enter your age';
//         isValid = false;
//     }
//     if (!height) {
//         errors.height = 'Please enter your height in cm';
//         isValid = false;
//     }
//     if (!weight) {
//         errors.weight = 'Please enter your weight in kg';
//         isValid = false;
//     }
//     if (!bodyType || bodyType === 'Select body type') {
//         errors.bodyType = 'Please select your body type';
//         isValid = false;
//     }
//     if (!gender || gender === 'Select gender') {
//         errors.gender = 'Please select your gender';
//         isValid = false;
//     }

//     setValidationErrors(errors);
//     return isValid;
//   };

//   const saveData = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const currentUser = auth.currentUser;
//       if (!currentUser) {
//         throw new Error('User not authenticated');
//       }
      
//       const userId = currentUser.uid;
      
//       // Data to save/update with proper typing
//       const appearanceData: AppearanceData = {
//         age: parseInt(age),
//         height: parseInt(height),
//         weight: parseInt(weight),
//         fatPercentage,
//         bodyType,
//         gender,
//         faceAnalysis: faceAnalysisResult,
//         face: faceAnalysisResult,
//         updatedAt: new Date(),
//       };
      
//       // If this is a new record, add createdAt
//       if (!isUpdating) {
//         appearanceData.createdAt = new Date();
//       }
    
//       await setDoc(doc(db, 'users', userId, 'appearance', 'profile'), 
//         appearanceData, 
//         { merge: true }
//       );
      
//       // Call the onComplete callback to inform parent component
//       onComplete();
//     } catch (error) {
//       console.error('Error saving data:', error);
//       Alert.alert('Error', 'Failed to save your profile data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!visible) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <Modal visible={visible} transparent={false} animationType="fade">
//         <View style={styles.fullScreenLoadingContainer}>
//           <LoadingAnimation />
//           <Text style={styles.loadingText}>
//             {isUpdating ? 'Updating your profile...' : 'Saving your profile...'}
//           </Text>
//         </View>
//       </Modal>
//     );
//   }

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={false}
//       onRequestClose={() => {
//         return true;
//       }}
//     >
//       <SafeAreaView style={styles.container}>
//         {/* Image Source Modal */}
//         {showImagePicker && (
//           <View style={styles.imageSourceOverlay}>
//             <View style={styles.imageSourceContainer}>
//               <View style={styles.imageSourceHeader}>
//                 <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setShowImagePicker(false)}
//                 >
//                   <AntDesign name="close" size={24} color="#714463" />
//                 </TouchableOpacity>
//               </View>
              
//               <Text style={styles.imageSourceSubtitle}>
//                 Please take or select a photo of your face to continue
//               </Text>

//               <View style={styles.imageSourceButtons}>
//                 <TouchableOpacity 
//                   style={styles.sourceButton}
//                   onPress={takePhoto}
//                 >
//                   <Ionicons name="camera-outline" size={24} color="#714463" />
//                   <Text style={styles.sourceButtonText}>Camera</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   style={styles.sourceButton}
//                   onPress={pickImage}
//                 >
//                   <Ionicons name="images-outline" size={24} color="#714463" />
//                   <Text style={styles.sourceButtonText}>Gallery</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
        
//         {/* Step 1: Image Selection */}
//         {currentStep === 1 && (
//           <View style={styles.stepContainer}>
//             <Text style={styles.stepTitle}>
//               {isUpdating ? 'Update Your Face Photo' : 'Step 1: Take a Photo'}
//             </Text>
//             <Text style={styles.stepDescription}>
//               Please take or select a clear photo of your face
//             </Text>
            
//             <TouchableOpacity 
//               style={styles.selectImageButton}
//               onPress={() => setShowImagePicker(true)}
//             >
//               <Ionicons name="camera" size={40} color="#714463" />
//               <Text style={styles.selectImageText}>Select Image</Text>
//             </TouchableOpacity>
            
//             {isUpdating && (
//               <TouchableOpacity 
//                 style={styles.skipButton}
//                 onPress={() => setCurrentStep(4)}
//               >
//                 <Text style={styles.skipButtonText}>Skip to Details</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
        
//         {/* Step 2: Face Analysis */}
//         {currentStep === 2 && (
//           <View style={styles.stepContainer}>
//             <Text style={styles.stepTitle}>Step 2: Analyze Face</Text>
//             <Text style={styles.stepDescription}>
//               Lets analyze your facial features to provide better recommendations
//             </Text>
            
//             <View style={styles.imagePreviewContainer}>
//               {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
//             </View>
            
//             <TouchableOpacity 
//               style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
//               onPress={analyzeFace}
//               disabled={analyzing}
//             >
//               {analyzing ? (
//                 <Text style={styles.analyzeButtonText}>Analyzing...</Text>
//               ) : (
//                 <>
//                   <Ionicons name="scan" size={24} color="#fff" />
//                   <Text style={styles.analyzeButtonText}>Analyze Face</Text>
//                 </>
//               )}
//             </TouchableOpacity>
            
//             {/* In Step 2 section, after the Change Photo button */}
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => setCurrentStep(1)}
//             >
//               <Text style={styles.backButtonText}>Change Photo</Text>
//             </TouchableOpacity>
            
//             {analysisError && (
//               <Text style={styles.errorMessageText}>Please try again</Text>
//             )}
//           </View>
//         )}
        
//         {/* Step 3: Review Analysis */}
//       {currentStep === 3 && (
//         <View style={styles.stepContainer}>
//           <Text style={styles.stepTitle}>Step 3: Review Analysis</Text>
//           <Text style={styles.stepDescription}>
//             Review the analysis of your facial features
//           </Text>
          
//           <View style={styles.imagePreviewContainer}>
//             {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
//           </View>
          
//           <View style={styles.analysisResultContainer}>
//             <Text style={styles.analysisTitle}>Face Analysis Results:</Text>
//             <Text style={styles.analysisText}>{faceAnalysisResult}</Text>
//           </View>
          
//           <View style={styles.reviewButtonsContainer}>
//             <TouchableOpacity 
//               style={styles.reanalyzeButton}
//               onPress={() => setCurrentStep(2)}
//             >
//               <AntDesign name="reload1" size={20} color="#714463" />
//               <Text style={styles.reanalyzeButtonText}>Re-analyze</Text>
//             </TouchableOpacity>
            
//             {/* Conditionally render Continue button based on face analysis result */}
//             {faceAnalysisResult !== "There is no face detected or the image isn't clear enough for analysing. Please re-try for better working" && (
//               <TouchableOpacity 
//                 style={styles.proceedButton}
//                 onPress={() => setCurrentStep(4)}
//               >
//                 <AntDesign name="arrowright" size={20} color="#fff" />
//                 <Text style={styles.proceedButtonText}>Continue</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}
        
//         {/* Step 4: Additional Details */}
//         {currentStep === 4 && (
//           <ScrollView style={styles.formScrollContainer}>
//             <View style={{marginTop: 20}}>
//               <Text style={styles.stepTitle}>
//                 {isUpdating ? 'Update Your Details' : 'Step 4: Additional Details'}
//               </Text>
//               <Text style={styles.stepDescription}>
//                 Please provide some additional information about yourself
//               </Text>
//             </View>
            
//             <View style={styles.formSection}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Age *</Text>
//                 <TextInput
//                   style={[styles.input, validationErrors.age ? styles.inputError : null]}
//                   value={age}
//                   onChangeText={setAge}
//                   placeholder="Enter your age"
//                   keyboardType="number-pad"
//                   maxLength={3}
//                 />
//                 {validationErrors.age && <Text style={styles.errorText}>{validationErrors.age}</Text>}
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Height (cm) *</Text>
//                 <TextInput
//                   style={[styles.input, validationErrors.height ? styles.inputError : null]}
//                   value={height}
//                   onChangeText={setHeight}
//                   placeholder="Enter your height in cm"
//                   keyboardType="number-pad"
//                   maxLength={3}
//                 />
//                 {validationErrors.height && <Text style={styles.errorText}>{validationErrors.height}</Text>}
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Weight (kg) *</Text>
//                 <TextInput
//                   style={[styles.input, validationErrors.weight ? styles.inputError : null]}
//                   value={weight}
//                   onChangeText={setWeight}
//                   placeholder="Enter your weight in kg"
//                                     keyboardType="number-pad"
//                   maxLength={3}
//                 />
//                 {validationErrors.weight && <Text style={styles.errorText}>{validationErrors.weight}</Text>}
//               </View>

//               <View style={[styles.inputGroup, styles.halfInput]}>
//                 <Text style={styles.label}>Fat Percentage *<Text style={styles.requiredStar}></Text></Text>
//                 <View style={styles.inputWithUnit}>
//                   <TextInput
//                     style={styles.inputUnit}
//                     value={fatPercentage.toString()}
//                     onChangeText={(text) => {
//                       const value = Number(text);
//                       if (value <= 50) {
//                         setFatPercentage(value);
//                       }
//                     }}
//                     keyboardType="number-pad"
//                     maxLength={2}
//                   />
//                   <Text style={styles.unitText}>%</Text>
//                 </View>
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Body Type *</Text>
//                 <View style={[styles.pickerContainer, validationErrors.bodyType ? styles.inputError : null]}>
//                   <Picker
//                     selectedValue={bodyType}
//                     onValueChange={setBodyType}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="Select body type" value="" />
//                     <Picker.Item label="Ectomorph (Slim)" value="ectomorph" />
//                     <Picker.Item label="Mesomorph (Athletic)" value="mesomorph" />
//                     <Picker.Item label="Endomorph (Rounded)" value="endomorph" />
//                   </Picker>
//                 </View>
//                 {validationErrors.bodyType && <Text style={styles.errorText}>{validationErrors.bodyType}</Text>}
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Gender *</Text>
//                 <View style={[styles.pickerContainer, validationErrors.gender ? styles.inputError : null]}>
//                   <Picker
//                     selectedValue={gender}
//                     onValueChange={setGender}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="Select gender" value="" />
//                     <Picker.Item label="Male" value="male" />
//                     <Picker.Item label="Female" value="female" />
//                     <Picker.Item label="Non-binary" value="non-binary" />
//                     <Picker.Item label="Prefer not to say" value="not-specified" />
//                   </Picker>
//                 </View>
//                 {validationErrors.gender && <Text style={styles.errorText}>{validationErrors.gender}</Text>}
//               </View>

//               <View style={styles.finalButtonsContainer}>
//                 {currentStep > 1 && (
//                   <TouchableOpacity 
//                     style={styles.backToAnalysisButton}
//                     onPress={() => setCurrentStep(isUpdating && faceAnalysisResult ? 1 : 3)}
//                   >
//                     <Text style={styles.backToAnalysisText}>Back</Text>
//                   </TouchableOpacity>
//                 )}
                
//                 <TouchableOpacity 
//                   style={[styles.submitButton, {backgroundColor: '#714463'}]}
//                   onPress={saveData}
//                 >
//                   <View style={styles.gradient}>
//                     <Text style={styles.submitButtonText}>
//                       {isUpdating ? 'Update Profile' : 'Save Profile'}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         )}
        
//         {/* Progress indicator */}
//         <View style={styles.progressContainer}>
//           {[1, 2, 3, 4].map(step => (
//             <View 
//               key={step}
//               style={[
//                 styles.progressDot,
//                 currentStep === step ? styles.progressDotActive : null
//               ]}
//             />
//           ))}
//         </View>
//         {/* Full-screen analyzing overlay */}
//         {analyzing && (
//         <View style={styles.loadingOverlay}>
//             <LoadingAnimation />
//         </View>
//         )}
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4e9de',
//   },
//   fullScreenLoadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f4e9de',
//   },
//   halfInput: {
//     width: '48%',
//   },
//   requiredStar: {
//     color: '#ff3b30',
//     fontWeight: 'bold',
//   },
//   errorMessageText: {
//     color: '#ff0000',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   inputWithUnit: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   inputUnit: {
//     flex: 1,
//     padding: 12,
//     fontSize: 16,
//     borderTopRightRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   unitText: {
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: '#666',
//     backgroundColor: '#f5f5f5',
//     height: '100%',
//     textAlignVertical: 'center',
//     borderLeftWidth: 1,
//     borderLeftColor: '#ddd',
//     paddingVertical: 12,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 20,
//     fontSize: 18,
//     color: '#714463',
//     textAlign: 'center',
//   },
//   stepContainer: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   stepTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#401730',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   stepDescription: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   selectImageButton: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: '#e8ccb9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: '#714463',
//   },
//   selectImageText: {
//     marginTop: 10,
//     color: '#714463',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   imagePreviewContainer: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     overflow: 'hidden',
//     borderWidth: 3,
//     borderColor: '#714463',
//     marginBottom: 20,
//   },
//   imagePreview: {
//     width: '100%',
//     height: '100%',
//   },
//   analyzeButton: {
//     flexDirection: 'row',
//     backgroundColor: '#714463',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 15,
//   },
//   analyzeButtonDisabled: {
//     backgroundColor: '#a58e99',
//   },
//   analyzeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   backButton: {
//     padding: 10,
//   },
//   backButtonText: {
//     color: '#714463',
//     fontSize: 16,
//   },
//   analysisResultContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 20,
//     width: '100%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   analysisTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#401730',
//     marginBottom: 10,
//   },
//   analysisText: {
//     fontSize: 16,
//     color: '#333',
//     lineHeight: 24,
//   },
//   reviewButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   reanalyzeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#e8ccb9',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     flex: 1,
//     marginRight: 10,
//   },
//   reanalyzeButtonText: {
//     color: '#714463',
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   proceedButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#714463',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     flex: 1,
//     marginLeft: 10,
//   },
//   proceedButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   formScrollContainer: {
//     flex: 1,
//   },
//   formSection: {
//     padding: 20,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#401730',
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   inputError: {
//     borderColor: '#ff3b30',
//     borderWidth: 1,
//   },
//   errorText: {
//     color: '#ff3b30',
//     fontSize: 14,
//     marginTop: 5,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 10,
//   },
//   pickerContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
//   finalButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   backToAnalysisButton: {
//     backgroundColor: '#e8ccb9',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     marginRight: 10,
//   },
//   backToAnalysisText: {
//     color: '#714463',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   submitButton: {
//     borderRadius: 25,
//     overflow: 'hidden',
//     flex: 2,
//     marginLeft: 10,
//   },
//   gradient: {
//     paddingVertical: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     padding: 10,
//   },
//   progressDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#e8ccb9',
//     marginHorizontal: 5,
//   },
//   progressDotActive: {
//     backgroundColor: '#714463',
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   imageSourceOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   imageSourceContainer: {
//     backgroundColor: '#f0e6e3',
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     alignItems: 'center',
//   },
//   imageSourceHeader: {
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     marginBottom: 10,
//   },
//   closeButton: {
//     position: 'absolute',
//     right: -14,
//     top: -10,
//   },
//   imageSourceTitle: {
//     color: '#714463',
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
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
//   skipButton: {
//     marginTop: 20,
//     padding: 10,
//   },
//   skipButtonText: {
//     color: '#714463',
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
// });


// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Image,
// //   TextInput,
// //   ScrollView,
// //   Alert,
// //   Dimensions,
// //   Platform,
// //   BackHandler,
// //   SafeAreaView
// // } from 'react-native';
// // import { Picker } from '@react-native-picker/picker';
// // import * as ImagePicker from 'expo-image-picker';
// // import { getAuth } from 'firebase/auth';
// // import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
// // import { Ionicons, AntDesign } from '@expo/vector-icons';
// // import axios from 'axios';
// // import LoadingAnimation from './loading_ani';
// // import { router, useRootNavigationState } from 'expo-router';
// // import { Modal } from 'react-native';

// // const { width, height } = Dimensions.get('window');

// // // Define the backend URL - replace with your actual backend URL
// // const BACKEND_URL = "http://10.11.14.230:5000";

// // // Define interface for appearance data
// // interface AppearanceData {
// //   age: number;
// //   height: number;
// //   weight: number;
// //   fatPercentage: number;
// //   bodyType: string;
// //   gender: string;
// //   faceAnalysis: string | null;
// //   face: string | null;
// //   updatedAt: Date;
// //   createdAt?: Date; // Make createdAt optional
// // }

// // interface AppearanceFormProps {
// //   onComplete?: () => void;
// //   visible?: boolean;
// // }

// // export default function AppearanceForm({ onComplete, visible = true }: AppearanceFormProps) {
// //   // Form data states
// //   const [image, setImage] = useState<string | null>(null);
// //   const [age, setAge] = useState('');
// //   const [height, setHeight] = useState('');
// //   const [fatPercentage, setFatPercentage] = useState(0);
// //   const [bodyType, setBodyType] = useState('');
// //   const [weight, setWeight] = useState('');
// //   const [gender, setGender] = useState('');
  
// //   // UI states
// //   const [loading, setLoading] = useState(false);
// //   const [analyzing, setAnalyzing] = useState(false);
// //   const [faceAnalysisResult, setFaceAnalysisResult] = useState<string | null>(null);
// //   const [analysisError, setAnalysisError] = useState<string | null>(null);
// //   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({}); // Will only be populated on submit
// //   const [showImagePicker, setShowImagePicker] = useState(false);
  
// //   // Step tracking
// //   const [currentStep, setCurrentStep] = useState(1); // 1: Image, 2: Analysis, 3: Review, 4: Details
  
// //   // Track if we're updating existing data
// //   const [isUpdating, setIsUpdating] = useState(false);
// //   const [existingData, setExistingData] = useState<any>(null);
  
// //   // Track if it's first time setup
// //   const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  
// //   // Get navigation state
// //   const navigationState = useRootNavigationState();

// //   const auth = getAuth();
// //   const db = getFirestore();

// //   if (!visible) {
// //     return null;
// //   }

// //   // Check for existing data when component mounts
// //   useEffect(() => {
// //     checkForExistingData();
// //   }, []);

// //   // Hide bottom tabs when it's first time setup
// //   useEffect(() => {
// //     if (isFirstTimeSetup && navigationState?.key) {
// //       router.setParams({ hideBottomTabs: 'true' });
// //     }
// //   }, [isFirstTimeSetup, navigationState?.key]);

// //   // Function to check if user already has appearance data
// //   const checkForExistingData = async () => {
// //     try {
// //       const currentUser = auth.currentUser;
// //       if (!currentUser) return;
      
// //       const userId = currentUser.uid;
// //       const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
// //       const appearanceDoc = await getDoc(appearanceRef);
      
// //       if (appearanceDoc.exists()) {
// //         const data = appearanceDoc.data();
// //         setExistingData(data);
// //         setIsUpdating(true);
        
// //         // Pre-fill form with existing data
// //         setAge(data.age?.toString() || '');
// //         setHeight(data.height?.toString() || '');
// //         setWeight(data.weight?.toString() || '');
// //         setFatPercentage(data.fatPercentage || 0);
// //         setBodyType(data.bodyType || '');
// //         setGender(data.gender || '');
// //         setFaceAnalysisResult(data.faceAnalysis || null);
        
// //         // If we have face analysis, we can skip to the details step
// //         if (data.faceAnalysis) {
// //           setCurrentStep(1);
// //         }
// //       } else {
// //         // This is first time setup
// //         setIsFirstTimeSetup(true);
// //       }
// //     } catch (error) {
// //       console.error('Error checking for existing data:', error);
// //     }
// //   };

// //   // Prevent back button from closing the app
// //   useEffect(() => {
// //     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
// //       // If it's first time setup, prevent going back
// //       if (isFirstTimeSetup) {
// //         return true;
// //       }
      
// //       // If we're not on the first step, go back a step
// //       if (currentStep > 1) {
// //         setCurrentStep(currentStep - 1);
// //         return true;
// //       }
// //       // Otherwise, let the default back behavior happen
// //       return false;
// //     });

// //     return () => backHandler.remove();
// //   }, [currentStep, isFirstTimeSetup]);

// //   // Request camera permissions
// //   useEffect(() => {
// //     (async () => {
// //       if (Platform.OS !== 'web') {
// //         const { status } = await ImagePicker.requestCameraPermissionsAsync();
// //         if (status !== 'granted') {
// //           Alert.alert('Permission needed', 'Camera permission is required to take photos');
// //         }
// //       }
// //     })();
// //   }, []);

// //   // Image picking functions
// //   const pickImage = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error picking image:', error);
// //       Alert.alert('Error', 'Failed to pick image');
// //     }
// //   };

// //   const takePhoto = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchCameraAsync({
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error taking photo:', error);
// //       Alert.alert('Error', 'Failed to take photo');
// //     }
// //   };

// //   const analyzeFace = async () => {
// //     if (!image) {
// //       setAnalysisError('Please take or select a photo first');
// //       return;
// //     }

// //     setAnalyzing(true);
// //     setAnalysisError(null);
    
// //     try {
// //       // Create FormData to send the image
// //       const formData = new FormData();
      
// //       // Get the file name from the URI
// //       const uriParts = image.split('.');
// //       const fileType = uriParts[uriParts.length - 1];
      
// //       // Append the image to FormData with the correct type
// //       formData.append('image', {
// //         uri: image,
// //         name: `photo.${fileType}`,
// //         type: `image/${fileType}`
// //       } as any);

// //       // Send the image to the backend
// //       const apiResponse = await axios.post(`${BACKEND_URL}/api/analyze-face`, formData, {
// //         headers: {
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       });

// //       // Process the response
// //       if (apiResponse.status === 200) {
// //         setFaceAnalysisResult(apiResponse.data);
// //         setCurrentStep(3);
// //       } else {
// //         throw new Error('Failed to analyze face');
// //       }
// //     } catch (error) {
// //       console.error('Error analyzing face:', error);
// //       setAnalysisError('Analysis Failed. Please Try Again');
// //     } finally {
// //       setAnalyzing(false);
// //     }
// //   };

// //   const validateForm = () => {
// //     const errors: Record<string, string> = {};
// //     let isValid = true;

// //     if (!age) {
// //         errors.age = 'Please enter your age';
// //         isValid = false;
// //     }
// //     if (!height) {
// //         errors.height = 'Please enter your height in cm';
// //         isValid = false;
// //     }
// //     if (!weight) {
// //         errors.weight = 'Please enter your weight in kg';
// //         isValid = false;
// //     }
// //     if (!bodyType || bodyType === 'Select body type') {
// //         errors.bodyType = 'Please select your body type';
// //         isValid = false;
// //     }
// //     if (!gender || gender === 'Select gender') {
// //         errors.gender = 'Please select your gender';
// //         isValid = false;
// //     }

// //     setValidationErrors(errors);
// //     return isValid;
// //   };

// //   const saveData = async () => {
// //     if (!validateForm()) return;

// //     setLoading(true);
// //     try {
// //       const currentUser = auth.currentUser;
// //       if (!currentUser) {
// //         throw new Error('User not authenticated');
// //       }
      
// //       const userId = currentUser.uid;
      
// //       // Data to save/update with proper typing
// //       const appearanceData: AppearanceData = {
// //         age: parseInt(age),
// //         height: parseInt(height),
// //         weight: parseInt(weight),
// //         fatPercentage,
// //         bodyType,
// //         gender,
// //         faceAnalysis: faceAnalysisResult,
// //         face: faceAnalysisResult,
// //         updatedAt: new Date(),
// //       };
      
// //       // If this is a new record, add createdAt
// //       if (!isUpdating) {
// //         appearanceData.createdAt = new Date();
// //       }
    
// //       await setDoc(doc(db, 'users', userId, 'appearance', 'profile'), 
// //         appearanceData, 
// //         { merge: true } // This ensures we update rather than overwrite
// //       );
      
// //       // If this was first time setup, reset the tab visibility
// //       if (isFirstTimeSetup) {
// //         router.setParams({ hideBottomTabs: 'false' });
// //       }
      
// //       if (onComplete) {
// //         onComplete();
// //       } else {
// //         router.back();
// //       }

// //     } catch (error) {
// //       console.error('Error saving data:', error);
// //       Alert.alert('Error', 'Failed to save your profile data. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <SafeAreaView style={styles.fullScreenLoadingContainer}>
// //         <LoadingAnimation />
// //         <Text style={styles.loadingText}>
// //           {isUpdating ? 'Updating your profile...' : 'Saving your profile...'}
// //         </Text>
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent={false}
// //       onRequestClose={() => {
// //         // Prevent closing on Android back button if it's first time setup
// //         return isFirstTimeSetup;
// //       }}
// //     >
// //     <SafeAreaView style={styles.container}>
// //       {/* Back button - only show if not first time setup */}
// //       {!isFirstTimeSetup && (
// //         <TouchableOpacity 
// //           style={styles.backButton}
// //           onPress={() => router.back()}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#714463" />
// //         </TouchableOpacity>
// //       )}
      
// //       {/* Image Source Modal */}
// //       {showImagePicker && (
// //         <View style={styles.imageSourceOverlay}>
// //           <View style={styles.imageSourceContainer}>
// //             <View style={styles.imageSourceHeader}>
// //               <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
// //               <TouchableOpacity 
// //                 style={styles.closeButton}
// //                 onPress={() => setShowImagePicker(false)}
// //               >
// //                 <AntDesign name="close" size={24} color="#714463" />
// //               </TouchableOpacity>
// //             </View>
            
// //             <Text style={styles.imageSourceSubtitle}>
// //               Please take or select a photo of your face to continue
// //             </Text>

// //             <View style={styles.imageSourceButtons}>
// //               <TouchableOpacity 
// //                 style={styles.sourceButton}
// //                 onPress={takePhoto}
// //               >
// //                 <Ionicons name="camera-outline" size={24} color="#714463" />
// //                 <Text style={styles.sourceButtonText}>Camera</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity 
// //                 style={styles.sourceButton}
// //                 onPress={pickImage}
// //               >
// //                 <Ionicons name="images-outline" size={24} color="#714463" />
// //                 <Text style={styles.sourceButtonText}>Gallery</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       )}
      
// //       {/* Step 1: Image Selection */}
// //       {currentStep === 1 && (
// //         <View style={styles.stepContainer}>
// //           <Text style={styles.stepTitle}>
// //             {isUpdating ? 'Update Your Face Photo' : 'Step 1: Take a Photo'}
// //           </Text>
// //           <Text style={styles.stepDescription}>
// //             Please take or select a clear photo of your face
// //           </Text>
          
// //           <TouchableOpacity 
// //             style={styles.selectImageButton}
// //             onPress={() => setShowImagePicker(true)}
// //           >
// //             <Ionicons name="camera" size={40} color="#714463" />
// //             <Text style={styles.selectImageText}>Select Image</Text>
// //           </TouchableOpacity>
          
// //           {isUpdating && (
// //             <TouchableOpacity 
// //               style={styles.skipButton}
// //               onPress={() => setCurrentStep(4)}
// //             >
// //               <Text style={styles.skipButtonText}>Skip to Details</Text>
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       )}
      
// //       {/* Step 2: Face Analysis */}
// //       {currentStep === 2 && (
// //         <View style={styles.stepContainer}>
// //           <Text style={styles.stepTitle}>Step 2: Analyze Face</Text>
// //           <Text style={styles.stepDescription}>
// //             Let's analyze your facial features to provide better recommendations
// //           </Text>
          
// //           <View style={styles.imagePreviewContainer}>
// //             {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //           </View>
          
// //           <TouchableOpacity 
// //             style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
// //             onPress={analyzeFace}
// //             disabled={analyzing}
// //           >
// //             {analyzing ? (
// //               <Text style={styles.analyzeButtonText}>Analyzing...</Text>
// //             ) : (
// //               <>
// //                 <Ionicons name="scan" size={24} color="#fff" />
// //                 <Text style={styles.analyzeButtonText}>Analyze Face</Text>
// //               </>
// //             )}
// //           </TouchableOpacity>
          
// //           <TouchableOpacity 
// //             style={styles.backButton}
// //             onPress={() => setCurrentStep(1)}
// //           >
// //             <Text style={styles.backButtonText}>Change Photo</Text>
// //           </TouchableOpacity>
          
// //           {analysisError && (
// //             <Text style={styles.errorMessageText}>Please try again</Text>
// //           )}
// //         </View>
// //       )}
      
// //       {/* Step 3: Review Analysis */}
// //       {currentStep === 3 && (
// //         <View style={styles.stepContainer}>
// //           <Text style={styles.stepTitle}>Step 3: Review Analysis</Text>
// //           <Text style={styles.stepDescription}>
// //             Review the analysis of your facial features
// //           </Text>
          
// //           <View style={styles.imagePreviewContainer}>
// //             {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //           </View>
          
// //           <View style={styles.analysisResultContainer}>
// //             <Text style={styles.analysisTitle}>Face Analysis Results:</Text>
// //             <Text style={styles.analysisText}>{faceAnalysisResult}</Text>
// //           </View>
          
// //           <View style={styles.reviewButtonsContainer}>
// //             <TouchableOpacity 
// //               style={styles.reanalyzeButton}
// //               onPress={() => setCurrentStep(2)}
// //             >
// //               <AntDesign name="reload1" size={20} color="#714463" />
// //               <Text style={styles.reanalyzeButtonText}>Re-analyze</Text>
// //             </TouchableOpacity>
            
// //             <TouchableOpacity 
// //               style={styles.proceedButton}
// //               onPress={() => setCurrentStep(4)}
// //             >
// //               <AntDesign name="arrowright" size={20} color="#fff" />
// //               <Text style={styles.proceedButtonText}>Continue</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}
      
// //       {/* Step 4: Additional Details */}
// //       {currentStep === 4 && (
// //         <ScrollView style={styles.formScrollContainer}>
// //           <View style={{marginTop: 20}}>
// //             <Text style={styles.stepTitle}>
// //               {isUpdating ? 'Update Your Details' : 'Step 4: Additional Details'}
// //             </Text>
// //             <Text style={styles.stepDescription}>
// //               Please provide some additional information about yourself
// //             </Text>
// //           </View>
          
// //           <View style={styles.formSection}>
// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Age *</Text>
// //               <TextInput
// //                 style={[styles.input, validationErrors.age ? styles.inputError : null]}
// //                 value={age}
// //                 onChangeText={setAge}
// //                 placeholder="Enter your age"
// //                 keyboardType="number-pad"
// //                 maxLength={3}
// //               />
// //               {validationErrors.age && <Text style={styles.errorText}>{validationErrors.age}</Text>}
// //             </View>

// //                         <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Height (cm) *</Text>
// //               <TextInput
// //                 style={[styles.input, validationErrors.height ? styles.inputError : null]}
// //                 value={height}
// //                 onChangeText={setHeight}
// //                 placeholder="Enter your height in cm"
// //                 keyboardType="number-pad"
// //                 maxLength={3}
// //               />
// //               {validationErrors.height && <Text style={styles.errorText}>{validationErrors.height}</Text>}
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Weight (kg) *</Text>
// //               <TextInput
// //                 style={[styles.input, validationErrors.weight ? styles.inputError : null]}
// //                 value={weight}
// //                 onChangeText={setWeight}
// //                 placeholder="Enter your weight in kg"
// //                 keyboardType="number-pad"
// //                 maxLength={3}
// //               />
// //               {validationErrors.weight && <Text style={styles.errorText}>{validationErrors.weight}</Text>}
// //             </View>

// //             <View style={[styles.inputGroup, styles.halfInput]}>
// //               <Text style={styles.label}>Fat Percentage *<Text style={styles.requiredStar}></Text></Text>
// //               <View style={styles.inputWithUnit}>
// //                 <TextInput
// //                   style={styles.inputUnit}
// //                   value={fatPercentage.toString()}
// //                   onChangeText={(text) => {
// //                     const value = Number(text);
// //                     if (value <= 50) {
// //                       setFatPercentage(value);
// //                     }
// //                   }}
// //                   keyboardType="number-pad"
// //                   maxLength={2}
// //                 />
// //                 <Text style={styles.unitText}>%</Text>
// //               </View>
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Body Type *</Text>
// //               <View style={[styles.pickerContainer, validationErrors.bodyType ? styles.inputError : null]}>
// //                 <Picker
// //                   selectedValue={bodyType}
// //                   onValueChange={setBodyType}
// //                   style={styles.picker}
// //                 >
// //                   <Picker.Item label="Select body type" value="" />
// //                   <Picker.Item label="Ectomorph (Slim)" value="ectomorph" />
// //                   <Picker.Item label="Mesomorph (Athletic)" value="mesomorph" />
// //                   <Picker.Item label="Endomorph (Rounded)" value="endomorph" />
// //                 </Picker>
// //               </View>
// //               {validationErrors.bodyType && <Text style={styles.errorText}>{validationErrors.bodyType}</Text>}
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Gender *</Text>
// //               <View style={[styles.pickerContainer, validationErrors.gender ? styles.inputError : null]}>
// //                 <Picker
// //                   selectedValue={gender}
// //                   onValueChange={setGender}
// //                   style={styles.picker}
// //                 >
// //                   <Picker.Item label="Select gender" value="" />
// //                   <Picker.Item label="Male" value="male" />
// //                   <Picker.Item label="Female" value="female" />
// //                   <Picker.Item label="Non-binary" value="non-binary" />
// //                   <Picker.Item label="Prefer not to say" value="not-specified" />
// //                 </Picker>
// //               </View>
// //               {validationErrors.gender && <Text style={styles.errorText}>{validationErrors.gender}</Text>}
// //             </View>

// //             <View style={styles.finalButtonsContainer}>
// //               {/* Only show back button if not first time setup */}
// //               {!isFirstTimeSetup && currentStep > 1 && (
// //                 <TouchableOpacity 
// //                   style={styles.backToAnalysisButton}
// //                   onPress={() => setCurrentStep(isUpdating && faceAnalysisResult ? 1 : 3)}
// //                 >
// //                   <Text style={styles.backToAnalysisText}>Back</Text>
// //                 </TouchableOpacity>
// //               )}
              
// //               <TouchableOpacity 
// //                 style={[
// //                   styles.submitButton, 
// //                   {backgroundColor: '#714463'},
// //                   // If first time setup, make button take full width
// //                   isFirstTimeSetup && {flex: 1, marginLeft: 0}
// //                 ]}
// //                 onPress={saveData}
// //               >
// //                 <View style={styles.gradient}>
// //                   <Text style={styles.submitButtonText}>
// //                     {isUpdating ? 'Update Profile' : 'Save Profile'}
// //                   </Text>
// //                 </View>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </ScrollView>
// //       )}
      
// //       {/* Progress indicator */}
// //       <View style={styles.progressContainer}>
// //         {[1, 2, 3, 4].map(step => (
// //           <View 
// //             key={step}
// //             style={[
// //               styles.progressDot,
// //               currentStep === step ? styles.progressDotActive : null
// //             ]}
// //           />
// //         ))}
// //       </View>
      
// //       {/* Full-screen analyzing overlay */}
// //       {analyzing && (
// //         <View style={styles.loadingOverlay}>
// //           <LoadingAnimation />
// //         </View>
// //       )}
// //     </SafeAreaView>
// //     </Modal>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f4e9de',
// //   },
// //   backButton: {
// //     position: 'absolute',
// //     top: 50,
// //     left: 20,
// //     zIndex: 1000,
// //     padding: 8,
// //     borderRadius: 20,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //   },
// //   fullScreenLoadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f4e9de',
// //   },
// //   halfInput: {
// //     width: '48%',
// //   },
// //   requiredStar: {
// //     color: '#ff3b30',
// //     fontWeight: 'bold',
// //   },
// //   errorMessageText: {
// //     color: '#ff0000',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginTop: 10,
// //     textAlign: 'center',
// //   },
// //   inputWithUnit: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputUnit: {
// //     flex: 1,
// //     padding: 12,
// //     fontSize: 16,
// //     borderTopRightRadius: 0,
// //     borderBottomRightRadius: 0,
// //   },
// //   unitText: {
// //     paddingHorizontal: 12,
// //     fontSize: 16,
// //     color: '#666',
// //     backgroundColor: '#f5f5f5',
// //     height: '100%',
// //     textAlignVertical: 'center',
// //     borderLeftWidth: 1,
// //     borderLeftColor: '#ddd',
// //     paddingVertical: 12,
// //   },
// //   loadingOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000
// //   },
// //   loadingContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   loadingText: {
// //     marginTop: 20,
// //     fontSize: 18,
// //     color: '#714463',
// //     textAlign: 'center',
// //   },
// //   stepContainer: {
// //     flex: 1,
// //     padding: 20,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 50, // Add space for the back button
// //   },
// //   stepTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginTop: 20,
// //     textAlign: 'center',
// //   },
// //   stepDescription: {
// //     fontSize: 16,
// //     color: '#666',
// //     textAlign: 'center',
// //     marginBottom: 10,
// //   },
// //   selectImageButton: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     backgroundColor: '#e8ccb9',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //   },
// //   selectImageText: {
// //     marginTop: 10,
// //     color: '#714463',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   imagePreviewContainer: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     overflow: 'hidden',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //     marginBottom: 20,
// //   },
// //   imagePreview: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   analyzeButton: {
// //     flexDirection: 'row',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 15,
// //   },
// //   analyzeButtonDisabled: {
// //     backgroundColor: '#a58e99',
// //   },
// //   analyzeButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //     marginLeft: 10,
// //   },
// //   backButtonText: {
// //     color: '#714463',
// //     fontSize: 16,
// //   },
// //   analysisResultContainer: {
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     marginBottom: 20,
// //     width: '100%',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   analysisTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 10,
// //   },
// //   analysisText: {
// //     fontSize: 16,
// //     color: '#333',
// //     lineHeight: 24,
// //   },
// //   reviewButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //   },
// //   reanalyzeButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   reanalyzeButtonText: {
// //     color: '#714463',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   proceedButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginLeft: 10,
// //   },
// //   proceedButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   formScrollContainer: {
// //     flex: 1,
// //     marginTop: 50, // Add space for the back button
// //   },
// //   formSection: {
// //     padding: 20,
// //   },
// //   inputGroup: {
// //     marginBottom: 20,
// //   },
// //   label: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 8,
// //   },
// //   input: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 16,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputError: {
// //     borderColor: '#ff3b30',
// //     borderWidth: 1,
// //   },
// //   errorText: {
// //     color: '#ff3b30',
// //     fontSize: 14,
// //     marginTop: 5,
// //   },
// //   slider: {
// //     width: '100%',
// //     height: 40,
// //   },
// //   sliderLabels: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 10,
// //   },
// //   pickerContainer: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     overflow: 'hidden',
// //   },
// //   picker: {
// //     height: 50,
// //     width: '100%',
// //   },
// //   finalButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 20,
// //   },
// //   backToAnalysisButton: {
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 15,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   backToAnalysisText: {
// //     color: '#714463',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   submitButton: {
// //     borderRadius: 25,
// //     overflow: 'hidden',
// //     flex: 2,
// //     marginLeft: 10,
// //   },
// //   gradient: {
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   submitButtonText: {
// //     color: '#fff',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   progressContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     padding: 10,
// //     marginBottom: 40,
// //   },
// //   progressDot: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //     backgroundColor: '#e8ccb9',
// //     marginHorizontal: 5,
// //   },
// //   progressDotActive: {
// //     backgroundColor: '#714463',
// //     width: 12,
// //     height: 12,
// //     borderRadius: 6,
// //   },
// //   imageSourceOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000,
// //   },
// //   imageSourceContainer: {
// //     backgroundColor: '#f0e6e3',
// //     width: '80%',
// //     borderRadius: 15,
// //     padding: 20,
// //     alignItems: 'center',
// //   },
// //   imageSourceHeader: {
// //     width: '100%',
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     position: 'relative',
// //     marginBottom: 10,
// //   },
// //   closeButton: {
// //     position: 'absolute',
// //     right: -14,
// //     top: -10,
// //   },
// //   imageSourceTitle: {
// //     color: '#714463',
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //   },
// //   imageSourceSubtitle: {
// //     color: '#714463',
// //     fontSize: 16,
// //     textAlign: 'center',
// //     marginBottom: 20,
// //     opacity: 0.8,
// //   },
// //   imageSourceButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     width: '100%',
// //     paddingHorizontal: 20,
// //   },
// //   sourceButton: {
// //     alignItems: 'center',
// //     padding: 15,
// //     borderRadius: 10,
// //     backgroundColor: 'rgba(113, 68, 99, 0.1)',
// //     width: '45%',
// //   },
// //   sourceButtonText: {
// //     color: '#714463',
// //     marginTop: 5,
// //     fontSize: 16,
// //     fontWeight: '500',
// //   },
// //   skipButton: {
// //     marginTop: 20,
// //     padding: 10,
// //   },
// //   skipButtonText: {
// //     color: '#714463',
// //     fontSize: 16,
// //     textDecorationLine: 'underline',
// //   },
// // });



// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Image,
// //   TextInput,
// //   ScrollView,
// //   Alert,
// //   Dimensions,
// //   Platform,
// //   Modal,
// //   BackHandler,
// //   SafeAreaView
// // } from 'react-native';
// // import { Picker } from '@react-native-picker/picker';
// // import Slider from '@react-native-community/slider';
// // import * as ImagePicker from 'expo-image-picker';
// // import { getAuth } from 'firebase/auth';
// // import { getFirestore, doc, setDoc } from 'firebase/firestore';
// // import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import axios from 'axios';
// // import LoadingAnimation from '../components/loading_ani';

// // const { width, height } = Dimensions.get('window');

// // // Define the backend URL - replace with your actual backend URL
// // const BACKEND_URL = 'http://10.11.5.88:5000'; // For Android emulator

// // // Define prop types
// // interface AppearanceFormProps {
// //   onComplete: () => void;
// //   visible: boolean; // Add visible prop to control when the form is shown
// // }

// // export default function AppearanceForm({ onComplete, visible }: AppearanceFormProps) {
// //   // Form data states
// //   const [image, setImage] = useState<string | null>(null);
// //   const [age, setAge] = useState('');
// //   const [height, setHeight] = useState('');
// //   const [fatPercentage, setFatPercentage] = useState(0);
// //   const [bodyType, setBodyType] = useState('');
// //   const [weight, setWeight] = useState('');
// //   const [gender, setGender] = useState('');
// //   const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  
// //   // UI states
// //   const [loading, setLoading] = useState(false);
// //   const [analyzing, setAnalyzing] = useState(false);
// //   const [faceAnalysisResult, setFaceAnalysisResult] = useState<string | null>(null);
// //   const [analysisError, setAnalysisError] = useState<string | null>(null);
// //   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({}); // Will only be populated on submit
// //   const [showImagePicker, setShowImagePicker] = useState(false);
  
// //   // Step tracking
// //   const [currentStep, setCurrentStep] = useState(1); // 1: Image, 2: Analysis, 3: Review, 4: Details

// //   const auth = getAuth();
// //   const db = getFirestore();

// //   // Reset form when visibility changes
// //   useEffect(() => {
// //     if (!visible) {
// //       // Reset form when hidden
// //       setImage(null);
// //       setAge('');
// //       setHeight('');
// //       setFatPercentage(0);
// //       setBodyType('');
// //       setWeight('');
// //       setGender('');
// //       setFaceAnalysisResult(null);
// //       setValidationErrors({});
// //       setCurrentStep(1);
// //       setShowImagePicker(false);
// //     }
// //   }, [visible]);

// //   // Prevent back button from closing the form until completed
// //   useEffect(() => {
// //     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
// //       if (visible) {
// //         // Return true to prevent default behavior (app exit)
// //         return true;
// //       }
// //       return false;
// //     });

// //     return () => backHandler.remove();
// //   }, [visible]);

// //   // Request camera permissions
// //   useEffect(() => {
// //     (async () => {
// //       if (Platform.OS !== 'web') {
// //         const { status } = await ImagePicker.requestCameraPermissionsAsync();
// //         if (status !== 'granted') {
// //           Alert.alert('Permission needed', 'Camera permission is required to take photos');
// //         }
// //       }
// //     })();
// //   }, []);

// //   // Image picking functions
// //   const pickImage = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error picking image:', error);
// //       Alert.alert('Error', 'Failed to pick image');
// //     }
// //   };

// //   const takePhoto = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchCameraAsync({
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error taking photo:', error);
// //       Alert.alert('Error', 'Failed to take photo');
// //     }
// //   };

// //   const analyzeFace = async () => {
// //     if (!image) {
// //       setAnalysisError('Please take or select a photo first');
// //       return;
// //     }

// //     setAnalyzing(true);
// //     setAnalysisError(null);
    
// //     try {
// //       // Create FormData to send the image
// //       const formData = new FormData();
      
// //       // Get the file name from the URI
// //       const uriParts = image.split('.');
// //       const fileType = uriParts[uriParts.length - 1];
      
// //       // Append the image to FormData with the correct type
// //       formData.append('image', {
// //         uri: image,
// //         name: `photo.${fileType}`,
// //         type: `image/${fileType}`
// //       } as any);

// //       // Send the image to the backend
// //       const apiResponse = await axios.post(`${BACKEND_URL}/api/analyze-face`, formData, {
// //         headers: {
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       });

// //       // Process the response
// //       if (apiResponse.status === 200) {
// //         setFaceAnalysisResult(apiResponse.data);
// //         setCurrentStep(3);
// //       } else {
// //         throw new Error('Failed to analyze face');
// //       }
// //     } catch (error) {
// //       console.error('Error analyzing face:', error);
// //       setAnalysisError('Analysis Failed. Please Try Again');
// //     } finally {
// //       setAnalyzing(false);
// //     }
// //   };

// //   const validateForm = () => {
// //     const errors: Record<string, string> = {};
// //     let isValid = true;

// //     if (!age) {
// //         errors.age = 'Please enter your age';
// //         isValid = false;
// //     }
// //     if (!height) {
// //         errors.height = 'Please enter your height in cm';
// //         isValid = false;
// //     }
// //     if (!weight) {
// //         errors.weight = 'Please enter your weight in kg';
// //         isValid = false;
// //     }
// //     if (!bodyType || bodyType === 'Select body type') {
// //         errors.bodyType = 'Please select your body type';
// //         isValid = false;
// //     }
// //     if (!gender || gender === 'Select gender') {
// //         errors.gender = 'Please select your gender';
// //         isValid = false;
// //     }

// //     setValidationErrors(errors);
// //     return isValid;
// //   };

// //   const saveData = async () => {
// //     if (!validateForm()) return;

// //     setLoading(true);
// //     try {
// //       const currentUser = auth.currentUser;
// //       if (!currentUser) {
// //         throw new Error('User not authenticated');
// //       }
      
// //       const userId = currentUser.uid;
    
// //       await setDoc(doc(db, 'users', userId, 'appearance', 'profile'), {
// //         age: parseInt(age),
// //         height: parseInt(height),
// //         weight: parseInt(weight),
// //         fatPercentage,
// //         bodyType,
// //         gender,
// //         faceAnalysis: faceAnalysisResult,
// //         face: faceAnalysisResult,
// //         createdAt: new Date(),
// //       });
      
// //       // Call the onComplete callback to inform parent component
// //       onComplete();
// //     } catch (error) {
// //       console.error('Error saving data:', error);
// //       Alert.alert('Error', 'Failed to save your profile data. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!visible) {
// //     return null;
// //   }

// //   if (loading) {
// //     return (
// //       <Modal visible={visible} transparent={false} animationType="fade">
// //         <View style={styles.fullScreenLoadingContainer}>
// //           <LoadingAnimation />
// //           <Text style={styles.loadingText}>Saving your profile...</Text>
// //         </View>
// //       </Modal>
// //     );
// //   }

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent={false}
// //       onRequestClose={() => {
// //         return true;
// //       }}
// //     >
// //       <SafeAreaView style={styles.container}>
// //         {/* Image Source Modal */}
// //         {showImagePicker && (
// //           <View style={styles.imageSourceOverlay}>
// //             <View style={styles.imageSourceContainer}>
// //               <View style={styles.imageSourceHeader}>
// //                 <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
// //                 <TouchableOpacity 
// //                   style={styles.closeButton}
// //                   onPress={() => setShowImagePicker(false)}
// //                 >
// //                   <AntDesign name="close" size={24} color="#714463" />
// //                 </TouchableOpacity>
// //               </View>
              
// //               <Text style={styles.imageSourceSubtitle}>
// //                 Please take or select a photo of your face to continue
// //               </Text>

// //               <View style={styles.imageSourceButtons}>
// //                 <TouchableOpacity 
// //                   style={styles.sourceButton}
// //                   onPress={takePhoto}
// //                 >
// //                   <Ionicons name="camera-outline" size={24} color="#714463" />
// //                   <Text style={styles.sourceButtonText}>Camera</Text>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity 
// //                   style={styles.sourceButton}
// //                   onPress={pickImage}
// //                 >
// //                   <Ionicons name="images-outline" size={24} color="#714463" />
// //                   <Text style={styles.sourceButtonText}>Gallery</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         )}
        
// //         {/* Step 1: Image Selection */}
// //         {currentStep === 1 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>Step 1: Take a Photo</Text>
// //             <Text style={styles.stepDescription}>
// //               Please take or select a clear photo of your face
// //             </Text>
            
// //             <TouchableOpacity 
// //               style={styles.selectImageButton}
// //               onPress={() => setShowImagePicker(true)}
// //             >
// //               <Ionicons name="camera" size={40} color="#714463" />
// //               <Text style={styles.selectImageText}>Select Image</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}
        
// //         {/* Step 2: Face Analysis */}
// //         {currentStep === 2 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>Step 2: Analyze Face</Text>
// //             <Text style={styles.stepDescription}>
// //               Let's analyze your facial features to provide better recommendations
// //             </Text>
            
// //             <View style={styles.imagePreviewContainer}>
// //               {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //             </View>
            
// //             <TouchableOpacity 
// //               style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
// //               onPress={analyzeFace}
// //               disabled={analyzing}
// //             >
// //               {analyzing ? (
// //                 <Text style={styles.analyzeButtonText}>Analyzing...</Text>
// //               ) : (
// //                 <>
// //                   <Ionicons name="scan" size={24} color="#fff" />
// //                   <Text style={styles.analyzeButtonText}>Analyze Face</Text>
// //                 </>
// //               )}
// //             </TouchableOpacity>
            
// //             {/* In Step 2 section, after the Change Photo button */}
// //             <TouchableOpacity 
// //               style={styles.backButton}
// //               onPress={() => setCurrentStep(1)}
// //             >
// //               <Text style={styles.backButtonText}>Change Photo</Text>
// //             </TouchableOpacity>
            
// //             {analysisError && (
// //               <Text style={styles.errorMessageText}>Please try again</Text>
// //             )}
// //           </View>
// //         )}
        
// //         {/* Step 3: Review Analysis */}
// //         {currentStep === 3 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>Step 3: Review Analysis</Text>
// //             <Text style={styles.stepDescription}>
// //               Review the analysis of your facial features
// //             </Text>
            
// //             <View style={styles.imagePreviewContainer}>
// //               {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //             </View>
            
// //             <View style={styles.analysisResultContainer}>
// //               <Text style={styles.analysisTitle}>Face Analysis Results:</Text>
// //               <Text style={styles.analysisText}>{faceAnalysisResult}</Text>
// //             </View>
            
// //             <View style={styles.reviewButtonsContainer}>
// //               <TouchableOpacity 
// //                 style={styles.reanalyzeButton}
// //                 onPress={() => setCurrentStep(2)}
// //               >
// //                 <AntDesign name="reload1" size={20} color="#714463" />
// //                 <Text style={styles.reanalyzeButtonText}>Re-analyze</Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity 
// //                 style={styles.proceedButton}
// //                 onPress={() => setCurrentStep(4)}
// //               >
// //                 <AntDesign name="arrowright" size={20} color="#fff" />
// //                 <Text style={styles.proceedButtonText}>Continue</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
        
// //         {/* Step 4: Additional Details */}
// //         {currentStep === 4 && (
// //           <ScrollView style={styles.formScrollContainer}>
// //             <View style={{marginTop: 20}}>
// //               <Text style={styles.stepTitle}>Step 4: Additional Details</Text>
// //               <Text style={styles.stepDescription}>
// //                 Please provide some additional information about yourself
// //               </Text>
// //             </View>
            
// //             <View style={styles.formSection}>
// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Age *</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={age}
// //                   onChangeText={setAge}
// //                   placeholder="Enter your age"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Height (cm) *</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={height}
// //                   onChangeText={setHeight}
// //                   placeholder="Enter your height in cm"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Weight (kg) *</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={weight}
// //                   onChangeText={setWeight}
// //                   placeholder="Enter your weight in kg"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //               </View>

// //             <View style={[styles.inputGroup, styles.halfInput]}>
// //               <Text style={styles.label}>Fat Percentage *<Text style={styles.requiredStar}></Text></Text>
// //               <View style={styles.inputWithUnit}>
// //                 <TextInput
// //                   style={styles.inputUnit}
// //                   value={fatPercentage.toString()}
// //                   onChangeText={(text) => {
// //                     const value = Number(text);
// //                     if (value <= 50) {
// //                       setFatPercentage(value);
// //                     }
// //                   }}
// //                   keyboardType="number-pad"
// //                   maxLength={2}
// //                 />
// //                 <Text style={styles.unitText}>%</Text>
// //               </View>
// //             </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Body Type *</Text>
// //                 <View style={styles.pickerContainer}>
// //                   <Picker
// //                     selectedValue={bodyType}
// //                     onValueChange={setBodyType}
// //                     style={styles.picker}
// //                   >
// //                     <Picker.Item label="Select body type" value="" />
// //                     <Picker.Item label="Ectomorph (Slim)" value="ectomorph" />
// //                     <Picker.Item label="Mesomorph (Athletic)" value="mesomorph" />
// //                     <Picker.Item label="Endomorph (Rounded)" value="endomorph" />
// //                   </Picker>
// //                 </View>
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Gender *</Text>
// //                 <View style={styles.pickerContainer}>
// //                   <Picker
// //                     selectedValue={gender}
// //                     onValueChange={setGender}
// //                     style={styles.picker}
// //                   >
// //                     <Picker.Item label="Select gender" value="" />
// //                     <Picker.Item label="Male" value="male" />
// //                     <Picker.Item label="Female" value="female" />
// //                     <Picker.Item label="Non-binary" value="non-binary" />
// //                     <Picker.Item label="Prefer not to say" value="not-specified" />
// //                   </Picker>
// //                 </View>
// //               </View>

// //               <View style={styles.finalButtonsContainer}>
// //                 <TouchableOpacity 
// //                   style={styles.backToAnalysisButton}
// //                   onPress={() => setCurrentStep(3)}
// //                 >
// //                   <Text style={styles.backToAnalysisText}>Back</Text>
// //                 </TouchableOpacity>
                
// //                 <TouchableOpacity 
// //                   style={[styles.submitButton, {backgroundColor: '#714463'}]}
// //                   onPress={saveData}
// //                 >
// //                   <View style={styles.gradient}>
// //                     <Text style={styles.submitButtonText}>Save Profile</Text>
// //                   </View>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </ScrollView>
// //         )}
        
// //         {/* Progress indicator */}
// //         <View style={styles.progressContainer}>
// //           {[1, 2, 3, 4].map(step => (
// //             <View 
// //               key={step}
// //               style={[
// //                 styles.progressDot,
// //                 currentStep === step ? styles.progressDotActive : null
// //               ]}
// //             />
// //           ))}
// //         </View>
// //         {/* Full-screen analyzing overlay */}
// //         {analyzing && (
// //         <View style={styles.loadingOverlay}>
// //             <LoadingAnimation />
// //         </View>
// //         )}
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f4e9de',
// //   },
// //   fullScreenLoadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f4e9de',
// //   },
// //   halfInput: {
// //     width: '48%',
// //   },
// //   requiredStar: {
// //     color: '#ff3b30',
// //     fontWeight: 'bold',
// //   },
// //   errorMessageText: {
// //     color: '#ff0000',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginTop: 10,
// //     textAlign: 'center',
// //   },
// //   inputWithUnit: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputUnit: {
// //     flex: 1,
// //     padding: 12,
// //     fontSize: 16,
// //     borderTopRightRadius: 0,
// //     borderBottomRightRadius: 0,
// //   },
// //   unitText: {
// //     paddingHorizontal: 12,
// //     fontSize: 16,
// //     color: '#666',
// //     backgroundColor: '#f5f5f5',
// //     height: '100%',
// //     textAlignVertical: 'center',
// //     borderLeftWidth: 1,
// //     borderLeftColor: '#ddd',
// //     paddingVertical: 12,
// //   },
// //   loadingOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000
// //   },
// //   loadingContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   loadingText: {
// //     marginTop: 20,
// //     fontSize: 18,
// //     color: '#714463',
// //     textAlign: 'center',
// //   },
// //   stepContainer: {
// //     flex: 1,
// //     padding: 20,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   stepTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginTop: 20,
// //     textAlign: 'center',
// //   },
// //   stepDescription: {
// //     fontSize: 16,
// //     color: '#666',
// //     textAlign: 'center',
// //     marginBottom: 10,
// //   },
// //   selectImageButton: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     backgroundColor: '#e8ccb9',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //   },
// //   selectImageText: {
// //     marginTop: 10,
// //     color: '#714463',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   imagePreviewContainer: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     overflow: 'hidden',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //     marginBottom: 20,
// //   },
// //   imagePreview: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   analyzeButton: {
// //     flexDirection: 'row',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 15,
// //   },
// //   analyzeButtonDisabled: {
// //     backgroundColor: '#a58e99',
// //   },
// //   analyzeButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //     marginLeft: 10,
// //   },
// //   backButton: {
// //     padding: 10,
// //   },
// //   backButtonText: {
// //     color: '#714463',
// //     fontSize: 16,
// //   },
// //   analysisResultContainer: {
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     marginBottom: 20,
// //     width: '100%',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   analysisTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 10,
// //   },
// //   analysisText: {
// //     fontSize: 16,
// //     color: '#333',
// //     lineHeight: 24,
// //   },
// //   reviewButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //   },
// //   reanalyzeButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   reanalyzeButtonText: {
// //     color: '#714463',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   proceedButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginLeft: 10,
// //   },
// //   proceedButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   formScrollContainer: {
// //     flex: 1,
// //   },
// //   formSection: {
// //     padding: 20,
// //   },
// //   inputGroup: {
// //     marginBottom: 20,
// //   },
// //   label: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 8,
// //   },
// //   input: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 16,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputError: {
// //     borderColor: '#ff3b30',
// //     borderWidth: 1,
// //   },
// //   errorText: {
// //     color: '#ff3b30',
// //     fontSize: 14,
// //     marginTop: 5,
// //   },
// //   slider: {
// //     width: '100%',
// //     height: 40,
// //   },
// //   sliderLabels: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 10,
// //   },
// //   pickerContainer: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     overflow: 'hidden',
// //   },
// //   picker: {
// //     height: 50,
// //     width: '100%',
// //   },
// //   finalButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 20,
// //   },
// //   backToAnalysisButton: {
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 15,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   backToAnalysisText: {
// //     color: '#714463',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   submitButton: {
// //     borderRadius: 25,
// //     overflow: 'hidden',
// //     flex: 2,
// //     marginLeft: 10,
// //   },
// //   gradient: {
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   submitButtonText: {
// //     color: '#fff',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   progressContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     padding: 10,
// //   },
// //   progressDot: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //     backgroundColor: '#e8ccb9',
// //     marginHorizontal: 5,
// //   },
// //   progressDotActive: {
// //     backgroundColor: '#714463',
// //     width: 12,
// //     height: 12,
// //     borderRadius: 6,
// //   },
// //   imageSourceOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000,
// //   },
// //   imageSourceContainer: {
// //     backgroundColor: '#f0e6e3',
// //     width: '80%',
// //     borderRadius: 15,
// //     padding: 20,
// //     alignItems: 'center',
// //   },
// //   imageSourceHeader: {
// //     width: '100%',
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     position: 'relative',
// //     marginBottom: 10,
// //   },
// //   closeButton: {
// //     position: 'absolute',
// //     right: -14,
// //     top: -10,
// //   },
// //   imageSourceTitle: {
// //     color: '#714463',
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //   },
// //   imageSourceSubtitle: {
// //     color: '#714463',
// //     fontSize: 16,
// //     textAlign: 'center',
// //     marginBottom: 20,
// //     opacity: 0.8,
// //   },
// //   imageSourceButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     width: '100%',
// //     paddingHorizontal: 20,
// //   },
// //   sourceButton: {
// //     alignItems: 'center',
// //     padding: 15,
// //     borderRadius: 10,
// //     backgroundColor: 'rgba(113, 68, 99, 0.1)',
// //     width: '45%',
// //   },
// //   sourceButtonText: {
// //     color: '#714463',
// //     marginTop: 5,
// //     fontSize: 16,
// //     fontWeight: '500',
// //   },
// // });

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Image,
// //   TextInput,
// //   ScrollView,
// //   Alert,
// //   Dimensions,
// //   Platform,
// //   Modal,
// //   BackHandler,
// //   SafeAreaView
// // } from 'react-native';
// // import { Picker } from '@react-native-picker/picker';
// // import Slider from '@react-native-community/slider';
// // import * as ImagePicker from 'expo-image-picker';
// // import { getAuth } from 'firebase/auth';
// // import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
// // import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import axios from 'axios';
// // import LoadingAnimation from '../../components/loading_ani';

// // const { width, height } = Dimensions.get('window');

// // // Define the backend URL - replace with your actual backend URL
// // const BACKEND_URL = 'http://10.11.5.88:5000'; // For Android emulator

// // // Define interface for appearance data
// // interface AppearanceData {
// //   age: number;
// //   height: number;
// //   weight: number;
// //   fatPercentage: number;
// //   bodyType: string;
// //   gender: string;
// //   faceAnalysis: string | null;
// //   face: string | null;
// //   updatedAt: Date;
// //   createdAt?: Date; // Make createdAt optional
// // }

// // // Define prop types
// // interface AppearanceFormProps {
// //   onComplete: () => void;
// //   visible: boolean; // Add visible prop to control when the form is shown
// // }

// // export default function AppearanceForm({ onComplete, visible }: AppearanceFormProps) {
// //   // Form data states
// //   const [image, setImage] = useState<string | null>(null);
// //   const [age, setAge] = useState('');
// //   const [height, setHeight] = useState('');
// //   const [fatPercentage, setFatPercentage] = useState(0);
// //   const [bodyType, setBodyType] = useState('');
// //   const [weight, setWeight] = useState('');
// //   const [gender, setGender] = useState('');
// //   const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  
// //   // UI states
// //   const [loading, setLoading] = useState(false);
// //   const [analyzing, setAnalyzing] = useState(false);
// //   const [faceAnalysisResult, setFaceAnalysisResult] = useState<string | null>(null);
// //   const [analysisError, setAnalysisError] = useState<string | null>(null);
// //   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({}); // Will only be populated on submit
// //   const [showImagePicker, setShowImagePicker] = useState(false);
  
// //   // Step tracking
// //   const [currentStep, setCurrentStep] = useState(1); // 1: Image, 2: Analysis, 3: Review, 4: Details
  
// //   // Track if we're updating existing data
// //   const [isUpdating, setIsUpdating] = useState(false);
// //   const [existingData, setExistingData] = useState<any>(null);

// //   const auth = getAuth();
// //   const db = getFirestore();

// //   // Check for existing data when component becomes visible
// //   useEffect(() => {
// //     if (visible) {
// //       checkForExistingData();
// //     }
// //   }, [visible]);

// //   // Function to check if user already has appearance data
// //   const checkForExistingData = async () => {
// //     try {
// //       const currentUser = auth.currentUser;
// //       if (!currentUser) return;
      
// //       const userId = currentUser.uid;
// //       const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
// //       const appearanceDoc = await getDoc(appearanceRef);
      
// //       if (appearanceDoc.exists()) {
// //         const data = appearanceDoc.data();
// //         setExistingData(data);
// //         setIsUpdating(true);
        
// //         // Pre-fill form with existing data
// //         setAge(data.age?.toString() || '');
// //         setHeight(data.height?.toString() || '');
// //         setWeight(data.weight?.toString() || '');
// //         setFatPercentage(data.fatPercentage || 0);
// //         setBodyType(data.bodyType || '');
// //         setGender(data.gender || '');
// //         setFaceAnalysisResult(data.faceAnalysis || null);
        
// //         // If we have face analysis, we can skip to the details step
// //         if (data.faceAnalysis) {
// //           setCurrentStep(4);
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error checking for existing data:', error);
// //     }
// //   };

// //   // Reset form when visibility changes
// //   useEffect(() => {
// //     if (!visible) {
// //       // Reset form when hidden
// //       setImage(null);
// //       setAge('');
// //       setHeight('');
// //       setFatPercentage(0);
// //       setBodyType('');
// //       setWeight('');
// //       setGender('');
// //       setFaceAnalysisResult(null);
// //       setValidationErrors({});
// //       setCurrentStep(1);
// //       setShowImagePicker(false);
// //       setIsUpdating(false);
// //       setExistingData(null);
// //     }
// //   }, [visible]);

// //   // Prevent back button from closing the form until completed
// //   useEffect(() => {
// //     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
// //       if (visible) {
// //         // Return true to prevent default behavior (app exit)
// //         return true;
// //       }
// //       return false;
// //     });

// //     return () => backHandler.remove();
// //   }, [visible]);

// //   // Request camera permissions
// //   useEffect(() => {
// //     (async () => {
// //       if (Platform.OS !== 'web') {
// //         const { status } = await ImagePicker.requestCameraPermissionsAsync();
// //         if (status !== 'granted') {
// //           Alert.alert('Permission needed', 'Camera permission is required to take photos');
// //         }
// //       }
// //     })();
// //   }, []);

// //   // Image picking functions
// //   const pickImage = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error picking image:', error);
// //       Alert.alert('Error', 'Failed to pick image');
// //     }
// //   };

// //   const takePhoto = async () => {
// //     try {
// //       setShowImagePicker(false);
      
// //       const result = await ImagePicker.launchCameraAsync({
// //         allowsEditing: true,
// //         aspect: [1, 1],
// //         quality: 0.8,
// //       });

// //       if (!result.canceled) {
// //         setImage(result.assets[0].uri);
// //         setCurrentStep(2);
// //       }
// //     } catch (error) {
// //       console.error('Error taking photo:', error);
// //       Alert.alert('Error', 'Failed to take photo');
// //     }
// //   };

// //   const analyzeFace = async () => {
// //     if (!image) {
// //       setAnalysisError('Please take or select a photo first');
// //       return;
// //     }

// //     setAnalyzing(true);
// //     setAnalysisError(null);
    
// //     try {
// //       // Create FormData to send the image
// //       const formData = new FormData();
      
// //       // Get the file name from the URI
// //       const uriParts = image.split('.');
// //       const fileType = uriParts[uriParts.length - 1];
      
// //       // Append the image to FormData with the correct type
// //       formData.append('image', {
// //         uri: image,
// //         name: `photo.${fileType}`,
// //         type: `image/${fileType}`
// //       } as any);

// //       // Send the image to the backend
// //       const apiResponse = await axios.post(`${BACKEND_URL}/api/analyze-face`, formData, {
// //         headers: {
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       });

// //       // Process the response
// //       if (apiResponse.status === 200) {
// //         setFaceAnalysisResult(apiResponse.data);
// //         setCurrentStep(3);
// //       } else {
// //         throw new Error('Failed to analyze face');
// //       }
// //     } catch (error) {
// //       console.error('Error analyzing face:', error);
// //       setAnalysisError('Analysis Failed. Please Try Again');
// //     } finally {
// //       setAnalyzing(false);
// //     }
// //   };

// //   const validateForm = () => {
// //     const errors: Record<string, string> = {};
// //     let isValid = true;

// //     if (!age) {
// //         errors.age = 'Please enter your age';
// //         isValid = false;
// //     }
// //     if (!height) {
// //         errors.height = 'Please enter your height in cm';
// //         isValid = false;
// //     }
// //     if (!weight) {
// //         errors.weight = 'Please enter your weight in kg';
// //         isValid = false;
// //     }
// //     if (!bodyType || bodyType === 'Select body type') {
// //         errors.bodyType = 'Please select your body type';
// //         isValid = false;
// //     }
// //     if (!gender || gender === 'Select gender') {
// //         errors.gender = 'Please select your gender';
// //         isValid = false;
// //     }

// //     setValidationErrors(errors);
// //     return isValid;
// //   };

// //   const saveData = async () => {
// //     if (!validateForm()) return;

// //     setLoading(true);
// //     try {
// //       const currentUser = auth.currentUser;
// //       if (!currentUser) {
// //         throw new Error('User not authenticated');
// //       }
      
// //       const userId = currentUser.uid;
      
// //       // Data to save/update with proper typing
// //       const appearanceData: AppearanceData = {
// //         age: parseInt(age),
// //         height: parseInt(height),
// //         weight: parseInt(weight),
// //         fatPercentage,
// //         bodyType,
// //         gender,
// //         faceAnalysis: faceAnalysisResult,
// //         face: faceAnalysisResult,
// //         updatedAt: new Date(),
// //       };
      
// //       // If this is a new record, add createdAt
// //       if (!isUpdating) {
// //         appearanceData.createdAt = new Date();
// //       }
    
// //       await setDoc(doc(db, 'users', userId, 'appearance', 'profile'), 
// //         appearanceData, 
// //         { merge: true } // This ensures we update rather than overwrite
// //       );
      
// //       // Show success message
// //       Alert.alert(
// //         "Success", 
// //         isUpdating ? "Profile updated successfully!" : "Profile created successfully!",
// //         [{ 
// //           text: "OK",
// //           onPress: () => {
// //             // Call the onComplete callback to inform parent component
// //             onComplete();
// //           }
// //         }]
// //       );
// //     } catch (error) {
// //       console.error('Error saving data:', error);
// //       Alert.alert('Error', 'Failed to save your profile data. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!visible) {
// //     return null;
// //   }

// //   if (loading) {
// //     return (
// //       <Modal visible={visible} transparent={false} animationType="fade">
// //         <View style={styles.fullScreenLoadingContainer}>
// //           <LoadingAnimation />
// //           <Text style={styles.loadingText}>
// //             {isUpdating ? 'Updating your profile...' : 'Saving your profile...'}
// //           </Text>
// //         </View>
// //       </Modal>
// //     );
// //   }

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent={false}
// //       onRequestClose={() => {
// //         return true;
// //       }}
// //     >
// //       <SafeAreaView style={styles.container}>
// //         {/* Image Source Modal */}
// //         {showImagePicker && (
// //           <View style={styles.imageSourceOverlay}>
// //             <View style={styles.imageSourceContainer}>
// //               <View style={styles.imageSourceHeader}>
// //                 <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
// //                 <TouchableOpacity 
// //                   style={styles.closeButton}
// //                   onPress={() => setShowImagePicker(false)}
// //                 >
// //                   <AntDesign name="close" size={24} color="#714463" />
// //                 </TouchableOpacity>
// //               </View>
              
// //               <Text style={styles.imageSourceSubtitle}>
// //                 Please take or select a photo of your face to continue
// //               </Text>

// //               <View style={styles.imageSourceButtons}>
// //                 <TouchableOpacity 
// //                   style={styles.sourceButton}
// //                   onPress={takePhoto}
// //                 >
// //                   <Ionicons name="camera-outline" size={24} color="#714463" />
// //                   <Text style={styles.sourceButtonText}>Camera</Text>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity 
// //                   style={styles.sourceButton}
// //                   onPress={pickImage}
// //                 >
// //                   <Ionicons name="images-outline" size={24} color="#714463" />
// //                   <Text style={styles.sourceButtonText}>Gallery</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         )}
        
// //         {/* Step 1: Image Selection */}
// //         {currentStep === 1 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>
// //               {isUpdating ? 'Update Your Face Photo' : 'Step 1: Take a Photo'}
// //             </Text>
// //             <Text style={styles.stepDescription}>
// //               Please take or select a clear photo of your face
// //             </Text>
            
// //             <TouchableOpacity 
// //               style={styles.selectImageButton}
// //               onPress={() => setShowImagePicker(true)}
// //             >
// //               <Ionicons name="camera" size={40} color="#714463" />
// //               <Text style={styles.selectImageText}>Select Image</Text>
// //             </TouchableOpacity>
            
// //             {isUpdating && (
// //               <TouchableOpacity 
// //                 style={styles.skipButton}
// //                 onPress={() => setCurrentStep(4)}
// //               >
// //                 <Text style={styles.skipButtonText}>Skip to Details</Text>
// //               </TouchableOpacity>
// //             )}
// //           </View>
// //         )}
        
// //         {/* Step 2: Face Analysis */}
// //         {currentStep === 2 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>Step 2: Analyze Face</Text>
// //             <Text style={styles.stepDescription}>
// //               Let's analyze your facial features to provide better recommendations
// //             </Text>
            
// //             <View style={styles.imagePreviewContainer}>
// //               {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //             </View>
            
// //             <TouchableOpacity 
// //               style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
// //               onPress={analyzeFace}
// //               disabled={analyzing}
// //             >
// //               {analyzing ? (
// //                 <Text style={styles.analyzeButtonText}>Analyzing...</Text>
// //               ) : (
// //                 <>
// //                   <Ionicons name="scan" size={24} color="#fff" />
// //                   <Text style={styles.analyzeButtonText}>Analyze Face</Text>
// //                 </>
// //               )}
// //             </TouchableOpacity>
            
// //             {/* In Step 2 section, after the Change Photo button */}
// //             <TouchableOpacity 
// //               style={styles.backButton}
// //               onPress={() => setCurrentStep(1)}
// //             >
// //               <Text style={styles.backButtonText}>Change Photo</Text>
// //             </TouchableOpacity>
            
// //             {analysisError && (
// //               <Text style={styles.errorMessageText}>Please try again</Text>
// //             )}
// //           </View>
// //         )}
        
// //         {/* Step 3: Review Analysis */}
// //         {currentStep === 3 && (
// //           <View style={styles.stepContainer}>
// //             <Text style={styles.stepTitle}>Step 3: Review Analysis</Text>
// //             <Text style={styles.stepDescription}>
// //               Review the analysis of your facial features
// //             </Text>
            
// //             <View style={styles.imagePreviewContainer}>
// //               {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
// //             </View>
            
// //             <View style={styles.analysisResultContainer}>
// //               <Text style={styles.analysisTitle}>Face Analysis Results:</Text>
// //               <Text style={styles.analysisText}>{faceAnalysisResult}</Text>
// //             </View>
            
// //             <View style={styles.reviewButtonsContainer}>
// //               <TouchableOpacity 
// //                 style={styles.reanalyzeButton}
// //                 onPress={() => setCurrentStep(2)}
// //               >
// //                 <AntDesign name="reload1" size={20} color="#714463" />
// //                 <Text style={styles.reanalyzeButtonText}>Re-analyze</Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity 
// //                 style={styles.proceedButton}
// //                 onPress={() => setCurrentStep(4)}
// //               >
// //                 <AntDesign name="arrowright" size={20} color="#fff" />
// //                 <Text style={styles.proceedButtonText}>Continue</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
        
// //                 {/* Step 4: Additional Details */}
// //         {currentStep === 4 && (
// //           <ScrollView style={styles.formScrollContainer}>
// //             <View style={{marginTop: 20}}>
// //               <Text style={styles.stepTitle}>
// //                 {isUpdating ? 'Update Your Details' : 'Step 4: Additional Details'}
// //               </Text>
// //               <Text style={styles.stepDescription}>
// //                 Please provide some additional information about yourself
// //               </Text>
// //             </View>
            
// //             <View style={styles.formSection}>
// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Age *</Text>
// //                 <TextInput
// //                   style={[styles.input, validationErrors.age ? styles.inputError : null]}
// //                   value={age}
// //                   onChangeText={setAge}
// //                   placeholder="Enter your age"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //                 {validationErrors.age && <Text style={styles.errorText}>{validationErrors.age}</Text>}
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Height (cm) *</Text>
// //                 <TextInput
// //                   style={[styles.input, validationErrors.height ? styles.inputError : null]}
// //                   value={height}
// //                   onChangeText={setHeight}
// //                   placeholder="Enter your height in cm"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //                 {validationErrors.height && <Text style={styles.errorText}>{validationErrors.height}</Text>}
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Weight (kg) *</Text>
// //                 <TextInput
// //                   style={[styles.input, validationErrors.weight ? styles.inputError : null]}
// //                   value={weight}
// //                   onChangeText={setWeight}
// //                   placeholder="Enter your weight in kg"
// //                   keyboardType="number-pad"
// //                   maxLength={3}
// //                 />
// //                 {validationErrors.weight && <Text style={styles.errorText}>{validationErrors.weight}</Text>}
// //               </View>

// //               <View style={[styles.inputGroup, styles.halfInput]}>
// //                 <Text style={styles.label}>Fat Percentage *<Text style={styles.requiredStar}></Text></Text>
// //                 <View style={styles.inputWithUnit}>
// //                   <TextInput
// //                     style={styles.inputUnit}
// //                     value={fatPercentage.toString()}
// //                     onChangeText={(text) => {
// //                       const value = Number(text);
// //                       if (value <= 50) {
// //                         setFatPercentage(value);
// //                       }
// //                     }}
// //                     keyboardType="number-pad"
// //                     maxLength={2}
// //                   />
// //                   <Text style={styles.unitText}>%</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Body Type *</Text>
// //                 <View style={[styles.pickerContainer, validationErrors.bodyType ? styles.inputError : null]}>
// //                   <Picker
// //                     selectedValue={bodyType}
// //                     onValueChange={setBodyType}
// //                     style={styles.picker}
// //                   >
// //                     <Picker.Item label="Select body type" value="" />
// //                     <Picker.Item label="Ectomorph (Slim)" value="ectomorph" />
// //                     <Picker.Item label="Mesomorph (Athletic)" value="mesomorph" />
// //                     <Picker.Item label="Endomorph (Rounded)" value="endomorph" />
// //                   </Picker>
// //                 </View>
// //                 {validationErrors.bodyType && <Text style={styles.errorText}>{validationErrors.bodyType}</Text>}
// //               </View>

// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Gender *</Text>
// //                 <View style={[styles.pickerContainer, validationErrors.gender ? styles.inputError : null]}>
// //                   <Picker
// //                     selectedValue={gender}
// //                     onValueChange={setGender}
// //                     style={styles.picker}
// //                   >
// //                     <Picker.Item label="Select gender" value="" />
// //                     <Picker.Item label="Male" value="male" />
// //                     <Picker.Item label="Female" value="female" />
// //                     <Picker.Item label="Non-binary" value="non-binary" />
// //                     <Picker.Item label="Prefer not to say" value="not-specified" />
// //                   </Picker>
// //                 </View>
// //                 {validationErrors.gender && <Text style={styles.errorText}>{validationErrors.gender}</Text>}
// //               </View>

// //               <View style={styles.finalButtonsContainer}>
// //                 {currentStep > 1 && (
// //                   <TouchableOpacity 
// //                     style={styles.backToAnalysisButton}
// //                     onPress={() => setCurrentStep(isUpdating && faceAnalysisResult ? 1 : 3)}
// //                   >
// //                     <Text style={styles.backToAnalysisText}>Back</Text>
// //                   </TouchableOpacity>
// //                 )}
                
// //                 <TouchableOpacity 
// //                   style={[styles.submitButton, {backgroundColor: '#714463'}]}
// //                   onPress={saveData}
// //                 >
// //                   <View style={styles.gradient}>
// //                     <Text style={styles.submitButtonText}>
// //                       {isUpdating ? 'Update Profile' : 'Save Profile'}
// //                     </Text>
// //                   </View>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </ScrollView>
// //         )}
        
// //         {/* Progress indicator */}
// //         <View style={styles.progressContainer}>
// //           {[1, 2, 3, 4].map(step => (
// //             <View 
// //               key={step}
// //               style={[
// //                 styles.progressDot,
// //                 currentStep === step ? styles.progressDotActive : null
// //               ]}
// //             />
// //           ))}
// //         </View>
// //         {/* Full-screen analyzing overlay */}
// //         {analyzing && (
// //         <View style={styles.loadingOverlay}>
// //             <LoadingAnimation />
// //         </View>
// //         )}
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f4e9de',
// //   },
// //   fullScreenLoadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f4e9de',
// //   },
// //   halfInput: {
// //     width: '48%',
// //   },
// //   requiredStar: {
// //     color: '#ff3b30',
// //     fontWeight: 'bold',
// //   },
// //   errorMessageText: {
// //     color: '#ff0000',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginTop: 10,
// //     textAlign: 'center',
// //   },
// //   inputWithUnit: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputUnit: {
// //     flex: 1,
// //     padding: 12,
// //     fontSize: 16,
// //     borderTopRightRadius: 0,
// //     borderBottomRightRadius: 0,
// //   },
// //   unitText: {
// //     paddingHorizontal: 12,
// //     fontSize: 16,
// //     color: '#666',
// //     backgroundColor: '#f5f5f5',
// //     height: '100%',
// //     textAlignVertical: 'center',
// //     borderLeftWidth: 1,
// //     borderLeftColor: '#ddd',
// //     paddingVertical: 12,
// //   },
// //   loadingOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000
// //   },
// //   loadingContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   loadingText: {
// //     marginTop: 20,
// //     fontSize: 18,
// //     color: '#714463',
// //     textAlign: 'center',
// //   },
// //   stepContainer: {
// //     flex: 1,
// //     padding: 20,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   stepTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginTop: 20,
// //     textAlign: 'center',
// //   },
// //   stepDescription: {
// //     fontSize: 16,
// //     color: '#666',
// //     textAlign: 'center',
// //     marginBottom: 10,
// //   },
// //   selectImageButton: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     backgroundColor: '#e8ccb9',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //   },
// //   selectImageText: {
// //     marginTop: 10,
// //     color: '#714463',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   imagePreviewContainer: {
// //     width: 200,
// //     height: 200,
// //     borderRadius: 100,
// //     overflow: 'hidden',
// //     borderWidth: 3,
// //     borderColor: '#714463',
// //     marginBottom: 20,
// //   },
// //   imagePreview: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   analyzeButton: {
// //     flexDirection: 'row',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 15,
// //   },
// //   analyzeButtonDisabled: {
// //     backgroundColor: '#a58e99',
// //   },
// //   analyzeButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //     marginLeft: 10,
// //   },
// //   backButton: {
// //     padding: 10,
// //   },
// //   backButtonText: {
// //     color: '#714463',
// //     fontSize: 16,
// //   },
// //   analysisResultContainer: {
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     marginBottom: 20,
// //     width: '100%',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   analysisTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 10,
// //   },
// //   analysisText: {
// //     fontSize: 16,
// //     color: '#333',
// //     lineHeight: 24,
// //   },
// //   reviewButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //   },
// //   reanalyzeButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   reanalyzeButtonText: {
// //     color: '#714463',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   proceedButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#714463',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     flex: 1,
// //     marginLeft: 10,
// //   },
// //   proceedButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   formScrollContainer: {
// //     flex: 1,
// //   },
// //   formSection: {
// //     padding: 20,
// //   },
// //   inputGroup: {
// //     marginBottom: 20,
// //   },
// //   label: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#401730',
// //     marginBottom: 8,
// //   },
// //   input: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 16,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //   },
// //   inputError: {
// //     borderColor: '#ff3b30',
// //     borderWidth: 1,
// //   },
// //   errorText: {
// //     color: '#ff3b30',
// //     fontSize: 14,
// //     marginTop: 5,
// //   },
// //   slider: {
// //     width: '100%',
// //     height: 40,
// //   },
// //   sliderLabels: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 10,
// //   },
// //   pickerContainer: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     overflow: 'hidden',
// //   },
// //   picker: {
// //     height: 50,
// //     width: '100%',
// //   },
// //   finalButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 20,
// //   },
// //   backToAnalysisButton: {
// //     backgroundColor: '#e8ccb9',
// //     paddingVertical: 15,
// //     paddingHorizontal: 20,
// //     borderRadius: 25,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   backToAnalysisText: {
// //     color: '#714463',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   submitButton: {
// //     borderRadius: 25,
// //     overflow: 'hidden',
// //     flex: 2,
// //     marginLeft: 10,
// //   },
// //   gradient: {
// //     paddingVertical: 15,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   submitButtonText: {
// //     color: '#fff',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   progressContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     padding: 10,
// //   },
// //   progressDot: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //     backgroundColor: '#e8ccb9',
// //     marginHorizontal: 5,
// //   },
// //   progressDotActive: {
// //     backgroundColor: '#714463',
// //     width: 12,
// //     height: 12,
// //     borderRadius: 6,
// //   },
// //   imageSourceOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1000,
// //   },
// //   imageSourceContainer: {
// //     backgroundColor: '#f0e6e3',
// //     width: '80%',
// //     borderRadius: 15,
// //     padding: 20,
// //     alignItems: 'center',
// //   },
// //   imageSourceHeader: {
// //     width: '100%',
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     position: 'relative',
// //     marginBottom: 10,
// //   },
// //   closeButton: {
// //     position: 'absolute',
// //     right: -14,
// //     top: -10,
// //   },
// //   imageSourceTitle: {
// //     color: '#714463',
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //   },
// //   imageSourceSubtitle: {
// //     color: '#714463',
// //     fontSize: 16,
// //     textAlign: 'center',
// //     marginBottom: 20,
// //     opacity: 0.8,
// //   },
// //   imageSourceButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     width: '100%',
// //     paddingHorizontal: 20,
// //   },
// //   sourceButton: {
// //     alignItems: 'center',
// //     padding: 15,
// //     borderRadius: 10,
// //     backgroundColor: 'rgba(113, 68, 99, 0.1)',
// //     width: '45%',
// //   },
// //   sourceButtonText: {
// //     color: '#714463',
// //     marginTop: 5,
// //     fontSize: 16,
// //     fontWeight: '500',
// //   },
// //   skipButton: {
// //     marginTop: 20,
// //     padding: 10,
// //   },
// //   skipButtonText: {
// //     color: '#714463',
// //     fontSize: 16,
// //     textDecorationLine: 'underline',
// //   },
// // });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Modal,
  BackHandler,
  SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import LoadingAnimation from '../components/loading_ani';

const { width, height } = Dimensions.get('window');

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface AppearanceData {
  age: number;
  height: number;
  weight: number;
  fatPercentage: number;
  bodyType: string;
  gender: string;
  faceAnalysis: string | null;
  face: string | null;
  updatedAt: Date;
  createdAt?: Date;
}

interface AppearanceFormProps {
  onComplete: () => void;
  visible: boolean;
}

// Helper function to check if the response indicates an error
const isErrorResponse = (response: string | null): boolean => {
  if (!response) return false;
  
  const normalizedResponse = response.toLowerCase().trim();
  const errorKeywords = [
    "no face detected",
    "not clear enough",
    "please re-try",
    "image isn't clear enough",
    "analysing. please re-try"
  ];
  
  return errorKeywords.some(keyword => normalizedResponse.includes(keyword));
};

export default function AppearanceForm({ onComplete, visible }: AppearanceFormProps) {
  // Form data states
  const [image, setImage] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [fatPercentage, setFatPercentage] = useState(0);
  const [bodyType, setBodyType] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [faceAnalysisResult, setFaceAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Track if we're updating existing data
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  const auth = getAuth();
  const db = getFirestore();

  // Check for existing data when component becomes visible
  useEffect(() => {
    if (visible) {
      checkForExistingData();
    }
  }, [visible]);

  // Function to check if user already has appearance data
  const checkForExistingData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const userId = currentUser.uid;
      const appearanceRef = doc(db, 'users', userId, 'appearance', 'profile');
      const appearanceDoc = await getDoc(appearanceRef);
      
      if (appearanceDoc.exists()) {
        const data = appearanceDoc.data();
        setExistingData(data);
        setIsUpdating(true);
        
        // Pre-fill form with existing data
        setAge(data.age?.toString() || '');
        setHeight(data.height?.toString() || '');
        setWeight(data.weight?.toString() || '');
        setFatPercentage(data.fatPercentage || 0);
        setBodyType(data.bodyType || '');
        setGender(data.gender || '');
        setFaceAnalysisResult(data.faceAnalysis || null);
        
        // If we have face analysis, we can skip to the details step
        if (data.faceAnalysis) {
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('Error checking for existing data:', error);
    }
  };

  // Reset form when visibility changes
  useEffect(() => {
    if (!visible) {
      // Reset form when hidden
      setImage(null);
      setAge('');
      setHeight('');
      setFatPercentage(0);
      setBodyType('');
      setWeight('');
      setGender('');
      setFaceAnalysisResult(null);
      setValidationErrors({});
      setCurrentStep(1);
      setShowImagePicker(false);
      setIsUpdating(false);
      setExistingData(null);
    }
  }, [visible]);

  // Prevent back button from closing the form until completed
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        // Return true to prevent default behavior (app exit)
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible]);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
        }
      }
    })();
  }, []);

  // Image picking functions
  const pickImage = async () => {
    try {
      setShowImagePicker(false);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      setShowImagePicker(false);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeFace = async () => {
    if (!image) {
      setAnalysisError('Please take or select a photo first');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Create FormData to send the image
      const formData = new FormData();
      
      // Get the file name from the URI
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Append the image to FormData with the correct type
      formData.append('image', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`
      } as any);

      // Send the image to the backend
      const apiResponse = await axios.post(`${BACKEND_URL}/api/analyze-face`, formData, {
        timeout: 30000,
        headers: {
          Accept: 'application/json',
        },
      });

      // Process the response
      if (apiResponse.status === 200) {
        // Debug logs to understand the response structure
        console.log('API Response:', apiResponse.data);
        console.log('API Response Type:', typeof apiResponse.data);
        
        // Extract the result properly - handle both string and object responses
        const result = typeof apiResponse.data === 'string' 
          ? apiResponse.data 
          : apiResponse.data.message || apiResponse.data.result || JSON.stringify(apiResponse.data);
        
        setFaceAnalysisResult(result);
        setCurrentStep(3);
      } else {
        throw new Error('Failed to analyze face');
      }
    } catch (error) {
      console.error('Error analyzing face:', error);
      setAnalysisError('Analysis Failed. Please Try Again');
    } finally {
      setAnalyzing(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!age) {
        errors.age = 'Please enter your age';
        isValid = false;
    }
    if (!height) {
        errors.height = 'Please enter your height in cm';
        isValid = false;
    }
    if (!weight) {
        errors.weight = 'Please enter your weight in kg';
        isValid = false;
    }
    if (!bodyType || bodyType === 'Select body type') {
        errors.bodyType = 'Please select your body type';
        isValid = false;
    }
    if (!gender || gender === 'Select gender') {
        errors.gender = 'Please select your gender';
        isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const saveData = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const userId = currentUser.uid;
      
      // Data to save/update with proper typing
      const appearanceData: AppearanceData = {
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
        fatPercentage,
        bodyType,
        gender,
        faceAnalysis: faceAnalysisResult,
        face: faceAnalysisResult,
        updatedAt: new Date(),
      };
      
      // If this is a new record, add createdAt
      if (!isUpdating) {
        appearanceData.createdAt = new Date();
      }
    
      await setDoc(doc(db, 'users', userId, 'appearance', 'profile'), 
        appearanceData, 
        { merge: true }
      );
      
      // Call the onComplete callback to inform parent component
      onComplete();
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save your profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  if (loading) {
    return (
      <Modal visible={visible} transparent={false} animationType="fade">
        <View style={styles.fullScreenLoadingContainer}>
          <LoadingAnimation />
          <Text style={styles.loadingText}>
            {isUpdating ? 'Updating your profile...' : 'Saving your profile...'}
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        return true;
      }}
    >
      <SafeAreaView style={styles.container}>
        {/* Image Source Modal */}
        {showImagePicker && (
          <View style={styles.imageSourceOverlay}>
            <View style={styles.imageSourceContainer}>
              <View style={styles.imageSourceHeader}>
                <Text style={styles.imageSourceTitle}>Choose Image Source</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowImagePicker(false)}
                >
                  <AntDesign name="close" size={24} color="#714463" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.imageSourceSubtitle}>
                Please take or select a photo of your face to continue
              </Text>

              <View style={styles.imageSourceButtons}>
                <TouchableOpacity 
                  style={styles.sourceButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={24} color="#714463" />
                  <Text style={styles.sourceButtonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sourceButton}
                  onPress={pickImage}
                >
                  <Ionicons name="images-outline" size={24} color="#714463" />
                  <Text style={styles.sourceButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Step 1: Image Selection */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {isUpdating ? 'Update Your Face Photo' : 'Step 1: Take a Photo'}
            </Text>
            <Text style={styles.stepDescription}>
              Please take or select a clear photo of your face
            </Text>
            
            <TouchableOpacity 
              style={styles.selectImageButton}
              onPress={() => setShowImagePicker(true)}
            >
              <Ionicons name="camera" size={40} color="#714463" />
              <Text style={styles.selectImageText}>Select Image</Text>
            </TouchableOpacity>
            
            {isUpdating && (
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => setCurrentStep(4)}
              >
                <Text style={styles.skipButtonText}>Skip to Details</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Step 2: Face Analysis */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Analyze Face</Text>
            <Text style={styles.stepDescription}>
              Lets analyze your facial features to provide better recommendations
            </Text>
            
            <View style={styles.imagePreviewContainer}>
              {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            </View>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
              onPress={analyzeFace}
              disabled={analyzing}
            >
              {analyzing ? (
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              ) : (
                <>
                  <Ionicons name="scan" size={24} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyze Face</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.backButtonText}>Change Photo</Text>
            </TouchableOpacity>
            
            {analysisError && (
              <Text style={styles.errorMessageText}>Please try again</Text>
            )}
          </View>
        )}
        
        {/* Step 3: Review Analysis */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Review Analysis</Text>
            <Text style={styles.stepDescription}>
              Review the analysis of your facial features
            </Text>
            
            <View style={styles.imagePreviewContainer}>
              {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            </View>
            
            <View style={styles.analysisResultContainer}>
              <Text style={styles.analysisTitle}>Face Analysis Results:</Text>
              <Text style={styles.analysisText}>{faceAnalysisResult}</Text>
            </View>
            
            <View style={styles.reviewButtonsContainer}>
              <TouchableOpacity 
                style={styles.reanalyzeButton}
                onPress={() => setCurrentStep(2)}
              >
                <AntDesign name="reload1" size={20} color="#714463" />
                <Text style={styles.reanalyzeButtonText}>Re-analyze</Text>
              </TouchableOpacity>
              
              {/* Conditionally render Continue button based on face analysis result */}
              {!isErrorResponse(faceAnalysisResult) && (
                <TouchableOpacity 
                  style={styles.proceedButton}
                  onPress={() => setCurrentStep(4)}
                >
                  <AntDesign name="arrowright" size={20} color="#fff" />
                  <Text style={styles.proceedButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {/* Step 4: Additional Details */}
        {currentStep === 4 && (
          <ScrollView style={styles.formScrollContainer}>
            <View style={{marginTop: 20}}>
              <Text style={styles.stepTitle}>
                {isUpdating ? 'Update Your Details' : 'Step 4: Additional Details'}
              </Text>
              <Text style={styles.stepDescription}>
                Please provide some additional information about yourself
              </Text>
            </View>
            
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={[styles.input, validationErrors.age ? styles.inputError : null]}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Enter your age"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {validationErrors.age && <Text style={styles.errorText}>{validationErrors.age}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm) *</Text>
                <TextInput
                  style={[styles.input, validationErrors.height ? styles.inputError : null]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Enter your height in cm"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {validationErrors.height && <Text style={styles.errorText}>{validationErrors.height}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg) *</Text>
                <TextInput
                  style={[styles.input, validationErrors.weight ? styles.inputError : null]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter your weight in kg"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {validationErrors.weight && <Text style={styles.errorText}>{validationErrors.weight}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.label}>Fat Percentage *<Text style={styles.requiredStar}></Text></Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={styles.inputUnit}
                    value={fatPercentage.toString()}
                    onChangeText={(text) => {
                      const value = Number(text);
                      if (value <= 50) {
                        setFatPercentage(value);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.unitText}>%</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Body Type *</Text>
                <View style={[styles.pickerContainer, validationErrors.bodyType ? styles.inputError : null]}>
                  <Picker
                    selectedValue={bodyType}
                    onValueChange={setBodyType}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select body type" value="" />
                    <Picker.Item label="Ectomorph (Slim)" value="ectomorph" />
                    <Picker.Item label="Mesomorph (Athletic)" value="mesomorph" />
                    <Picker.Item label="Endomorph (Rounded)" value="endomorph" />
                  </Picker>
                </View>
                {validationErrors.bodyType && <Text style={styles.errorText}>{validationErrors.bodyType}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender *</Text>
                <View style={[styles.pickerContainer, validationErrors.gender ? styles.inputError : null]}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={setGender}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Non-binary" value="non-binary" />
                    <Picker.Item label="Prefer not to say" value="not-specified" />
                  </Picker>
                </View>
                {validationErrors.gender && <Text style={styles.errorText}>{validationErrors.gender}</Text>}
              </View>

              <View style={styles.finalButtonsContainer}>
                {currentStep > 1 && (
                  <TouchableOpacity 
                    style={styles.backToAnalysisButton}
                    onPress={() => setCurrentStep(isUpdating && faceAnalysisResult ? 1 : 3)}
                  >
                    <Text style={styles.backToAnalysisText}>Back</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.submitButton, {backgroundColor: '#714463'}]}
                  onPress={saveData}
                >
                  <View style={styles.gradient}>
                    <Text style={styles.submitButtonText}>
                      {isUpdating ? 'Update Profile' : 'Save Profile'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map(step => (
            <View 
              key={step}
              style={[
                styles.progressDot,
                currentStep === step ? styles.progressDotActive : null
              ]}
            />
          ))}
        </View>
        {/* Full-screen analyzing overlay */}
        {analyzing && (
        <View style={styles.loadingOverlay}>
            <LoadingAnimation />
        </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e9de',
  },
  fullScreenLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4e9de',
  },
  halfInput: {
    width: '48%',
  },
  requiredStar: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  errorMessageText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputUnit: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  unitText: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f5f5f5',
    height: '100%',
    textAlignVertical: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingVertical: 12,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#714463',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#401730',
    marginTop: 20,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectImageButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e8ccb9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#714463',
  },
  selectImageText: {
    marginTop: 10,
    color: '#714463',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#714463',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#a58e99',
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#714463',
    fontSize: 16,
  },
  analysisResultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
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
  reviewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  reanalyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8ccb9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  reanalyzeButtonText: {
    color: '#714463',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#714463',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
  },
  proceedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formScrollContainer: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#401730',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  finalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backToAnalysisButton: {
    backgroundColor: '#e8ccb9',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  backToAnalysisText: {
    color: '#714463',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    flex: 2,
    marginLeft: 10,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e8ccb9',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#714463',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  imageSourceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  imageSourceContainer: {
    backgroundColor: '#f0e6e3',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  imageSourceHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    right: -14,
    top: -10,
  },
  imageSourceTitle: {
    color: '#714463',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
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
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipButtonText: {
    color: '#714463',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
