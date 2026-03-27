import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import LoadingAnimation from './loading_ani';

export type ClothType = 'Select Type' | 'Top' | 'Bottom' | 'Footwear' | 'Outerwear' | 'Accessories';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL; // Replace with your actual backend URL
const UPLOAD_PRESET = 'costume'; // Replace with your Cloudinary upload preset
const CLOUD_NAME = 'dudzs3nys';

interface AnalysisResult {
  name: string;
  type: ClothType;
  imageUri: string;
  cloudinaryUrl: string;
  description: string;
  class: string;
}

interface SimpleClothPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnalysisResult) => void;
  isSaving: boolean;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
}

const SimpleClothPopup: React.FC<SimpleClothPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  cloudinaryCloudName,
  cloudinaryUploadPreset
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clothName, setClothName] = useState('');
  const [clothType, setClothType] = useState<ClothType>('Select Type');
  const [validationError, setValidationError] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pendingAnalysisData, setPendingAnalysisData] = useState<{
    name: string;
    type: ClothType;
    imageUri: string;
  } | null>(null);
  const contentHeight = new Animated.Value(1);

  // Helper function to clean description from ** formatting
  const cleanDescription = useCallback((description: string): string => {
    // Remove ** markdown formatting
    return description.replace(/\*\*/g, '');
  }, []);

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

  // Get optimized image URL
  const getOptimizedImageUrl = useCallback((cloudinaryData: any) => {
    if (cloudinaryData.secure_url) {
      return cloudinaryData.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
    }
    return cloudinaryData.secure_url;
  }, []);

  // Handle clothing analysis and upload
  const handleAddClothing = useCallback(async (data: {
    name: string;
    type: ClothType;
    imageUri: string;
  }) => {
    setShowLoading(true);
    setIsAnalyzing(true);
    setPendingAnalysisData(data);

    try {
      // First, analyze the image with backend
      const analyzeFormData = new FormData();
      analyzeFormData.append('images', {
        uri: data.imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg'
      } as any);

      let generatedDescription = "";
      let generatedLabels = "";
      let analysisSuccessful = false;

      // Send to backend for analysis
      try {
        const analyzeResponse = await axios.post(
          `${BACKEND_URL}/api/analyze-clothing`,
          analyzeFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 seconds timeout
          }
        );

        if (analyzeResponse.status === 200) {
          const analyzeData = analyzeResponse.data;
          if (analyzeData.descriptions && analyzeData.descriptions.length > 0) {
            // Clean the description by removing ** formatting
            generatedDescription = cleanDescription(analyzeData.descriptions[0]);
            analysisSuccessful = true;
          }
          if (analyzeData.labels && analyzeData.labels.length > 0) {
            generatedLabels = analyzeData.labels[0];
          }
        }
      } catch (analysisError) {
        console.error('Analysis failed:', analysisError);
        setIsAnalyzing(false);
        setShowLoading(false);
        
        let errorMsg = 'Failed to analyze the clothing item. Please try again.';
        if (axios.isAxiosError(analysisError)) {
          if (analysisError.code === 'ECONNABORTED') {
            errorMsg = 'Analysis timed out. Please check your connection and try again.';
          } else if (analysisError.response?.status === 500) {
            errorMsg = 'Server error occurred during analysis. Please try again.';
          } else if (!analysisError.response) {
            errorMsg = 'Network error. Please check your internet connection and try again.';
          }
        }
        
        setErrorMessage(errorMsg);
        setShowError(true);
        return;
      }

      // Check if analysis was successful
      if (!analysisSuccessful || !generatedDescription.trim()) {
        setIsAnalyzing(false);
        setShowLoading(false);
        setErrorMessage('Analysis completed but no description was generated. Please try again with a clearer image.');
        setShowError(true);
        return;
      }

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', {
        uri: data.imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg'
      } as any);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);
      cloudinaryFormData.append('cloud_name', CLOUD_NAME);

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryFormData
      });

      const cloudinaryData = await response.json();
      
      if (!cloudinaryData.secure_url) {
        setIsAnalyzing(false);
        setShowLoading(false);
        setErrorMessage('Failed to upload image. Please try again.');
        setShowError(true);
        return;
      }

      const optimizedImageUrl = getOptimizedImageUrl(cloudinaryData);

      // Set analysis result and show results form
      const result: AnalysisResult = {
        name: data.name,
        type: data.type,
        imageUri: data.imageUri,
        cloudinaryUrl: optimizedImageUrl,
        description: generatedDescription, // Already cleaned
        class: generatedLabels
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
      setShowLoading(false);
      setShowResults(true);
      setPendingAnalysisData(null);

    } catch (error) {
      console.error('Error processing clothing:', error);
      setIsAnalyzing(false);
      setShowLoading(false);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowError(true);
    }
  }, [cloudinaryUploadPreset, getOptimizedImageUrl, cleanDescription]);

  const handleRetryAnalysis = () => {
    setShowError(false);
    if (pendingAnalysisData) {
      handleAddClothing(pendingAnalysisData);
    }
  };

  const LoadingModal = () => (
<Modal
    visible={showLoading}
    transparent={true}
    animationType="fade"
>
    <View style={styles.loadingOverlay}>
    <View style={styles.loadingContainer}>
        <LoadingAnimation />
        <Text style={styles.loadingText}>Analyzing your clothing...</Text>
    </View>
    </View>
</Modal>
  );

const ErrorModal = () => (
<Modal
    visible={showError}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowError(false)}
>
    <View style={styles.errorOverlay}>
    <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
        </View>
        
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        
        <View style={styles.errorButtonContainer}>
        <TouchableOpacity
            style={[styles.button, styles.errorCancelButton]}
            onPress={() => {
            setShowError(false);
            setPendingAnalysisData(null);
            }}
        >
            <Text style={[styles.buttonText, { color: '#666' }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
            style={[styles.button, styles.errorRetryButton]}
            onPress={handleRetryAnalysis}
        >
            <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        </View>
    </View>
    </View>
</Modal>
);

const ResultsModal = () => {
const [editableDescription, setEditableDescription] = useState(
    analysisResult?.description ? cleanDescription(analysisResult.description) : ''
);

const handleDescriptionChange = (text: string) => {
    // Clean any ** formatting that might be pasted
    setEditableDescription(cleanDescription(text));
};

const handleProceed = () => {
    if (analysisResult) {
    const finalResult: AnalysisResult = {
        ...analysisResult,
        name: analysisResult.name,
        type: analysisResult.type,
        description: editableDescription
    };
    
    // Call onSubmit without showing success popup
    onSubmit(finalResult);
    handleCancel(); // This will close all modals and reset state
    }
};

const handleEdit = () => {
    setShowResults(false);
};

return (
    <Modal
    visible={showResults}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowResults(false)}
    >
    <View style={styles.modalContainer}>
        <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
        <View style={styles.resultsModalContent}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            
            <ScrollView 
            contentContainerStyle={styles.resultsScrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
            {analysisResult?.cloudinaryUrl && (
                <Image
                source={{ uri: analysisResult.cloudinaryUrl }}
                style={styles.resultImage}
                resizeMode="contain"
                />
            )}

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
                style={[styles.resultInput, styles.expandedDescriptionInput]}
                value={editableDescription}
                onChangeText={handleDescriptionChange}
                placeholder="=description will appear here..."
                multiline
                textAlignVertical="top"
                scrollEnabled={true}
            />

            <View style={styles.resultsButtonContainer}>
                <TouchableOpacity
                style={[styles.button, styles.proceedButton]}
                onPress={handleProceed}
                >
                <Text style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </View>
        </KeyboardAvoidingView>
    </View>
    </Modal>
);
};

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
      setShowPermissionModal(true);
      return;
    }
  
    setShowImagePicker(true);
  };

const handleCancel = () => {
setSelectedImage(null);
setClothName('');
setClothType('Select Type');
setValidationError('');
setIsAnalyzing(false);
setShowLoading(false);
setShowResults(false);
setShowError(false);
setShowPermissionModal(false); // Add this line
setAnalysisResult(null);
setPendingAnalysisData(null);
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
  
  await handleAddClothing({
    name: clothName.trim(),
    type: clothType,
    imageUri: selectedImage
  });
};

const PermissionModal = () => (
    <Modal
      transparent
      visible={showPermissionModal}
      animationType="fade"
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 30,
          width: '90%',
          maxWidth: 400,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <View style={{
            marginBottom: 20,
          }}>
            <Ionicons name="camera-outline" size={60} color="#714463" />
          </View>
          
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#281b52',
            textAlign: 'center',
            marginBottom: 15,
          }}>
            Permission Required
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 30,
          }}>
            To add outfits to your wardrobe, we need access to your camera and photos.
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <TouchableOpacity
              style={{
                flex: 0.45,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
              }}
              onPress={() => setShowPermissionModal(false)}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#666',
              }}>
                Not Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 0.45,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: '#714463',
              }}
              onPress={() => {
                setShowPermissionModal(false);
                Platform.OS === 'ios' 
                  ? Linking.openURL('app-settings:') 
                  : Linking.openSettings();
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#fff',
              }}>
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
);
  

return (
  <>
    <Modal
      visible={isOpen && !showLoading && !showResults && !showError}
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

            <Text style={styles.title}>Compare with</Text>

            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={pickImage}
                disabled={isAnalyzing}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#999" />
                    <Text style={styles.uploadText}>Tap to upload image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Enter outfit name"
                value={clothName}
                onChangeText={setClothName}
                editable={!isAnalyzing}
              />

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={clothType}
                  onValueChange={(value) => setClothType(value as ClothType)}
                  style={styles.picker}
                  enabled={!isAnalyzing}
                >
                  <Picker.Item label="Select Type" value="Select Type" />
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
                  disabled={isAnalyzing}
                >
                  <Text style={[styles.buttonText, { color: '#000' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSubmit}
                  disabled={isSaving || isAnalyzing}
                >
                  {isSaving || isAnalyzing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Compare</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

    <LoadingModal />
    <ErrorModal />
    <ResultsModal />
    <ImageSourceModal />
    <PermissionModal />
  </>
);
};

const styles = StyleSheet.create({
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
keyboardAvoidingView: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
},
modalContent: {
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 20,
  width: '90%',
  maxHeight: '90%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
closeButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
  padding: 5,
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#281b52',
  textAlign: 'center',
  marginBottom: 20,
  marginTop: 10,
},
scrollContainer: {
  flexGrow: 1,
},
imageUpload: {
  width: '100%',
  height: 200,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#ddd',
  borderStyle: 'dashed',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
  backgroundColor: '#f9f9f9',
  position: 'relative',
},
uploadPlaceholder: {
  alignItems: 'center',
  justifyContent: 'center',
},
uploadText: {
  marginTop: 10,
  fontSize: 16,
  color: '#999',
  textAlign: 'center',
},
previewImage: {
  width: '100%',
  height: '100%',
  borderRadius: 10,
},
input: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  marginBottom: 20,
  backgroundColor: '#fff',
},
pickerWrapper: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  marginBottom: 20,
  backgroundColor: '#fff',
  overflow: 'hidden',
},
picker: {
  height: 50,
  width: '100%',
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},
button: {
  flex: 0.45,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: '#f0f0f0',
},
saveButton: {
  backgroundColor: '#714463',
},
buttonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#fff',
},
errorText: {
  color: '#ff4444',
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 15,
  backgroundColor: '#ffe5e5',
  padding: 10,
  borderRadius: 8,
},
// Loading Modal Styles (removed white background)
loadingOverlay: {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},
loadingContainer: {
  alignItems: 'center',
  padding: 20,
},
loadingText: {
  marginTop: 20,
  fontSize: 18,
  color: '#714463',
  fontWeight: '600',
  textAlign: 'center',
},
// Error Modal Styles
errorOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
errorContainer: {
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 30,
  width: '90%',
  maxWidth: 400,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
errorIconContainer: {
  marginBottom: 20,
},
errorTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#ff4444',
  textAlign: 'center',
  marginBottom: 15,
},
errorMessage: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 30,
},
errorButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
errorCancelButton: {
  backgroundColor: '#f0f0f0',
},
errorRetryButton: {
  backgroundColor: '#714463',
},
// Results Modal Styles
resultsModalContent: {
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 20,
  width: '90%',
  maxHeight: '90%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
resultsTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#281b52',
  textAlign: 'center',
  marginBottom: 20,
},
resultsScrollContainer: {
  flexGrow: 1,
},
resultImage: {
  width: '100%',
  height: 200,
  borderRadius: 12,
  marginBottom: 20,
},
fieldLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#281b52',
  marginBottom: 8,
  marginTop: 10,
},
resultInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  marginBottom: 15,
  backgroundColor: '#fff',
},
expandedDescriptionInput: {
  minHeight: 200,
  maxHeight: 300,
  textAlignVertical: 'top',
  fontSize: 15,
  lineHeight: 22,
  paddingTop: 15,
  paddingBottom: 15,
},
classificationText: {
  fontSize: 16,
  color: '#666',
  backgroundColor: '#f5f5f5',
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
},
resultsButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 20,
},
editButton: {
  backgroundColor: '#f0f0f0',
  borderWidth: 1,
  borderColor: '#714463',
},
proceedButton: {
  backgroundColor: '#714463',
},
// Image source modal styles
imageSourceOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
imageSourceContainer: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  width: '90%',
  maxWidth: 400,
  alignItems: 'center',
  position: 'relative',
},
imageSourceTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#281b52',
  marginBottom: 10,
  textAlign: 'center',
},
imageSourceSubtitle: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 22,
},
imageSourceButtons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
},
sourceButton: {
  backgroundColor: '#f5f5f5',
  paddingVertical: 20,
  paddingHorizontal: 30,
  borderRadius: 12,
  alignItems: 'center',
  minWidth: 120,
  borderWidth: 1,
  borderColor: '#ddd',
},
sourceButtonText: {
  marginTop: 8,
  fontSize: 16,
  color: '#714463',
  fontWeight: '600',
},
});

export default SimpleClothPopup;
