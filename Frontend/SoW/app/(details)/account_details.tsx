// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { getAuth, updateProfile } from 'firebase/auth';
// import { app } from '../../firebaseConfig';
// import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
// import LoadingAnimation from '../../components/loading_ani';

// const auth = getAuth(app);
// const CLOUDINARY_URL = "cloudinary://258546172366246:TvdBDuunxGyrEYaJwVE2QlbeMXo@dudzs3nys";
// const UPLOAD_PRESET = "profile";

// export default function AccountDetails() {
//   const [name, setName] = useState<string>('');
//   const [email, setEmail] = useState<string>('');
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [bannerImage, setBannerImage] = useState<string | null>(null);
//   const [isDetailsLoading, setIsDetailsLoading] = useState(true);
//   const auth = getAuth(app);
//   const userId = auth.currentUser?.uid;

//   useEffect(() => {
//     if (userId) {
//       const db = getFirestore(app);
//       const userRef = doc(db, 'users', userId);
      
//       const unsubscribe = onSnapshot(userRef, (doc) => {
//         if (doc.exists()) {
//           const userData = doc.data();
//           setName(userData.name);
//           setEmail(userData.email);
//           setIsDetailsLoading(false);
//         }
//       });

//       return () => unsubscribe();
//     }
//   }, [userId]);

//   const uploadImageToCloudinary = async (uri: string): Promise<string | null> => {
//     const formData = new FormData();
//     const fileType = uri.substring(uri.lastIndexOf(".") + 1);
    
//     formData.append('file', {
//       uri,
//       type: `image/${fileType}`,
//       name: `upload.${fileType}`,
//     } as any);
    
//     formData.append('upload_preset', UPLOAD_PRESET);

//     try {
//       const response = await fetch(CLOUDINARY_URL, {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await response.json();
//       return data.secure_url;
//     } catch (error) {
//       console.error('Upload error:', error);
//       return null;
//     }
//   };

//   const pickImage = async (type: 'profile' | 'banner') => {
//       const result = await ImagePicker.launchImageLibraryAsync({
//           mediaTypes: ImagePicker.MediaTypeOptions.Images,
//           allowsEditing: true,
//           aspect: type === 'profile' ? [1, 1] : [16, 9],
//           quality: 1,
//       });

//       if (!result.canceled) {
//           const uri = result.assets[0].uri;
//           const uploadUrl = await uploadImageToCloudinary(uri);

//           if (uploadUrl && userId) {
//               const db = getFirestore(app);
//               const userRef = doc(db, 'users', userId);

//               if (type === 'profile') {
//                   setProfileImage(uploadUrl);
//                   await updateDoc(userRef, {
//                       profileImageUrl: uploadUrl
//                   });
//                   if (auth.currentUser) {
//                       await updateProfile(auth.currentUser, {
//                           photoURL: uploadUrl
//                       });
//                   }
//               } else {
//                   setBannerImage(uploadUrl);
//                   await updateDoc(userRef, {
//                       bannerImageUrl: uploadUrl
//                   });
//               }
//           }
//       }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         style={styles.bannerContainer}
//         onPress={() => pickImage('banner')}
//       >
//         {bannerImage ? (
//           <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
//         ) : (
//           <View style={styles.defaultBanner}>
//             <Ionicons name="image-outline" size={30} color="#714463" />
//             <Text style={styles.uploadText}>Upload Banner</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       <View style={styles.profileSection}>
//         <TouchableOpacity 
//           style={styles.profileImageContainer}
//           onPress={() => pickImage('profile')}
//         >
//           {profileImage ? (
//             <Image source={{ uri: profileImage }} style={styles.profileImage} />
//           ) : (
//             <View style={styles.defaultProfile}>
//               <Ionicons name="person" size={40} color="#714463" />
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       {isDetailsLoading ? (
//       <View style={styles.loadingContainer}>
//         <LoadingAnimation />
//       </View>
      
// ) : (
//   <View style={styles.detailsContainer}>
//     <View style={styles.detailItem}>
//       <Ionicons name="person-outline" size={24} color="#714463" />
//       <Text style={styles.detailLabel}>Name</Text>
//       <Text style={styles.detailValue}>{name}</Text>
//     </View>

//     <View style={styles.detailItem}>
//       <Ionicons name="mail-outline" size={24} color="#714463" />
//       <Text style={styles.detailLabel}>Email</Text>
//       <Text style={styles.detailValue}>{email}</Text>
//     </View>

//     <View style={styles.detailItem}>
//       <Ionicons name="lock-closed-outline" size={24} color="#714463" />
//       <Text style={styles.detailLabel}>Password</Text>
//       <Text style={styles.detailValue}>••••••••</Text>
//     </View>
//   </View>
// )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   bannerContainer: {
//     height: 200,
//     width: '100%',
//   },
//   bannerImage: {
//     height: '100%',
//     width: '100%',
//     resizeMode: 'cover',
//   },
//   defaultBanner: {
//     height: '100%',
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   uploadText: {
//     color: '#714463',
//     marginTop: 8,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginTop: -50,
//   },
//   profileImageContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//     borderColor: '#fff',
//     overflow: 'hidden',
//     backgroundColor: '#f0f0f0',
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//   },
//   defaultProfile: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   detailsContainer: {
//     padding: 20,
//     marginTop: 20,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   detailLabel: {
//     marginLeft: 15,
//     fontSize: 16,
//     color: '#666',
//     width: 80,
//   },
//   detailValue: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'right',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     zIndex: 1000
//   }
// });

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { getAuth, updateProfile } from 'firebase/auth';
// import { app } from '../../firebaseConfig';
// import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
// import LoadingAnimation from '../../components/loading_ani';
// import { router } from 'expo-router';

// const auth = getAuth(app);
// const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dudzs3nys/image/upload";
// const UPLOAD_PRESET = "profile";

// export default function AccountDetails() {
//   const [name, setName] = useState<string>('');
//   const [email, setEmail] = useState<string>('');
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [bannerImage, setBannerImage] = useState<string | null>(null);
//   const [isDetailsLoading, setIsDetailsLoading] = useState(true);
//   const [isUploading, setIsUploading] = useState(false);
//   const userId = auth.currentUser?.uid;

//   useEffect(() => {
//     if (userId) {
//       const db = getFirestore(app);
//       const userRef = doc(db, 'users', userId);
      
//       const unsubscribe = onSnapshot(userRef, (doc) => {
//         if (doc.exists()) {
//           const userData = doc.data();
//           setName(userData.name);
//           setEmail(userData.email);
//           setProfileImage(userData.profileImageUrl || null);
//           setBannerImage(userData.bannerImageUrl || null);
//           setIsDetailsLoading(false);
//         }
//       });

//       return () => unsubscribe();
//     }
//   }, [userId]);

//   const uploadImageToCloudinary = async (uri: string, type: 'profile' | 'banner'): Promise<string | null> => {
//     const formData = new FormData();
    
//     formData.append('file', {
//       uri: uri,
//       type: 'image/jpeg',
//       name: `${type}_upload.jpg`
//     } as any);
    
//     formData.append('upload_preset', UPLOAD_PRESET);
//     formData.append('cloud_name', 'dudzs3nys');

//     try {
//       const response = await fetch(CLOUDINARY_URL, {
//         method: 'POST',
//         body: formData
//       });

//       const cloudinaryData = await response.json();
//       return cloudinaryData.secure_url;
//     } catch (error) {
//       console.error('Upload failed:', error);
//       return null;
//     }
//   };

//   const pickImage = async (type: 'profile' | 'banner') => {
//     if (!userId) return;

//     setIsUploading(true);
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: type === 'profile' ? [1, 1] : [16, 9],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         const uri = result.assets[0].uri;
//         const imageUrl = await uploadImageToCloudinary(uri, type);

//         if (imageUrl) {
//           const db = getFirestore(app);
//           const userRef = doc(db, 'users', userId);

//           if (type === 'profile') {
//             setProfileImage(imageUrl);
//             await updateDoc(userRef, {
//               profileImageUrl: imageUrl
//             });
//             if (auth.currentUser) {
//               await updateProfile(auth.currentUser, {
//                 photoURL: imageUrl
//               });
//             }
//           } else {
//             setBannerImage(imageUrl);
//             await updateDoc(userRef, {
//               bannerImageUrl: imageUrl
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Image picking failed:', error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const navigateToUpdateProfile = () => {
//     router.push('/(details)/appearances_show');
//   };

//   return (
//     <View style={styles.container}>
//           <TouchableOpacity 
//       style={styles.backButton}
//       onPress={handleBack}
//     >
//       <Ionicons name="arrow-back" size={24} color="#714463" />
//     </TouchableOpacity>
//       {isUploading && (
//         <View style={styles.loadingOverlay}>
//           <LoadingAnimation />
//         </View>
//       )}

//       <TouchableOpacity 
//         style={styles.bannerContainer}
//         onPress={() => pickImage('banner')}
//       >
//         {bannerImage ? (
//           <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
//         ) : (
//           <View style={styles.defaultBanner}>
//             <Ionicons name="image-outline" size={30} color="#714463" />
//             <Text style={styles.uploadText}>Upload Banner</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       <View style={styles.profileSection}>
//         <TouchableOpacity 
//           style={styles.profileImageContainer}
//           onPress={() => pickImage('profile')}
//         >
//           {profileImage ? (
//             <Image source={{ uri: profileImage }} style={styles.profileImage} />
//           ) : (
//             <View style={styles.defaultProfile}>
//               <Ionicons name="person" size={40} color="#714463" />
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>
//       {isDetailsLoading ? (
//         <View style={styles.loadingContainer}>
//           <LoadingAnimation />
//         </View>
//       ) : (
//         <View style={styles.detailsContainer}>
//           <View style={styles.detailItem}>
//             <Ionicons name="person-outline" size={24} color="#714463" />
//             <Text style={styles.detailLabel}>Name</Text>
//             <Text style={styles.detailValue}>{name}</Text>
//           </View>

//           <View style={styles.detailItem}>
//             <Ionicons name="mail-outline" size={24} color="#714463" />
//             <Text style={styles.detailLabel}>Email</Text>
//             <Text style={styles.detailValue}>{email}</Text>
//           </View>

//           <View style={styles.detailItem}>
//             <Ionicons name="lock-closed-outline" size={24} color="#714463" />
//             <Text style={styles.detailLabel}>Password</Text>
//             <Text style={styles.detailValue}>••••••••</Text>
//           </View>
//           <View style={styles.detailItem}>
//             <Ionicons name="information-circle-outline" size={24} color="#714463" />
//             <Text style={styles.detailLabel}>Basic Info</Text>
//             <TouchableOpacity onPress={navigateToUpdateProfile}>
//               <Text style={styles.detailValue_1 }>View</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
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
//   bannerContainer: {
//     height: 200,
//     width: '100%',
//   },
//   bannerImage: {
//     height: '100%',
//     width: '100%',
//     resizeMode: 'cover',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 1000,
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   defaultBanner: {
//     height: '100%',
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   uploadText: {
//     color: '#714463',
//     marginTop: 8,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginTop: -50,
//   },
//   profileImageContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//     borderColor: '#fff',
//     overflow: 'hidden',
//     backgroundColor: '#f0f0f0',
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//   },
//   defaultProfile: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   detailsContainer: {
//     padding: 20,
//     marginTop: 20,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   detailLabel: {
//     marginLeft: 15,
//     fontSize: 16,
//     color: '#666',
//     width: 80,
//   },
//   detailValue: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'right',
//   },
//   detailValue_1: {
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'left',
//     marginLeft: 155,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     zIndex: 1000
//   },
//   updateProfileText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   }
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import LoadingAnimation from '../../components/loading_ani';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { sha256 } from 'js-sha256'; // You'll need to install this: npm install js-sha256

const auth = getAuth(app);
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dudzs3nys/image/upload";
const UPLOAD_PRESET = "profile";
const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}profile_cache/`;

export default function AccountDetails() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const userId = auth.currentUser?.uid;
  const [cachedProfileImage, setCachedProfileImage] = useState<string | null>(null);
  const [cachedBannerImage, setCachedBannerImage] = useState<string | null>(null);

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

  // Function to get cached image or download and cache it
  const getCachedImage = async (imageUrl: string, imageType: 'profile' | 'banner'): Promise<string> => {
    if (!imageUrl) return '';
    
    try {
      // Create a unique filename based on the URL and type
      const filename = `${imageType}_${sha256(imageUrl)}.jpg`;
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

  useEffect(() => {
    if (userId) {
      const db = getFirestore(app);
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setName(userData.name);
          setEmail(userData.email);
          
          // Set the original URLs
          setProfileImage(userData.profileImageUrl || null);
          setBannerImage(userData.bannerImageUrl || null);
          
          // Cache the images if they exist
          if (userData.profileImageUrl) {
            const cachedUrl = await getCachedImage(userData.profileImageUrl, 'profile');
            setCachedProfileImage(cachedUrl);
          }
          
          if (userData.bannerImageUrl) {
            const cachedUrl = await getCachedImage(userData.bannerImageUrl, 'banner');
            setCachedBannerImage(cachedUrl);
          }
          
          setIsDetailsLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  const uploadImageToCloudinary = async (uri: string, type: 'profile' | 'banner'): Promise<string | null> => {
    const formData = new FormData();
    
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: `${type}_upload.jpg`
    } as any);
    
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', 'dudzs3nys');

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      const cloudinaryData = await response.json();
      return cloudinaryData.secure_url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const pickImage = async (type: 'profile' | 'banner') => {
    if (!userId) return;

    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const imageUrl = await uploadImageToCloudinary(uri, type);

        if (imageUrl) {
          const db = getFirestore(app);
          const userRef = doc(db, 'users', userId);

          if (type === 'profile') {
            setProfileImage(imageUrl);
            
            // Cache the new profile image
            const cachedUrl = await getCachedImage(imageUrl, 'profile');
            setCachedProfileImage(cachedUrl);
            
            await updateDoc(userRef, {
              profileImageUrl: imageUrl
            });
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, {
                photoURL: imageUrl
              });
            }
          } else {
            setBannerImage(imageUrl);
            
            // Cache the new banner image
            const cachedUrl = await getCachedImage(imageUrl, 'banner');
            setCachedBannerImage(cachedUrl);
            
            await updateDoc(userRef, {
              bannerImageUrl: imageUrl
            });
          }
          
          // Clean up old cached images
          if (type === 'profile' && profileImage) {
            try {
              const oldCachedPath = `${IMAGE_CACHE_FOLDER}profile_${sha256(profileImage)}.jpg`;
              const fileInfo = await FileSystem.getInfoAsync(oldCachedPath);
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(oldCachedPath, { idempotent: true });
              }
            } catch (error) {
              console.error('Error deleting old cached image:', error);
            }
          } else if (type === 'banner' && bannerImage) {
            try {
              const oldCachedPath = `${IMAGE_CACHE_FOLDER}banner_${sha256(bannerImage)}.jpg`;
              const fileInfo = await FileSystem.getInfoAsync(oldCachedPath);
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(oldCachedPath, { idempotent: true });
              }
            } catch (error) {
              console.error('Error deleting old cached image:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Image picking failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const navigateToUpdateProfile = () => {
    router.push('/(details)/appearances_show');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={24} color="#714463" />
      </TouchableOpacity>
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      )}

      <TouchableOpacity 
        style={styles.bannerContainer}
        onPress={() => pickImage('banner')}
      >
        {bannerImage ? (
          <Image source={{ uri: cachedBannerImage || bannerImage }} style={styles.bannerImage} />
        ) : (
          <View style={styles.defaultBanner}>
            <Ionicons name="image-outline" size={30} color="#714463" />
            <Text style={styles.uploadText}>Upload Banner</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={() => pickImage('profile')}
        >
          {profileImage ? (
            <Image source={{ uri: cachedProfileImage || profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfile}>
              <Ionicons name="person" size={40} color="#714463" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      {isDetailsLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={24} color="#714463" />
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={24} color="#714463" />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{email}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#714463" />
            <Text style={styles.detailLabel}>Password</Text>
            <Text style={styles.detailValue}>••••••••</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="information-circle-outline" size={24} color="#714463" />
            <Text style={styles.detailLabel}>Basic Info</Text>
            <TouchableOpacity onPress={navigateToUpdateProfile}>
              <Text style={styles.detailValue_1 }>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  bannerContainer: {
    height: 200,
    width: '100%',
  },
  bannerImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  defaultBanner: {
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#714463',
    marginTop: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultProfile: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  detailsContainer: {
    padding: 20,
    marginTop: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#666',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  detailValue_1: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    marginLeft: 155,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000
  },
  updateProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});
