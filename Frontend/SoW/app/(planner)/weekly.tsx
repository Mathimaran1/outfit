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
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PlannedItem {
    id: string;
    imageUrl: string;
    name: string;
}

interface DayOutfit {
    top: PlannedItem | null;
    bottom: PlannedItem | null;
}

interface WeeklyPlan {
    [day: string]: DayOutfit | null;
}

const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WeeklyPlannerScreen() {
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const auth = getAuth();
    const db = getFirestore(app);

    useEffect(() => {
        fetchWeeklyPlan();
    }, []);

    const fetchWeeklyPlan = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                router.replace('/(auth)/accounts');
                return;
            }

            const planDocRef = doc(db, 'users', user.uid, 'planner', 'weekly');
            const planDoc = await getDoc(planDocRef);

            if (planDoc.exists()) {
                setWeeklyPlan(planDoc.data() as WeeklyPlan);
            } else {
                const initialPlan: WeeklyPlan = {};
                DAYS_OF_WEEK.forEach(day => {
                    initialPlan[day] = null;
                });
                setWeeklyPlan(initialPlan);
            }
        } catch (error) {
            console.error('Error fetching weekly plan:', error);
            Alert.alert('Error', 'Failed to load your outfit plan.');
        } finally {
            setLoading(false);
        }
    };

    const handleDayPress = (day: string) => {
        router.push({
            pathname: '/(planner)/select_item',
            params: { day }
        });
    };

    const handleClearDay = async (day: string) => {
        try {
            setSaving(true);
            const user = auth.currentUser;
            if (!user) return;

            const newPlan = { ...weeklyPlan, [day]: null };
            setWeeklyPlan(newPlan);

            const planDocRef = doc(db, 'users', user.uid, 'planner', 'weekly');
            await setDoc(planDocRef, newPlan, { merge: true });

        } catch (error) {
            console.error('Error clearing day:', error);
            Alert.alert('Error', 'Failed to remove outfit from plan.');
            fetchWeeklyPlan();
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#714463" />
                <Text style={styles.loadingText}>Loading planner...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Weekly Planner</Text>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>Tap a day to plan your Top and Bottom</Text>

                {DAYS_OF_WEEK.map((day) => (
                    <View key={day} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayText}>{day}</Text>
                            {weeklyPlan[day]?.top && weeklyPlan[day]?.bottom && (
                                <TouchableOpacity onPress={() => handleClearDay(day)} disabled={saving}>
                                    <Ionicons name="trash-outline" size={20} color="#714463" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {weeklyPlan[day]?.top && weeklyPlan[day]?.bottom ? (
                            <View style={styles.plannedOutfitContainer}>
                                {/* Top Item */}
                                <View style={styles.outfitHalf}>
                                    <Text style={styles.outfitCategory}>Top</Text>
                                    <Image
                                        source={{ uri: weeklyPlan[day]?.top?.imageUrl }}
                                        style={styles.outfitImageSmall}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.outfitNameSmall} numberOfLines={1}>
                                        {weeklyPlan[day]?.top?.name}
                                    </Text>
                                </View>

                                {/* Divider */}
                                <View style={styles.verticalDivider} />

                                {/* Bottom Item */}
                                <View style={styles.outfitHalf}>
                                    <Text style={styles.outfitCategory}>Bottom</Text>
                                    <Image
                                        source={{ uri: weeklyPlan[day]?.bottom?.imageUrl }}
                                        style={styles.outfitImageSmall}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.outfitNameSmall} numberOfLines={1}>
                                        {weeklyPlan[day]?.bottom?.name}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.changeOverlayButton}
                                    onPress={() => handleDayPress(day)}
                                >
                                    <Ionicons name="pencil" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.emptySlot}
                                onPress={() => handleDayPress(day)}
                            >
                                <Ionicons name="add-circle-outline" size={32} color="#8a6d3b" />
                                <Text style={styles.emptySlotText}>Assign Top & Bottom</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: '#714463',
        marginBottom: 20,
        textAlign: 'center',
    },
    dayCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    dayText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#281b56',
    },
    emptySlot: {
        height: 100,
        borderWidth: 2,
        borderColor: '#e8ccb9',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fffcf9',
    },
    emptySlotText: {
        marginTop: 8,
        color: '#8a6d3b',
        fontWeight: '600',
    },
    plannedOutfitContainer: {
        flexDirection: 'row',
        backgroundColor: '#fffcf9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e8ccb9',
        position: 'relative',
        overflow: 'hidden',
    },
    outfitHalf: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: '#e8ccb9',
    },
    outfitCategory: {
        fontSize: 12,
        color: '#999',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    outfitImageSmall: {
        width: 60,
        height: 60,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        marginBottom: 6,
    },
    outfitNameSmall: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
    },
    changeOverlayButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(113, 68, 99, 0.7)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
