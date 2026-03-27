import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface WardrobeItem {
    id: string;
    imageUrl: string;
    label: string;
    brand: string;
    category: string;
}

export default function SelectPlannerItemScreen() {
    const { day } = useLocalSearchParams();
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Track selected top and bottom
    const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null);
    const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null);

    // Which category we are currently picking
    const [currentTab, setCurrentTab] = useState<'top' | 'bottom'>('top');

    const auth = getAuth();
    const db = getFirestore(app);

    useEffect(() => {
        fetchWardrobeItems();
    }, []);

    const fetchWardrobeItems = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                router.replace('/(auth)/accounts');
                return;
            }

            const wardrobeRef = collection(db, 'users', user.uid, 'wardrobe');
            const querySnapshot = await getDocs(wardrobeRef);

            const fetchedItems: WardrobeItem[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                let normalizedCategory = 'other';
                const itemType = (data.type || '').toLowerCase();

                if (itemType.includes('top') || itemType.includes('outerwear')) {
                    normalizedCategory = 'top';
                } else if (itemType.includes('bottom')) {
                    normalizedCategory = 'bottom';
                }

                fetchedItems.push({
                    id: doc.id,
                    imageUrl: data.imageUrl || '',
                    label: data.class || data.label || 'Unknown Item',
                    brand: data.brand || 'Unknown Brand',
                    category: normalizedCategory
                });
            });

            setItems(fetchedItems);
        } catch (error) {
            console.error('Error fetching wardrobe items:', error);
            Alert.alert('Error', 'Failed to load your wardrobe.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleItem = (item: WardrobeItem) => {
        if (currentTab === 'top') {
            setSelectedTop(selectedTop?.id === item.id ? null : item);
        } else {
            setSelectedBottom(selectedBottom?.id === item.id ? null : item);
        }
    };

    const handleSaveOutfit = async () => {
        if (!selectedTop || !selectedBottom) {
            Alert.alert('Incomplete Outfit', 'Please select both a Top and a Bottom to save this outfit.');
            return;
        }

        if (!day || Array.isArray(day)) {
            Alert.alert('Error', 'Invalid day selected.');
            return;
        }

        try {
            setSaving(true);
            const user = auth.currentUser;
            if (!user) return;

            const plannedOutfit = {
                top: {
                    id: selectedTop.id,
                    imageUrl: selectedTop.imageUrl,
                    name: `${selectedTop.brand} ${selectedTop.label}`
                },
                bottom: {
                    id: selectedBottom.id,
                    imageUrl: selectedBottom.imageUrl,
                    name: `${selectedBottom.brand} ${selectedBottom.label}`
                }
            };

            const planDocRef = doc(db, 'users', user.uid, 'planner', 'weekly');
            await setDoc(planDocRef, {
                [day]: plannedOutfit
            }, { merge: true });

            router.back();
        } catch (error) {
            console.error('Error saving planned outfit:', error);
            Alert.alert('Error', 'Failed to save outfit to your plan.');
        } finally {
            setSaving(false);
        }
    };

    // Filter items based on current tab. Show 'other/unknown' in both tabs.
    const displayedItems = items.filter(item => item.category === currentTab || item.category === 'other');

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#714463" />
                <Text style={styles.loadingText}>Loading wardrobe...</Text>
            </View>
        );
    }

    if (saving) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#714463" />
                <Text style={styles.loadingText}>Saving to planner...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Plan for {day}</Text>

                <TouchableOpacity
                    style={[styles.saveButton, (!selectedTop || !selectedBottom) && styles.saveButtonDisabled]}
                    onPress={handleSaveOutfit}
                    disabled={!selectedTop || !selectedBottom}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, currentTab === 'top' && styles.activeTab]}
                    onPress={() => setCurrentTab('top')}
                >
                    <Text style={[styles.tabText, currentTab === 'top' && styles.activeTabText]}>
                        1. Select Top {selectedTop && '✓'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, currentTab === 'bottom' && styles.activeTab]}
                    onPress={() => setCurrentTab('bottom')}
                >
                    <Text style={[styles.tabText, currentTab === 'bottom' && styles.activeTabText]}>
                        2. Select Bottom {selectedBottom && '✓'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>

                {displayedItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="shirt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No {currentTab}s found.</Text>
                        <Text style={styles.emptySubText}>Try adding more items to your wardrobe.</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {displayedItems.map((item) => {
                            const isSelected = currentTab === 'top' ? selectedTop?.id === item.id : selectedBottom?.id === item.id;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                                    onPress={() => handleToggleItem(item)}
                                >
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.itemImage}
                                        resizeMode="cover"
                                    />
                                    {isSelected && (
                                        <View style={styles.checkmarkOverlay}>
                                            <Ionicons name="checkmark-circle" size={32} color="#fff" />
                                        </View>
                                    )}
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemBrand} numberOfLines={1}>{item.brand}</Text>
                                        <Text style={styles.itemLabel} numberOfLines={1}>{item.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Persistent Selection Footer */}
            <View style={styles.selectionFooter}>
                <Text style={styles.footerText}>
                    {selectedTop && selectedBottom
                        ? 'Ready to save!'
                        : (!selectedTop && !selectedBottom)
                            ? 'Select a top and bottom'
                            : !selectedTop
                                ? 'Now select a top'
                                : 'Now select a bottom'
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4e9de',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4e9de',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#714463',
    },
    header: {
        backgroundColor: '#401730',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#rgba(255,255,255,0.3)',
    },
    saveButtonText: {
        color: '#401730',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#714463',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    activeTabText: {
        color: '#714463',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    gridItemSelected: {
        borderColor: '#714463',
    },
    checkmarkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: 'rgba(113, 68, 99, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    itemDetails: {
        padding: 10,
    },
    itemBrand: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemLabel: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    selectionFooter: {
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#714463',
    }
});
