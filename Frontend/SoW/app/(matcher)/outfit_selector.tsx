// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
// import { useState, useEffect } from 'react';
// import { router, useLocalSearchParams } from 'expo-router';
// import { getAuth } from 'firebase/auth';
// import { app } from '../../firebaseConfig';
// import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
// import LoadingAnimation from '../../components/loading_ani';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
// import SimpleClothPopup from '../../components/SimpleCloth';

// const auth = getAuth(app);
// const TEMP_STORAGE_KEY = 'tempAnalyzedClothing';

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
//   isTemporary?: boolean; // Add flag to identify temporary items
// }

// type OutfitSelection = {
//   top: ClothingItem | null;
//   bottom: ClothingItem | null;
//   footwear: ClothingItem | null;
//   outerwear: ClothingItem | null;
//   accessories: ClothingItem[];
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

// export default function OutfitBuilderScreen() {
//   const params = useLocalSearchParams();
//   const { source } = params;
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadingMessage, setLoadingMessage] = useState('Loading your wardrobe...');
//   const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
//   const [tempClothes, setTempClothes] = useState<ClothingItem[]>([]);
//   const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<ClothType>('Top');
//   const [outfitSelection, setOutfitSelection] = useState<OutfitSelection>({
//     top: null,
//     bottom: null,
//     footwear: null,
//     outerwear: null,
//     accessories: []
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [showClearModal, setShowClearModal] = useState(false);
//   const [showComparePopup, setShowComparePopup] = useState(false);
//   const [isSavingCloth, setIsSavingCloth] = useState(false);

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

//   // Cloudinary configuration
//   const CLOUDINARY_CLOUD_NAME = 'cloudinary://258546172366246:TvdBDuunxGyrEYaJwVE2QlbeMXo@dudzs3nys';
//   const CLOUDINARY_UPLOAD_PRESET = 'costume'; 

//   const categories: ClothType[] = ['Top', 'Bottom', 'Footwear', 'Outerwear', 'Accessories'];

//   // Function to load temporary clothes from AsyncStorage
//   const loadTempClothes = async () => {
//     try {
//       console.log('Loading temporary clothes from storage...');
//       const tempData = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
//       if (tempData) {
//         const parsedTempData = JSON.parse(tempData);
//         console.log('Loaded temp clothes:', parsedTempData.length);
//         setTempClothes(parsedTempData);
//       } else {
//         console.log('No temporary clothes found in storage');
//         setTempClothes([]);
//       }
//     } catch (error) {
//       console.error('Error loading temporary clothes:', error);
//       setTempClothes([]);
//     }
//   };

//   // Function to save temporary clothes to AsyncStorage
//   // const saveTempClothes = async (clothes: ClothingItem[]) => {
//   //   try {
//   //     await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(clothes));
//   //   } catch (error) {
//   //     console.error('Error saving temporary clothes:', error);
//   //   }
//   // };

//   // Function to save temporary clothes to AsyncStorage
//   const saveTempClothes = async (clothes: ClothingItem[]) => {
//     try {
//       console.log(`Saving ${clothes.length} temporary items to storage:`, clothes.map(item => ({ name: item.name, isTemp: item.isTemporary })));
//       await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(clothes));
//     } catch (error) {
//       console.error('Error saving temporary clothes:', error);
//     }
//   };

//   // Function to add temporary clothing item
//   // const addTempClothingItem = (item: ClothingItem) => {
//   //   // Create a more unique ID for temporary items
//   //   const uniqueTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${item.name.replace(/\s+/g, '_')}`;
    
//   //   const newTempClothes = [...tempClothes, { 
//   //     ...item, 
//   //     id: uniqueTempId, // Use the unique ID
//   //     isTemporary: true 
//   //   }];
//   //   setTempClothes(newTempClothes);
//   //   saveTempClothes(newTempClothes);
//   // };

//   // Function to add temporary clothing item
//   const addTempClothingItem = (item: ClothingItem) => {
//     // Create a more unique ID for temporary items
//     const uniqueTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${item.name.replace(/\s+/g, '_')}`;
    
//     const tempItemWithLabel = { 
//       ...item, 
//       id: uniqueTempId,
//       isTemporary: true,
//       // Ensure the name has TEMP label if not already present
//       name: item.name.includes('(TEMP)') ? item.name : `${item.name} (TEMP)`,
//       brand: 'Temporary Item',
//       description: `${item.description || ''} - Added as temporary item on ${new Date().toLocaleString()}`
//     };
    
//     console.log('Adding temporary item:', { name: tempItemWithLabel.name, isTemp: tempItemWithLabel.isTemporary });
    
//     const newTempClothes = [...tempClothes, tempItemWithLabel];
//     setTempClothes(newTempClothes);
//     saveTempClothes(newTempClothes);
    
//     // Force re-render by updating a state that triggers useEffect
//     console.log('New temp clothes count:', newTempClothes.length);
//   };

//   // Function to get combined clothes (wardrobe + temporary) with duplicate check
//   const getCombinedClothes = () => {
//     console.log('Getting combined clothes - Wardrobe:', allClothes.length, 'Temp:', tempClothes.length);
//     const combined = [...allClothes, ...tempClothes];
    
//     // Remove any potential duplicates based on ID
//     const uniqueItems = combined.filter((item, index, self) => 
//       index === self.findIndex(t => t.id === item.id)
//     );
    
//     console.log('Combined unique items:', uniqueItems.length);
//     return uniqueItems;
//   };

//   // Function to remove temporary clothing item
//   const removeTempClothingItem = (itemId: string) => {
//     const updatedTempClothes = tempClothes.filter(item => item.id !== itemId);
//     setTempClothes(updatedTempClothes);
//     saveTempClothes(updatedTempClothes);
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
//     const initializeData = async () => {
//       try {
//         setLoadingMessage('Fetching your wardrobe...');
//         await fetchWardrobeItems();
//         setLoadingMessage('Loading temporary items...');
//         await loadTempClothes(); // Load temporary clothes
//         setIsLoading(false);
//       } catch (err) {
//         console.error('Error initializing data:', err);
//         setError('Failed to load data. Please try again.');
//         setIsLoading(false);
//       }
//     };
  
//     initializeData();
//   }, []);

//   useEffect(() => {
//     // Filter clothes based on selected category (including temporary clothes)
//     const combinedClothes = getCombinedClothes();
//     console.log('Combined clothes:', combinedClothes.length, 'Temp clothes:', tempClothes.length);
    
//     if (selectedCategory === 'Select Type') {
//       setFilteredClothes(combinedClothes);
//     } else {
//       const filtered = combinedClothes.filter(item => item.type === selectedCategory);
//       setFilteredClothes(filtered);
//     }
//   }, [selectedCategory, allClothes, tempClothes]);

//   const fetchWardrobeItems = async () => {
//     const userId = auth.currentUser?.uid;
//     if (!userId) {
//       setError('Please log in to access your wardrobe.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const db = getFirestore(app);
//       const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
//       const q = query(wardrobeRef, orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(q);
//       const items: ClothingItem[] = [];
//       querySnapshot.forEach((doc) => {
//         items.push({ ...doc.data() as ClothingItem, isTemporary: false });
//       });
      
//       setAllClothes(items);
//     } catch (err) {
//       console.error('Failed to fetch wardrobe items:', err);
//       setError('Failed to load your wardrobe. Please check your connection and try again.');
//       setIsLoading(false);
//     }
//   };

//   const handleItemSelection = (item: ClothingItem) => {
//     const category = item.type.toLowerCase() as keyof OutfitSelection;
    
//     if (category === 'accessories') {
//       // Handle multiple accessories
//       setOutfitSelection(prev => {
//         const currentAccessories = prev.accessories;
//         const isAlreadySelected = currentAccessories.some(acc => acc.id === item.id);
        
//         if (isAlreadySelected) {
//           // Remove if already selected
//           return {
//             ...prev,
//             accessories: currentAccessories.filter(acc => acc.id !== item.id)
//           };
//         } else {
//           // Add to accessories (max 5 accessories)
//           if (currentAccessories.length >= 5) {
//             showCustomAlert(
//               'Maximum Accessories',
//               'You can select up to 5 accessories only.',
//               [{ text: 'OK', onPress: () => {} }]
//             );
//             return prev;
//           }
//           return {
//             ...prev,
//             accessories: [...currentAccessories, item]
//           };
//         }
//       });
//     } else {
//       // Handle single item categories
//       setOutfitSelection(prev => ({
//         ...prev,
//         [category]: prev[category]?.id === item.id ? null : item
//       }));
//     }
//   };

//   // const handleCompareSubmit = async (data: { name: string; type: ClothType; imageUri: string; cloudinaryUrl: string; }) => {
//   //   setIsSavingCloth(true);
    
//   //   try {
//   //     // Create temporary clothing item from submitted data with guaranteed unique ID
//   //     const tempClothingItem: ClothingItem = {
//   //       id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${tempClothes.length}`, // More unique ID
//   //       name: data.name,
//   //       imageUrl: data.cloudinaryUrl,
//   //       brand: 'Temporary', // Default brand for temp items
//   //       size: 'Unknown', // Default size for temp items
//   //       type: data.type,
//   //       description: `Temporary item added via SimpleCloth`, // Default description
//   //       class: data.type.toLowerCase(), // Use type as class
//   //       createdAt: new Date().toISOString(),
//   //       updatedAt: new Date().toISOString(),
//   //       isTemporary: true
//   //     };
  
//   //     // Add to temporary clothes
//   //     addTempClothingItem(tempClothingItem);
      
//   //     showCustomAlert(
//   //       'Success',
//   //       'Item added successfully! You can now use it in your outfit.',
//   //       [{ text: 'OK', onPress: () => {} }]
//   //     );
      
//   //   } catch (error) {
//   //     console.error('Error handling submission:', error);
//   //     showCustomAlert(
//   //       'Error',
//   //       'Failed to add item. Please try again.',
//   //       [{ text: 'OK', onPress: () => {} }]
//   //     );
//   //   } finally {
//   //     setIsSavingCloth(false);
//   //   }
//   // };

//   const handleCompareSubmit = async (data: { name: string; type: ClothType; imageUri: string; cloudinaryUrl: string; }) => {
//     setIsSavingCloth(true);
    
//     try {
//       console.log('Submitting new temporary item:', data);
      
//       // Create temporary clothing item from submitted data with guaranteed unique ID
//       const tempClothingItem: ClothingItem = {
//         id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Simplified unique ID
//         name: `${data.name} (TEMP)`, // Add TEMP label to the name
//         imageUrl: data.cloudinaryUrl,
//         brand: 'Temporary Item', // More explicit brand for temp items
//         size: 'Unknown', // Default size for temp items
//         type: data.type,
//         description: `Temporary item added via SimpleCloth - ${new Date().toLocaleString()}`, // More detailed description with timestamp
//         class: `temp_${data.type.toLowerCase()}`, // Add temp prefix to class
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         isTemporary: true // Explicit temporary flag
//       };
  
//       // Add to temporary clothes
//       addTempClothingItem(tempClothingItem);
      
//       showCustomAlert(
//         'Temporary Item Added',
//         `The temporary item has been added to your wardrobe.`,
//         [{ text: 'OK', onPress: () => {} }]
//       );
      
//     } catch (error) {
//       console.error('Error handling submission:', error);
//       showCustomAlert(
//         'Error',
//         'Failed to add temporary item. Please try again.',
//         [{ text: 'OK', onPress: () => {} }]
//       );
//     } finally {
//       setIsSavingCloth(false);
//     }
//   };

//   const isItemSelected = (item: ClothingItem): boolean => {
//     const category = item.type.toLowerCase() as keyof OutfitSelection;
    
//     if (category === 'accessories') {
//       return outfitSelection.accessories.some(acc => acc.id === item.id);
//     } else {
//       return outfitSelection[category]?.id === item.id;
//     }
//   };

//   const getSelectedCount = (): number => {
//     let count = 0;
//     if (outfitSelection.top) count++;
//     if (outfitSelection.bottom) count++;
//     if (outfitSelection.footwear) count++;
//     if (outfitSelection.outerwear) count++;
//     count += outfitSelection.accessories.length;
//     return count;
//   };

//   const handleAnalyzeOutfit = async () => {
//     const selectedCount = getSelectedCount();
    
//     if (selectedCount < 2) {
//       showCustomAlert(
//         'Incomplete Outfit',
//         'Please select at least 2 items to create a complete outfit for analysis.',
//         [{ text: 'OK', onPress: () => {} }]
//       );
//       return;
//     }
  
//     try {
//       // Store the complete outfit selection
//       const outfitData = {
//         outfit: outfitSelection,
//         timestamp: new Date().toISOString(),
//         source: 'outfit_builder'
//       };
      
//       await AsyncStorage.setItem('selectedOutfit', JSON.stringify(outfitData));
      
//       // Navigate to outfit analysis screen
//       router.push({
//         pathname: '/(matcher)/outfit_result',
//         params: { 
//           source: 'outfit_builder',
//           itemCount: selectedCount.toString()
//         }
//       });
    
//     } catch (err) {
//       console.error('Error storing outfit data:', err);
//       showCustomAlert(
//         'Error',
//         'Failed to save outfit selection. Please try again.',
//         [{ text: 'OK', onPress: () => {} }]
//       );
//     }
//   };

//   const handleSelectFromOtherSources = () => {
//     showCustomAlert(
//       'Select Source',
//       'Choose where to select additional items from:',
//       [
//         {
//           text: 'Camera/Gallery',
//           onPress: () => router.push('/(processing)/analyzer_select')
//         },
//         {
//           text: 'Wardrobe',
//           onPress: () => router.push('/(processing)/selection_wardrobe')
//         },
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: () => {}
//         }
//       ]
//     );
//   };

//   const handleBackToWardrobe = () => {
//     router.push('/(tabs)/explore');
//   };

//   const clearSelection = () => {
//     setShowClearModal(true);
//   };

//   const cancelClearSelection = () => {
//     setShowClearModal(false);
//   };

//   const confirmClearSelection = () => {
//     setOutfitSelection({
//       top: null,
//       bottom: null,
//       footwear: null,
//       outerwear: null,
//       accessories: []
//     });
//     setShowClearModal(false);
//   };
 
//   const clearAllTempItems = () => {
//     showCustomAlert(
//       'Clear Temporary Items',
//       'Are you sure you want to remove all temporary items? This action cannot be undone.',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: () => {}
//         },
//         {
//           text: 'Clear All',
//           style: 'destructive',
//           onPress: () => {
//             setTempClothes([]);
//             saveTempClothes([]);
//           }
//         }
//       ]
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

//   if (error && allClothes.length === 0 && tempClothes.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Ionicons name="alert-circle-outline" size={64} color="#714463" />
//           <Text style={styles.errorTitle}>Oops!</Text>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.button} onPress={() => {
//             setError(null);
//             setIsLoading(true);
//             fetchWardrobeItems();
//           }}>
//             <Text style={styles.buttonText}>Try Again</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToWardrobe}>
//             <Text style={styles.secondaryButtonText}>Back to Wardrobe</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Outfit Builder</Text>
//           <Text style={styles.subtitle}>Create your perfect outfit combination</Text>
//         </View>

//         {/* Selected Items Summary */}
//         <View style={styles.summaryContainer}>
//           <View style={styles.summaryHeader}>
//             <Text style={styles.summaryTitle}>Selected-{getSelectedCount()} </Text>
//             <View style={styles.headerButtons}>
//               {/* Add the new Add button */}
//               <TouchableOpacity
//                 style={styles.addButton}
//                 onPress={() => setShowComparePopup(true)}
//               >
//                 <Ionicons name="add-outline" size={16} color="#8a6d3b" />
//                 <Text style={styles.addButtonText}>Add</Text>
//               </TouchableOpacity>
              
//               {/* Clear temporary items button */}
//               {tempClothes.length > 0 && (
//                 <TouchableOpacity
//                   style={styles.tempClearButton}
//                   onPress={clearAllTempItems}
//                 >
//                   <Ionicons name="time-outline" size={16} color="#ff8c00" />
//                   <Text style={styles.tempClearButtonText}>Clear Temp</Text>
//                 </TouchableOpacity>
//               )}
              
//               {getSelectedCount() > 0 && (
//                 <TouchableOpacity 
//                   style={styles.clearAllButton}
//                   onPress={() => setShowClearModal(true)}
//                 >
//                   <Ionicons name="trash-outline" size={16} color="#ff4444" />
//                   <Text style={styles.clearAllText}>Clear</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
          
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedItemsScroll}>
//             {outfitSelection.top && (
//               <View style={styles.selectedItemCard}>
//                 <Image source={{ uri: outfitSelection.top.imageUrl }} style={styles.selectedItemImage} />
//                 <Text style={styles.selectedItemLabel}>Top</Text>
//                 {outfitSelection.top.isTemporary && (
//                   <View style={styles.tempBadge}>
//                     <Text style={styles.tempBadgeText}>TEMP</Text>
//                   </View>
//                 )}
//                 <TouchableOpacity 
//                   style={styles.removeButton}
//                   onPress={() => setOutfitSelection(prev => ({ ...prev, top: null }))}
//                 >
//                   <Ionicons name="close-circle" size={20} color="#ff4444" />
//                 </TouchableOpacity>
//               </View>
//             )}
            
//             {outfitSelection.bottom && (
//               <View style={styles.selectedItemCard}>
//                 <Image source={{ uri: outfitSelection.bottom.imageUrl }} style={styles.selectedItemImage} />
//                 <Text style={styles.selectedItemLabel}>Bottom</Text>
//                 {outfitSelection.bottom.isTemporary && (
//                   <View style={styles.tempBadge}>
//                     <Text style={styles.tempBadgeText}>TEMP</Text>
//                   </View>
//                 )}
//                 <TouchableOpacity 
//                   style={styles.removeButton}
//                   onPress={() => setOutfitSelection(prev => ({ ...prev, bottom: null }))}
//                 >
//                   <Ionicons name="close-circle" size={20} color="#ff4444" />
//                 </TouchableOpacity>
//               </View>
//             )}
            
//             {outfitSelection.footwear && (
//               <View style={styles.selectedItemCard}>
//                 <Image source={{ uri: outfitSelection.footwear.imageUrl }} style={styles.selectedItemImage} />
//                 <Text style={styles.selectedItemLabel}>Footwear</Text>
//                 {outfitSelection.footwear.isTemporary && (
//                   <View style={styles.tempBadge}>
//                     <Text style={styles.tempBadgeText}>TEMP</Text>
//                   </View>
//                 )}
//                 <TouchableOpacity 
//                   style={styles.removeButton}
//                   onPress={() => setOutfitSelection(prev => ({ ...prev, footwear: null }))}
//                 >
//                   <Ionicons name="close-circle" size={20} color="#ff4444" />
//                 </TouchableOpacity>
//               </View>
//             )}
            
//             {outfitSelection.outerwear && (
//               <View style={styles.selectedItemCard}>
//                 <Image source={{ uri: outfitSelection.outerwear.imageUrl }} style={styles.selectedItemImage} />
//                 <Text style={styles.selectedItemLabel}>Outerwear</Text>
//                 {outfitSelection.outerwear.isTemporary && (
//                   <View style={styles.tempBadge}>
//                     <Text style={styles.tempBadgeText}>TEMP</Text>
//                   </View>
//                 )}
//                 <TouchableOpacity 
//                   style={styles.removeButton}
//                   onPress={() => setOutfitSelection(prev => ({ ...prev, outerwear: null }))}
//                 >
//                   <Ionicons name="close-circle" size={20} color="#ff4444" />
//                 </TouchableOpacity>
//               </View>
//             )}
            
//             {outfitSelection.accessories.map((accessory, index) => (
//               <View key={accessory.id} style={styles.selectedItemCard}>
//                 <Image source={{ uri: accessory.imageUrl }} style={styles.selectedItemImage} />
//                 <Text style={styles.selectedItemLabel}>Accessory {index + 1}</Text>
//                 {accessory.isTemporary && (
//                   <View style={styles.tempBadge}>
//                     <Text style={styles.tempBadgeText}>TEMP</Text>
//                   </View>
//                 )}
//                 <TouchableOpacity 
//                   style={styles.removeButton}
//                   onPress={() => setOutfitSelection(prev => ({
//                     ...prev,
//                     accessories: prev.accessories.filter(acc => acc.id !== accessory.id)
//                   }))}
//                 >
//                   <Ionicons name="close-circle" size={20} color="#ff4444" />
//                 </TouchableOpacity>
//               </View>
//             ))}
            
//             {getSelectedCount() === 0 && (
//               <View style={styles.emptySelectionCard}>
//                 <Ionicons name="shirt-outline" size={40} color="#ccc" />
//                 <Text style={styles.emptySelectionText}>No items selected</Text>
//               </View>
//             )}
//           </ScrollView>
//         </View>

//         {/* Category Filter */}
//         <View style={styles.categoryContainer}>
//           <Text style={styles.categoryTitle}>Select Category</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
//             {categories.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[
//                   styles.categoryButton,
//                   selectedCategory === category && styles.selectedCategoryButton
//                 ]}
//                 onPress={() => setSelectedCategory(category)}
//               >
//                 <Text style={[
//                   styles.categoryButtonText,
//                   selectedCategory === category && styles.selectedCategoryButtonText
//                 ]}>
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Items Grid */}
//         <View style={styles.itemsContainer}>
//         <Text style={styles.itemsTitle}>
//             {selectedCategory} Items ({filteredClothes.length})
//             {tempClothes.filter(item => selectedCategory === 'Select Type' || item.type === selectedCategory).length > 0 && (
//             <Text style={styles.tempItemsCount}>
//                 {' '}({tempClothes.filter(item => selectedCategory === 'Select Type' || item.type === selectedCategory).length} temporary)
//             </Text>
//             )}
//         </Text>
//         <View style={styles.itemsGrid}>
//             {filteredClothes.length === 0 ? (
//             <View style={styles.emptyContainer}>
//                 <Ionicons name="shirt-outline" size={64} color="#714463" />
//                 <Text style={styles.emptyText}>No {selectedCategory.toLowerCase()} items found</Text>
//                 <Text style={styles.emptySubtext}>Add some items to your wardrobe or use the Add button above</Text>
//             </View>
//             ) : (
//             filteredClothes.map((item, index) => ( // Add index to ensure uniqueness
//                 <TouchableOpacity
//                 key={`${item.isTemporary ? 'temp' : 'wardrobe'}_${item.id}_${index}`} // Unique key with prefix and index
//                 style={[
//                     styles.itemCard,
//                     isItemSelected(item) && styles.selectedItemCard2,
//                     item.isTemporary && styles.tempItemCard
//                 ]}
//                 onPress={() => handleItemSelection(item)}
//                 >
//                 <View style={styles.itemImageContainer}>
//                     <Image 
//                     source={{ uri: item.imageUrl }} 
//                     style={styles.itemImage}
//                     resizeMode="contain"
//                     />
//                     {isItemSelected(item) && (
//                     <View style={styles.selectedOverlay}>
//                         <Ionicons name="checkmark-circle" size={30} color="#714463" />
//                     </View>
//                     )}
//                     {item.isTemporary && (
//                     <View style={styles.tempItemBadge}>
//                         <Ionicons name="time" size={12} color="#ff8c00" />
//                         <Text style={styles.tempItemBadgeText}>TEMP</Text>
//                     </View>
//                     )}
//                 </View>
//                 <View style={styles.itemInfo}>
//                     <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
//                     <Text style={styles.itemType}>{item.type}</Text>
//                     {item.class && (
//                     <View style={styles.itemBadge}>
//                         <Text style={styles.itemBadgeText}>{item.class}</Text>
//                     </View>
//                     )}
//                     {item.isTemporary && (
//                     <TouchableOpacity
//                         style={styles.removeTempButton}
//                         onPress={(e) => {
//                         e.stopPropagation();
//                         removeTempClothingItem(item.id);
//                         }}
//                     >
//                         <Ionicons name="trash-outline" size={14} color="#ff4444" />
//                     </TouchableOpacity>
//                     )}
//                 </View>
//                 </TouchableOpacity>
//             ))
//             )}
//         </View>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actionsContainer}>
//           {getSelectedCount() >= 2 && (
//             <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzeOutfit}>
//               <View style={styles.analyzeButtonContent}>
//                 <Ionicons name="analytics-outline" size={20} color="white" style={styles.analyzeIcon} />
//                 <Text style={styles.analyzeButtonText}>Analyze Outfit ({getSelectedCount()} items)</Text>
//               </View>
//             </TouchableOpacity>
//           )}
                      
//           <TouchableOpacity 
//             style={[styles.button, styles.secondaryButton]} 
//             onPress={handleBackToWardrobe}
//           >
//             <Text style={styles.secondaryButtonText}>Back to Wardrobe</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Custom Clear Selection Modal */}
//       <Modal
//         visible={showClearModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={cancelClearSelection}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.clearModalContainer}>
//             <View style={styles.modalHeader}>
//               <View style={styles.modalIconContainer}>
//                 <Ionicons name="trash-outline" size={48} color="#ff4444"/>
//               </View>
//               <Text style={styles.modalTitle}>Clear Selection</Text>
//               <Text style={styles.modalMessage}>
//                 Are you sure you want to clear all selected items? This action cannot be undone.
//               </Text>
//             </View>
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelModalButton]}
//                 onPress={cancelClearSelection}
//               >
//                 <Text style={styles.cancelModalButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.clearModalButton]}
//                 onPress={confirmClearSelection}
//               >
//                 <Ionicons name="trash" size={18} color="white" style={styles.clearButtonIcon} />
//                 <Text style={styles.clearModalButtonText}>Clear All</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Add the SimpleClothPopup component */}
//       <SimpleClothPopup
//         isOpen={showComparePopup}
//         onClose={() => setShowComparePopup(false)}
//         onSubmit={handleCompareSubmit}
//         isSaving={isSavingCloth}
//         cloudinaryCloudName={CLOUDINARY_CLOUD_NAME}
//         cloudinaryUploadPreset={CLOUDINARY_UPLOAD_PRESET}
//       />

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
//     paddingTop: 70,
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
//   summaryContainer: {
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
//   summaryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ecd6c3',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#8a6d2c',
//   },
//   addButtonText: {
//     fontSize: 12,
//     color: '#8a6d3c',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   // New styles for temporary items
//   tempClearButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff3e0',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#ff8c00',
//   },
//   tempClearButtonText: {
//     fontSize: 12,
//     color: '#ff8c00',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   tempBadge: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: '#ff8c00',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   tempBadgeText: {
//     fontSize: 8,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   tempItemCard: {
//     borderWidth: 2,
//     borderColor: '#ff8c00',
//     borderStyle: 'dashed',
//   },
//   tempItemBadge: {
//     position: 'absolute',
//     top: 4,
//     left: 4,
//     backgroundColor: 'rgba(255, 140, 0, 0.9)',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tempItemBadgeText: {
//     fontSize: 8,
//     color: 'white',
//     fontWeight: 'bold',
//     marginLeft: 2,
//   },
//   tempItemsCount: {
//     fontSize: 14,
//     color: '#ff8c00',
//     fontStyle: 'italic',
//   },
//   removeTempButton: {
//     position: 'absolute',
//     top: 1,
//     right: 4,
//     backgroundColor: 'rgba(255, 68, 68, 0.1)',
//     padding: 4,
//     borderRadius: 12,
//     marginRight: -9,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   compareButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0e6f7',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#714463',
//   },
//   compareButtonText: {
//     fontSize: 12,
//     color: '#714463',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   clearAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ffe5e5',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#ff4444',
//   },
//   clearAllText: {
//     fontSize: 12,
//     color: '#ff4444',
//     fontWeight: '600',
//     marginLeft: 4,
    
//   },
//   selectedItemsScroll: {
//     marginBottom: 8,
//   },
//   selectedItemCard: {
//     width: 100,
//     marginRight: 12,
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//     padding: 8,
//     position: 'relative',
//   },
//   selectedItemImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 6,
//     marginBottom: 6,
//   },
//   selectedItemLabel: {
//     fontSize: 12,
//     color: '#333',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   removeButton: {
//     position: 'absolute',
//     top: -2,
//     right: -5,
//     backgroundColor: 'white',
//     borderRadius: 10,
//   },
//   emptySelectionCard: {
//     width: 120,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: '#ddd',
//     borderStyle: 'dashed',
//   },
//   emptySelectionText: {
//     fontSize: 12,
//     color: '#714463',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   categoryContainer: {
//     marginBottom: 20,
//   },
//   categoryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 12,
//   },
//   categoryScroll: {
//     marginBottom: 8,
//   },
//   categoryButton: {
//     backgroundColor: 'white',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   selectedCategoryButton: {
//     backgroundColor: '#714463',
//     borderColor: '#714463',
//   },
//   categoryButtonText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   selectedCategoryButtonText: {
//     color: 'white',
//   },
//   itemsContainer: {
//     marginBottom: 20,
//   },
//   itemsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#281b52',
//     marginBottom: 12,
//   },
//   itemsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   itemCard: {
//     width: '48%',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   selectedItemCard2: {
//     borderWidth: 2,
//     borderColor: '#714463',
//     backgroundColor: '#f8f4f6',
//   },
//   itemImageContainer: {
//     width: '100%',
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: '#f5f5f5',
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//     position: 'relative',
//   },
//   itemImage: {
//     width: '90%',
//     height: '90%',
//   },
//   selectedOverlay: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 2,
//   },
//   itemInfo: {
//     alignItems: 'center',
//     position: 'relative',
//   },
//   itemName: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#281b52',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   itemType: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 6,
//   },
//   itemBadge: {
//     backgroundColor: 'rgba(113, 68, 99, 0.8)',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   itemBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '500',
//     textTransform: 'capitalize',
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#714463',
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#714463',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   actionsContainer: {
//     marginTop: 20,
//   },
//   analyzeButton: {
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
//   button: {
//     backgroundColor: '#714463',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonIcon: {
//     marginRight: 8,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
// },
// secondaryButton: {
//   backgroundColor: '#ecd6e5',
//   borderWidth: 1,
//   borderColor: '#714463',
// },
// secondaryButtonText: {
//   color: '#714463',
//   fontSize: 16,
//   fontWeight: '600',
// },
// clearButton: {
//   backgroundColor: '#ffe5e5',
//   borderWidth: 1,
//   borderColor: '#ff4444',
// },
// clearButtonText: {
//   color: '#ff4444',
//   fontSize: 16,
//   fontWeight: '600',
// },
// // Modal styles
// modalOverlay: {
//   flex: 1,
//   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   justifyContent: 'center',
//   alignItems: 'center',
//   padding: 20,
// },
// clearModalContainer: {
//   backgroundColor: 'white',
//   borderRadius: 16,
//   padding: 24,
//   width: '90%',
//   maxWidth: 400,
//   alignItems: 'center',
// },
// modalHeader: {
//   alignItems: 'center',
//   marginBottom: 24,
// },
// modalIconContainer: {
//   width: 80,
//   height: 80,
//   borderRadius: 40,
//   backgroundColor: '#ffe5e5',
//   justifyContent: 'center',
//   alignItems: 'center',
//   marginBottom: 16,
// },
// modalTitle: {
//   fontSize: 20,
//   fontWeight: 'bold',
//   color: '#281b52',
//   marginBottom: 8,
//   textAlign: 'center',
// },
// modalMessage: {
//   fontSize: 16,
//   color: '#666',
//   textAlign: 'center',
//   lineHeight: 24,
// },
// modalActions: {
//   flexDirection: 'row',
//   gap: 12,
//   width: '100%',
// },
// modalButton: {
//   flex: 1,
//   paddingVertical: 14,
//   paddingHorizontal: 20,
//   borderRadius: 12,
//   alignItems: 'center',
//   justifyContent: 'center',
//   flexDirection: 'row',
// },
// cancelModalButton: {
//   backgroundColor: '#f5f5f5',
//   borderWidth: 1,
//   borderColor: '#ddd',
// },
// cancelModalButtonText: {
//   fontSize: 16,
//   fontWeight: '600',
//   color: '#333',
// },
// clearModalButton: {
//   backgroundColor: '#ff4444'
// },
// clearModalButtonText: {
//   fontSize: 16,
//   fontWeight: '600',
//   color: 'white',
//   marginLeft: 8,
// },
// clearButtonIcon: {
//   marginRight: 4,
// },

// // Custom Alert Styles
// alertOverlay: {
//   flex: 1,
//   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   justifyContent: 'center',
//   alignItems: 'center',
//   padding: 20,
// },
// alertContainer: {
//   backgroundColor: 'white',
//   borderRadius: 16,
//   padding: 24,
//   width: '90%',
//   maxWidth: 400,
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.25,
//   shadowRadius: 8,
//   elevation: 8,
// },
// alertHeader: {
//   alignItems: 'center',
//   marginBottom: 24,
// },
// alertTitle: {
//   fontSize: 20,
//   fontWeight: 'bold',
//   color: '#281b52',
//   marginBottom: 12,
//   textAlign: 'center',
// },
// alertMessage: {
//   fontSize: 16,
//   color: '#666',
//   textAlign: 'center',
//   lineHeight: 24,
// },
// alertButtonContainer: {
//   flexDirection: 'row',
//   gap: 12,
//   width: '100%',
// },
// alertButton: {
//   flex: 1,
//   paddingVertical: 14,
//   paddingHorizontal: 20,
//   borderRadius: 12,
//   alignItems: 'center',
//   justifyContent: 'center',
//   minHeight: 48,
// },
// defaultAlertButton: {
//   backgroundColor: '#714463',
// },
// cancelAlertButton: {
//   backgroundColor: '#f5f5f5',
//   borderWidth: 1,
//   borderColor: '#ddd',
// },
// destructiveAlertButton: {
//   backgroundColor: '#ff4444',
// },
// alertButtonText: {
//   fontSize: 16,
//   fontWeight: '600',
//   textAlign: 'center',
// },
// defaultAlertButtonText: {
//   color: 'white',
// },
// cancelAlertButtonText: {
//   color: '#333',
// },
// destructiveAlertButtonText: {
//   color: 'white',
// },
// });

import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import SimpleClothPopup from '../../components/SimpleCloth';

const auth = getAuth(app);
const TEMP_STORAGE_KEY = 'tempAnalyzedClothing1';

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
  isTemporary?: boolean; // Add flag to identify temporary items
}

type OutfitSelection = {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  footwear: ClothingItem | null;
  outerwear: ClothingItem | null;
  accessories: ClothingItem[];
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

export default function OutfitBuilderScreen() {
  const params = useLocalSearchParams();
  const { source } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading your wardrobe...');
  const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
  const [tempClothes, setTempClothes] = useState<ClothingItem[]>([]);
  const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClothType>('Top');
  const [outfitSelection, setOutfitSelection] = useState<OutfitSelection>({
    top: null,
    bottom: null,
    footwear: null,
    outerwear: null,
    accessories: []
  });
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [isSavingCloth, setIsSavingCloth] = useState(false);
  const [tempItemToDelete, setTempItemToDelete] = useState<ClothingItem | null>(null);

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

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'cloudinary://258546172366246:TvdBDuunxGyrEYaJwVE2QlbeMXo@dudzs3nys';
  const CLOUDINARY_UPLOAD_PRESET = 'costume'; 

  const categories: ClothType[] = ['Top', 'Bottom', 'Footwear', 'Outerwear', 'Accessories'];

  // Function to load temporary clothes from AsyncStorage
  const loadTempClothes = async () => {
    try {
      console.log('Loading temporary clothes from storage...');
      const tempData = await AsyncStorage.getItem(TEMP_STORAGE_KEY);
      if (tempData) {
        const parsedTempData = JSON.parse(tempData);
        console.log('Loaded temp clothes:', parsedTempData.length);
        setTempClothes(parsedTempData);
      } else {
        console.log('No temporary clothes found in storage');
        setTempClothes([]);
      }
    } catch (error) {
      console.error('Error loading temporary clothes:', error);
      setTempClothes([]);
    }
  };

  // Function to save temporary clothes to AsyncStorage
  const saveTempClothes = async (clothes: ClothingItem[]) => {
    try {
      console.log(`Saving ${clothes.length} temporary items to storage:`, clothes.map(item => ({ name: item.name, isTemp: item.isTemporary })));
      await AsyncStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(clothes));
    } catch (error) {
      console.error('Error saving temporary clothes:', error);
    }
  };

  // Function to add temporary clothing item
  const addTempClothingItem = (item: ClothingItem) => {
    // Create a more unique ID for temporary items
    const uniqueTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${item.name.replace(/\s+/g, '_')}`;
    
    const tempItemWithLabel = { 
      ...item, 
      id: uniqueTempId,
      isTemporary: true,
      // Ensure the name has TEMP label if not already present
      name:  item.name,
      brand: 'Temporary Item',
      description: `${item.description || ''}}`
    };
    
    console.log('Adding temporary item:', { name: tempItemWithLabel.name, isTemp: tempItemWithLabel.isTemporary });
    
    const newTempClothes = [...tempClothes, tempItemWithLabel];
    setTempClothes(newTempClothes);
    saveTempClothes(newTempClothes);
    
    // Force re-render by updating a state that triggers useEffect
    console.log('New temp clothes count:', newTempClothes.length);
  };

  // Function to get combined clothes (wardrobe + temporary) with duplicate check
  const getCombinedClothes = () => {
    console.log('Getting combined clothes - Wardrobe:', allClothes.length, 'Temp:', tempClothes.length);
    const combined = [...allClothes, ...tempClothes];
    
    // Remove any potential duplicates based on ID
    const uniqueItems = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    console.log('Combined unique items:', uniqueItems.length);
    return uniqueItems;
  };

  // Function to remove temporary clothing item
  const removeTempClothingItem = (itemId: string) => {
    const updatedTempClothes = tempClothes.filter(item => item.id !== itemId);
    setTempClothes(updatedTempClothes);
    saveTempClothes(updatedTempClothes);
    
    // Also remove from outfit selection if it was selected
    setOutfitSelection(prev => {
      const newSelection = { ...prev };
      
      // Check each category and remove if it matches the deleted item
      if (newSelection.top?.id === itemId) newSelection.top = null;
      if (newSelection.bottom?.id === itemId) newSelection.bottom = null;
      if (newSelection.footwear?.id === itemId) newSelection.footwear = null;
      if (newSelection.outerwear?.id === itemId) newSelection.outerwear = null;
      
      // Remove from accessories
      newSelection.accessories = newSelection.accessories.filter(acc => acc.id !== itemId);
      
      return newSelection;
    });
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
    const initializeData = async () => {
      try {
        setLoadingMessage('Fetching your wardrobe...');
        await fetchWardrobeItems();
        setLoadingMessage('Loading temporary items...');
        await loadTempClothes(); // Load temporary clothes
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };
  
    initializeData();
  }, []);

  useEffect(() => {
    // Filter clothes based on selected category (including temporary clothes)
    const combinedClothes = getCombinedClothes();
    console.log('Combined clothes:', combinedClothes.length, 'Temp clothes:', tempClothes.length);
    
    if (selectedCategory === 'Select Type') {
      setFilteredClothes(combinedClothes);
    } else {
      const filtered = combinedClothes.filter(item => item.type === selectedCategory);
      setFilteredClothes(filtered);
    }
  }, [selectedCategory, allClothes, tempClothes]);

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
      const q = query(wardrobeRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: ClothingItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ ...doc.data() as ClothingItem, isTemporary: false });
      });
      
      setAllClothes(items);
    } catch (err) {
      console.error('Failed to fetch wardrobe items:', err);
      setError('Failed to load your wardrobe. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const handleItemSelection = (item: ClothingItem) => {
    const category = item.type.toLowerCase() as keyof OutfitSelection;
    
    if (category === 'accessories') {
      // Handle multiple accessories
      setOutfitSelection(prev => {
        const currentAccessories = prev.accessories;
        const isAlreadySelected = currentAccessories.some(acc => acc.id === item.id);
        
        if (isAlreadySelected) {
          // Remove if already selected
          return {
            ...prev,
            accessories: currentAccessories.filter(acc => acc.id !== item.id)
          };
        } else {
          // Add to accessories (max 5 accessories)
          if (currentAccessories.length >= 5) {
            showCustomAlert(
              'Maximum Accessories',
              'You can select up to 5 accessories only.',
              [{ text: 'OK', onPress: () => {} }]
            );
            return prev;
          }
          return {
            ...prev,
            accessories: [...currentAccessories, item]
          };
        }
      });
    } else {
      // Handle single item categories
      setOutfitSelection(prev => ({
        ...prev,
        [category]: prev[category]?.id === item.id ? null : item
      }));
    }
  };

  // const handleCompareSubmit = async (data: { name: string; type: ClothType; imageUri: string; cloudinaryUrl: string; }) => {
  //   setIsSavingCloth(true);
    
  //   try {
  //     console.log('Submitting new temporary item:', data);
      
  //     // Create temporary clothing item from submitted data with guaranteed unique ID
  //     const tempClothingItem: ClothingItem = {
  //       id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Simplified unique ID
  //       name: `${data.name} (TEMP)`, // Add TEMP label to the name
  //       imageUrl: data.cloudinaryUrl,
  //       brand: 'Temporary Item', // More explicit brand for temp items
  //       size: 'Unknown', // Default size for temp items
  //       type: data.type,
  //       description: `Temporary item added via SimpleCloth - ${new Date().toLocaleString()}`, // More detailed description with timestamp
  //       class: `temp_${data.type.toLowerCase()}`, // Add temp prefix to class
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString(),
  //       isTemporary: true // Explicit temporary flag
  //     };

  //     console.log('Created temp clothing item:', tempClothingItem);
  
  //     // Add to temporary clothes
  //     addTempClothingItem(tempClothingItem);
      
  //     showCustomAlert(
  //       'Temporary Item Added',
  //       `Item has been added successfully! You can now use it in your outfit.`,
  //       [{ text: 'OK', onPress: () => {} }]
  //     );
      
  //   } catch (error) {
  //     console.error('Error handling submission:', error);
  //     showCustomAlert(
  //       'Error',
  //       'Failed to add temporary item. Please try again.',
  //       [{ text: 'OK', onPress: () => {} }]
  //     );
  //   } finally {
  //     setIsSavingCloth(false);
  //   }
  // };

  const handleCompareSubmit = async (data: { name: string; type: ClothType; imageUri: string; cloudinaryUrl: string; description: string; class: string;}) => {
  setIsSavingCloth(true);
  
  try {
    console.log('Submitting new temporary item:', data);
    
    // Create temporary clothing item from submitted data with guaranteed unique ID
    const tempClothingItem: ClothingItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Simplified unique ID
      name: `${data.name} (TEMP)`, // Add TEMP label to the name
      imageUrl: data.cloudinaryUrl,
      brand: 'Temporary Item', // More explicit brand for temp items
      size: 'Unknown', // Default size for temp items
      type: data.type,
      description: data.description, // Use actual data in description
      class: data.class || `temp_${data.type.toLowerCase()}`, // Add temp prefix to class
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemporary: true // Explicit temporary flag
    };

    console.log('Created temp clothing item:', tempClothingItem);

    // Add to temporary clothes
    addTempClothingItem(tempClothingItem);
    
    showCustomAlert(
      'Temporary Item Added',
      `Item has been added successfully! You can now use it in your outfit.`,
      [{ text: 'OK', onPress: () => {} }]
    );
    
  } catch (error) {
    console.error('Error handling submission:', error);
    showCustomAlert(
      'Error',
      'Failed to add temporary item. Please try again.',
      [{ text: 'OK', onPress: () => {} }]
    );
  } finally {
    setIsSavingCloth(false);
  }
};

  const isItemSelected = (item: ClothingItem): boolean => {
    const category = item.type.toLowerCase() as keyof OutfitSelection;
    
    if (category === 'accessories') {
      return outfitSelection.accessories.some(acc => acc.id === item.id);
    } else {
      return outfitSelection[category]?.id === item.id;
    }
  };

  const getSelectedCount = (): number => {
    let count = 0;
    if (outfitSelection.top) count++;
    if (outfitSelection.bottom) count++;
    if (outfitSelection.footwear) count++;
    if (outfitSelection.outerwear) count++;
    count += outfitSelection.accessories.length;
    return count;
  };

  const handleAnalyzeOutfit = async () => {
    const selectedCount = getSelectedCount();
    
    if (selectedCount < 2) {
      showCustomAlert(
        'Incomplete Outfit',
        'Please select at least 2 items to create a complete outfit for analysis.',
        [{ text: 'OK', onPress: () => {} }]
      );
      return;
    }

    try {
      // Store the complete outfit selection
      const outfitData = {
        outfit: outfitSelection,
        timestamp: new Date().toISOString(),
        source: 'outfit_builder'
      };
      
      await AsyncStorage.setItem('selectedOutfit', JSON.stringify(outfitData));
      
      // Navigate to outfit analysis screen
      router.push({
        pathname: '/(matcher)/outfit_result',
        params: { 
          source: 'outfit_builder',
          itemCount: selectedCount.toString()
        }
      });
    
    } catch (err) {
      console.error('Error storing outfit data:', err);
      showCustomAlert(
        'Error',
        'Failed to save outfit selection. Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  const handleBackToWardrobe = () => {
    router.push('/(tabs)/explore');
  };

  const clearSelection = () => {
    setShowClearModal(true);
  };

  const cancelClearSelection = () => {
    setShowClearModal(false);
  };

  const confirmClearSelection = () => {
    setOutfitSelection({
      top: null,
      bottom: null,
      footwear: null,
      outerwear: null,
      accessories: []
    });
    setShowClearModal(false);
  };
 
  const clearAllTempItems = () => {
    showCustomAlert(
      'Clear Temporary Items',
      'Are you sure you want to remove all temporary items? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {}
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setTempClothes([]);
            saveTempClothes([]);
            
            // Also clear any selected temporary items from outfit
            setOutfitSelection(prev => {
              const newSelection = { ...prev };
              
              if (newSelection.top?.isTemporary) newSelection.top = null;
              if (newSelection.bottom?.isTemporary) newSelection.bottom = null;
              if (newSelection.footwear?.isTemporary) newSelection.footwear = null;
              if (newSelection.outerwear?.isTemporary) newSelection.outerwear = null;
              
              newSelection.accessories = newSelection.accessories.filter(acc => !acc.isTemporary);
              
              return newSelection;
            });
          }
        }
      ]
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

  if (error && allClothes.length === 0 && tempClothes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#714463" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => {
            setError(null);
            setIsLoading(true);
            fetchWardrobeItems();
          }}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToWardrobe}>
            <Text style={styles.secondaryButtonText}>Back to Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Outfit Builder</Text>
          <Text style={styles.subtitle}>Create your perfect outfit combination</Text>
        </View>

        {/* Selected Items Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Selected-{getSelectedCount()}</Text>
            <View style={styles.headerButtons}>
              {/* Add the new Add button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowComparePopup(true)}
              >
                <Ionicons name="add-outline" size={16} color="#8a6d3b" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              
              {/* Clear temporary items button */}
              {tempClothes.length > 0 && (
                <TouchableOpacity
                  style={styles.tempClearButton}
                  onPress={clearAllTempItems}
                >
                  <Ionicons name="time-outline" size={16} color="#ff8c00" />
                  <Text style={styles.tempClearButtonText}>Clear Temp</Text>
                </TouchableOpacity>
              )}
              
              {getSelectedCount() > 0 && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={() => setShowClearModal(true)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  <Text style={styles.clearAllText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedItemsScroll}>
            {outfitSelection.top && (
              <View style={styles.selectedItemCard}>
                <Image source={{ uri: outfitSelection.top.imageUrl }} style={styles.selectedItemImage} />
                <Text style={styles.selectedItemLabel}>Top</Text>
                {outfitSelection.top.isTemporary && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempBadgeText}>TEMP</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setOutfitSelection(prev => ({ ...prev, top: null }))}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            
            {outfitSelection.bottom && (
              <View style={styles.selectedItemCard}>
                <Image source={{ uri: outfitSelection.bottom.imageUrl }} style={styles.selectedItemImage} />
                <Text style={styles.selectedItemLabel}>Bottom</Text>
                {outfitSelection.bottom.isTemporary && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempBadgeText}>TEMP</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setOutfitSelection(prev => ({ ...prev, bottom: null }))}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            
            {outfitSelection.footwear && (
              <View style={styles.selectedItemCard}>
                <Image source={{ uri: outfitSelection.footwear.imageUrl }} style={styles.selectedItemImage} />
                <Text style={styles.selectedItemLabel}>Footwear</Text>
                {outfitSelection.footwear.isTemporary && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempBadgeText}>TEMP</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setOutfitSelection(prev => ({ ...prev, footwear: null }))}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            
            {outfitSelection.outerwear && (
              <View style={styles.selectedItemCard}>
                <Image source={{ uri: outfitSelection.outerwear.imageUrl }} style={styles.selectedItemImage} />
                <Text style={styles.selectedItemLabel}>Outerwear</Text>
                {outfitSelection.outerwear.isTemporary && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempBadgeText}>TEMP</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setOutfitSelection(prev => ({ ...prev, outerwear: null }))}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            
            {outfitSelection.accessories.map((accessory, index) => (
              <View key={accessory.id} style={styles.selectedItemCard}>
                <Image source={{ uri: accessory.imageUrl }} style={styles.selectedItemImage} />
                <Text style={styles.selectedItemLabel}>Accessory {index + 1}</Text>
                {accessory.isTemporary && (
                  <View style={styles.tempBadge}>
                    <Text style={styles.tempBadgeText}>TEMP</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setOutfitSelection(prev => ({
                    ...prev,
                    accessories: prev.accessories.filter(acc => acc.id !== accessory.id)
                  }))}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {getSelectedCount() === 0 && (
              <View style={styles.emptySelectionCard}>
                <Ionicons name="shirt-outline" size={40} color="#ccc" />
                <Text style={styles.emptySelectionText}>No items selected</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Select Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryButtonText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Items Grid */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>
            {selectedCategory} Items ({filteredClothes.length})
            {tempClothes.filter(item => selectedCategory === 'Select Type' || item.type === selectedCategory).length > 0 && (
              <Text style={styles.tempItemsCount}>
                {' '}({tempClothes.filter(item => selectedCategory === 'Select Type' || item.type === selectedCategory).length} temporary)
              </Text>
            )}
          </Text>
          <View style={styles.itemsGrid}>
            {filteredClothes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="shirt-outline" size={64} color="#714463" />
                <Text style={styles.emptyText}>No {selectedCategory.toLowerCase()} items found</Text>
                <Text style={styles.emptySubtext}>Add some items to your wardrobe or use the Add button above</Text>
              </View>
            ) : (
              filteredClothes.map((item, index) => (
                <TouchableOpacity
                  key={`${item.isTemporary ? 'temp' : 'wardrobe'}_${item.id}_${index}`}
                  style={[
                    styles.itemCard,
                    isItemSelected(item) && styles.selectedItemCard2,
                    item.isTemporary && styles.tempItemCard
                  ]}
                  onPress={() => handleItemSelection(item)}
                >
                  <View style={styles.itemImageContainer}>
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                    {isItemSelected(item) && (
                      <View style={styles.selectedOverlay}>
                        <Ionicons name="checkmark-circle" size={30} color="#714463" />
                      </View>
                    )}
                    {item.isTemporary && (
                      <View style={styles.tempItemBadge}>
                        <Ionicons name="time" size={12} color="#ff8c00" />
                        <Text style={styles.tempItemBadgeText}>TEMP</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemType}>{item.type}</Text>
                    {item.class && (
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.class}</Text>
                      </View>
                    )}
                    {item.isTemporary && (
                      <TouchableOpacity
                        style={styles.removeTempButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          setTempItemToDelete(item);
                        }}
                      >
                        <Ionicons name="trash-outline" size={14} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {getSelectedCount() >= 2 && (
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzeOutfit}>
              <View style={styles.analyzeButtonContent}>
                <Ionicons name="analytics-outline" size={20} color="white" style={styles.analyzeIcon} />
                <Text style={styles.analyzeButtonText}>Analyze Outfit ({getSelectedCount()} items)</Text>
              </View>
            </TouchableOpacity>
          )}
                      
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleBackToWardrobe}
          >
            <Text style={styles.secondaryButtonText}>Back to Wardrobe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Clear Selection Modal */}
      <Modal
        visible={showClearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelClearSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clearModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="trash-outline" size={48} color="#ff4444" />
              </View>
              <Text style={styles.modalTitle}>Clear Selection</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to clear all selected items? This action cannot be undone.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={cancelClearSelection}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearModalButton]}
                onPress={confirmClearSelection}
              >
                <Ionicons name="trash" size={18} color="white" style={styles.clearButtonIcon} />
                <Text style={styles.clearModalButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Temporary Item Deletion Modal */}
      <Modal
        visible={tempItemToDelete !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTempItemToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clearModalContainer}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="time-outline" size={48} color="#ff8c00" />
              </View>
              <Text style={styles.modalTitle}>Remove Temporary Item</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove this temporary item? This action cannot be undone.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setTempItemToDelete(null)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteTempModalButton]}
                onPress={() => {
                  if (tempItemToDelete) {
                    removeTempClothingItem(tempItemToDelete.id);
                    setTempItemToDelete(null);
                  }
                }}
              >
                <Ionicons name="trash" size={18} color="white" style={styles.clearButtonIcon} />
                <Text style={styles.deleteTempModalButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add the SimpleClothPopup component */}
      <SimpleClothPopup
        isOpen={showComparePopup}
        onClose={() => setShowComparePopup(false)}
        onSubmit={handleCompareSubmit}
        isSaving={isSavingCloth}
        cloudinaryCloudName={CLOUDINARY_CLOUD_NAME}
        cloudinaryUploadPreset={CLOUDINARY_UPLOAD_PRESET}
      />

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideCustomAlert}
      />
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
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 70,
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
  summaryContainer: {
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecd6c3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8a6d2c',
  },
  addButtonText: {
    fontSize: 12,
    color: '#8a6d3c',
    fontWeight: '600',
    marginLeft: 4,
  },
  // New styles for temporary items
  tempClearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff8c00',
  },
  tempClearButtonText: {
    fontSize: 12,
    color: '#ff8c00',
    fontWeight: '600',
    marginLeft: 4,
  },
  tempBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#ff8c00',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tempBadgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  tempItemCard: {
    borderWidth: 2,
    borderColor: '#ff8c00',
    borderStyle: 'dashed',
  },
  tempItemName: {
    paddingRight: 104, // Extra padding for temporary items to avoid remove button
  },
  tempItemBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 140, 0, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempItemBadgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  tempItemsCount: {
    fontSize: 14,
    color: '#ff8c00',
    fontStyle: 'italic',
  },
  removeTempButton: {
    position: 'absolute',
    top: -30,
    right: 4,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 4,
    borderRadius: 12,
    marginRight: -2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  clearAllText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedItemsScroll: {
    marginBottom: 8,
  },
  selectedItemCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    position: 'relative',
  },
  selectedItemImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginBottom: 6,
  },
  selectedItemLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: -2,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  emptySelectionCard: {
    width: 120,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  emptySelectionText: {
    fontSize: 12,
    color: '#714463',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryButton: {
    backgroundColor: '#714463',
    borderColor: '#714463',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  itemsContainer: {
    marginBottom: 20,
    alignContent: 'center',
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItemCard2: {
    borderWidth: 2,
    borderColor: '#714463',
    backgroundColor: '#f8f4f6',
  },
  itemImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
  },
  itemInfo: {
    alignItems: 'center',
    position: 'relative',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#281b52',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  itemBadge: {
    backgroundColor: 'rgba(113, 68, 99, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  itemBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#714463',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#714463',
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  analyzeButton: {
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
  button: {
    backgroundColor: '#714463',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ecd6e5',
    borderWidth: 1,
    borderColor: '#714463',
  },
  secondaryButtonText: {
    color: '#714463',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ffe5e5',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  clearButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clearModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#281b52',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearModalButton: {
    backgroundColor: '#ff4444',
  },
  clearModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  clearButtonIcon: {
    marginRight: 4,
  },
  // Temporary item deletion modal styles
  deleteTempModalButton: {
    backgroundColor: '#ff8c00',
  },
  deleteTempModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  itemPreview: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewItemType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
