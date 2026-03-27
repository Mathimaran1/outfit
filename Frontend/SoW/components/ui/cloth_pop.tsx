// import { Modal, View, Text, TouchableOpacity, Image, TextInput, StyleSheet, ViewStyle, KeyboardAvoidingView, ScrollView, Platform, Animated, Keyboard, Alert, Linking, ActivityIndicator  } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { useState, useEffect } from 'react';
// import * as ImagePicker from 'expo-image-picker';
// import { ClothType } from '../../app/(tabs)/explore';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// type ClothingItem = {
//   id: string;
//   name: string;
//   imageUrl: string;
//   brand: string;
//   size: string;
//   type: ClothType;
// }

// interface ClothPopProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: {
//     name: string;
//     type: ClothType;
//     image: File | FormData;
//     brand: string;
//     size: string;
//     description?: string;
//   }) => void;
//   initialValues?: {
//     name: string;
//     type: ClothType;
//     brand: string;
//     size: string;
//     image: string;
//     description?: string;
//   };
//   modalStyle?: ViewStyle;
//   isSaving: boolean;
// }

// export default function ClothPopup({ isOpen, onClose, onSubmit, initialValues, isSaving, modalStyle }: ClothPopProps)   {
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [clothName, setClothName] = useState('');
//   const [clothType, setClothType] = useState<ClothType>('Select Type');
//   const [clothBrand, setClothBrand] = useState('');
//   const [clothSize, setClothSize] = useState('');
//   const [validationError, setValidationError] = useState('');
//   const [showImagePicker, setShowImagePicker] = useState(false);
//   const contentHeight = new Animated.Value(1);

//   useEffect(() => {
//   if (initialValues) {
//     setClothName(initialValues.name);
//     setClothType(initialValues.type);
//     setClothBrand(initialValues.brand);
//     setClothSize(initialValues.size);
//     setSelectedImage(initialValues.image);
//   }
// }, [initialValues]);

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
//     setClothBrand('');
//     setClothSize('');
//     setValidationError('');
//     onClose();
//   };

//   const handleSubmit = async () => {
//     if (!selectedImage || !clothName.trim() || !clothBrand.trim() || !clothSize.trim() || clothType === 'Select Type') {
//       const missingFields = [
//         !selectedImage && 'Image',
//         !clothName.trim() && 'Name',
//         !clothBrand.trim() && 'Brand',
//         !clothSize.trim() && 'Size',
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
//           image: file,
//           brand: clothBrand.trim(),
//           size: clothSize.trim()
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
//           image: formData,
//           brand: clothBrand.trim(),
//           size: clothSize.trim()
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
//         {isSaving && (
//           <View style={styles.loadingOverlay}>
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#714463" />
//               <Text style={styles.loadingText}>Analyzing your clothing...</Text>
//             </View>
//           </View>
//         )}
        
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.keyboardAvoidingView}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
//         >
//           <Animated.View style={[styles.modalContent, { maxHeight: contentHeight.interpolate({
//             inputRange: [0.7, 1],
//             outputRange: ['70%', '90%']
//           })}]}>
//             <Text style={styles.title}>Add New Outfit</Text>
            
//             {validationError ? (
//               <Text style={styles.errorText}>{validationError}</Text>
//             ) : null}

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
//                   <View style={styles.uploadPlaceholder}>
//                     <Ionicons name="camera-outline" size={40} color="#999" />
//                     <Text style={styles.uploadText}>Tap to upload image</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter outfit name"
//                 value={clothName}
//                 onChangeText={setClothName}
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter brand name"
//                 value={clothBrand}
//                 onChangeText={setClothBrand}
//               />

//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter size"
//                 value={clothSize}
//                 onChangeText={setClothSize}
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
//                   style={[styles.button, styles.saveButton]}
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

// const styles = StyleSheet.create({
//     loadingOverlay: {
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
//   uploadPlaceholder: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   uploadText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#999',
//     textAlign: 'center',
//   },
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     width: '80%',
//     maxWidth: 300,
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#714463',
//     textAlign: 'center',
//   },
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
//     width: '100%',
//     maxWidth: 400,
//     maxHeight: '90%',
//     alignSelf: 'center',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
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
// });

import { Modal, View, Text, TouchableOpacity, Image, TextInput, StyleSheet, ViewStyle, KeyboardAvoidingView, ScrollView, Platform, Animated, Keyboard, Alert, Linking, ActivityIndicator  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ClothType } from '../../app/(tabs)/explore';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type ClothingItem = {
  id: string;
  name: string;
  imageUrl: string;
  brand: string;
  size: string;
  type: ClothType;
}

interface ClothPopProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: ClothType;
    image: File | FormData;
    brand: string;
    size: string;
    description?: string;
  }, action?: 'save' | 'analyze') => void;
  initialValues?: {
    name: string;
    type: ClothType;
    brand: string;
    size: string;
    image: string;
    description?: string;
  };
  modalStyle?: ViewStyle;
  isSaving: boolean;
  isEditing?: boolean;
}

export default function ClothPopup({ isOpen, onClose, onSubmit, initialValues, isSaving, modalStyle, isEditing = false }: ClothPopProps)   {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clothName, setClothName] = useState('');
  const [clothType, setClothType] = useState<ClothType>('Select Type');
  const [clothBrand, setClothBrand] = useState('');
  const [clothSize, setClothSize] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const contentHeight = new Animated.Value(1);

  useEffect(() => {
  if (initialValues) {
    setClothName(initialValues.name);
    setClothType(initialValues.type);
    setClothBrand(initialValues.brand);
    setClothSize(initialValues.size);
    setSelectedImage(initialValues.image);
  }
}, [initialValues]);

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
                } catch (error) {
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
                } catch (error) {
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
    setClothBrand('');
    setClothSize('');
    setValidationError('');
    onClose();
  };

  const handleSubmit = async (action: 'save' | 'analyze' = 'analyze') => {
    // For save action, only validate required fields (not image)
    if (action === 'save') {
      if (!clothName.trim() || !clothBrand.trim() || !clothSize.trim() || clothType === 'Select Type') {
        const missingFields = [
          !clothName.trim() && 'Name',
          !clothBrand.trim() && 'Brand',
          !clothSize.trim() && 'Size',
          clothType === 'Select Type' && 'Type'
        ].filter(Boolean);

        setValidationError(`Please fill in all fields:\n${missingFields.join(', ')}`);
        return;
      }
    } else {
      // For analyze action, validate all fields including image
      if (!selectedImage || !clothName.trim() || !clothBrand.trim() || !clothSize.trim() || clothType === 'Select Type') {
        const missingFields = [
          !selectedImage && 'Image',
          !clothName.trim() && 'Name',
          !clothBrand.trim() && 'Brand',
          !clothSize.trim() && 'Size',
          clothType === 'Select Type' && 'Type'
        ].filter(Boolean);

        setValidationError(`Please fill in all fields to proceed:\n${missingFields.join(', ')}`);
        return;
      }
    }

    setValidationError('');

    try {
      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage!);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        onSubmit({
          name: clothName.trim(),
          type: clothType,
          image: file,
          brand: clothBrand.trim(),
          size: clothSize.trim()
        }, action);
      } else {
        const formData = new FormData();
        
        if (selectedImage) {
          formData.append('image', {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'image.jpg'
          } as any);
        }

        onSubmit({
          name: clothName.trim(),
          type: clothType,
          image: formData,
          brand: clothBrand.trim(),
          size: clothSize.trim()
        }, action);
      }

      handleCancel();
    } catch (error) {
      console.error('Error processing image:', error);
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
        {isSaving && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#714463" />
              <Text style={styles.loadingText}>
                {isEditing ? 'Updating your clothing...' : 'Analyzing your clothing...'}
              </Text>
            </View>
          </View>
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <Animated.View style={[styles.modalContent, { maxHeight: contentHeight.interpolate({
            inputRange: [0.7, 1],
            outputRange: ['70%', '90%']
          })}]}>
            <Text style={styles.title}>
              {isEditing ? 'Edit Clothing' : 'Add New Outfit'}
            </Text>
            
            {validationError ? (
              <Text style={styles.errorText}>{validationError}</Text>
            ) : null}

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
                    <Text style={styles.uploadText}>Tap to upload image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Enter outfit name"
                value={clothName}
                onChangeText={setClothName}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter brand name"
                value={clothBrand}
                onChangeText={setClothBrand}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter size"
                value={clothSize}
                onChangeText={setClothSize}
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
                
                {isEditing ? (
                  // Show two buttons when editing
                  <>
                    {/* <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={() => handleSubmit('save')}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                      style={[styles.button, styles.analyzeButton]}
                      onPress={() => handleSubmit('analyze')}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Show single analyze button when adding new
                  <TouchableOpacity
                    style={[styles.button, styles.analyzeButton]}
                    onPress={() => handleSubmit('analyze')}
                  >
                    <Text style={styles.buttonText}>Analyze</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
      <ImageSourceModal />
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#714463',
    textAlign: 'center',
  },
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
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    alignSelf: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#714463',
  },
  imageUpload: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fafafa',
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
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 0,
    backgroundColor: '#fafafa',
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
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    flex: 1,
    maxWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#e8ccb9',
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Green for save
  },
  analyzeButton: {
    backgroundColor: '#714463', // Purple for analyze
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});
