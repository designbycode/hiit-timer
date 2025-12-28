import { QuickStartCard } from '@/components/QuickStartCard';
import { WorkoutCard } from '@/components/WorkoutCard';
import CustomModal from '@/components/CustomModal';
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { PRESETS } from '@/constants/presets';
import { storageService } from '@/services/storage/StorageService';
import { useWorkoutStore } from '@/store/workoutStore';
import { Workout } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
    Image
} from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUsedWorkout, setLastUsedWorkout] = useState<Workout | null>(null);
  const { setWorkout } = useWorkoutStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<any[]>([]);

  const showAlert = (title: string, message: string, buttons: any[]) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    const loadLastUsed = async () => {
      try {
        const lastUsedId = await storageService.loadLastWorkout();
        const all = [...PRESETS, ...workouts];
        if (lastUsedId) {
          const found = all.find((w) => w.id === lastUsedId);
          if (found) {
            setLastUsedWorkout(found);
            return;
          }
        }
        setLastUsedWorkout(workouts.length > 0 ? workouts[0] : PRESETS[0]);
      } catch (error) {
        setLastUsedWorkout(workouts.length > 0 ? workouts[0] : PRESETS[0]);
      }
    };
    if (!loading) {
      loadLastUsed();
    }
  }, [workouts, loading]);

  const loadWorkouts = async () => {
    try {
      const saved = await storageService.loadWorkouts();
      setWorkouts(saved);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const myWorkouts = useMemo(() => {
    return [...PRESETS, ...workouts].slice(0, 3);
  }, [workouts]);

  const handleWorkoutPress = useCallback(
    async (workout: Workout) => {
      setWorkout(workout);
      await storageService.saveLastWorkout(workout.id);
      router.push(`/workout/${workout.id}`);
    },
    [router, setWorkout]
  );

  const handleDelete = useCallback(
    async (workout: Workout) => {
      showAlert(
        'Delete Workout',
        `Are you sure you want to delete "${workout.name}"?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setModalVisible(false) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await storageService.deleteWorkout(workout.id);
              setModalVisible(false);
              loadWorkouts();
            },
          },
        ]
      );
    },
    []
  );

  const handleCreateWorkout = useCallback(() => {
    router.push('/create-workout');
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Image
                           source={require('@assets/images/icon.png')} style={{width: 80, height: 80}} />
          </View>
          <Text style={styles.title}>HIIT Timer</Text>
        </View>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#999999" />
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={myWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View layout={Layout.springify()}>
            <WorkoutCard
              workout={item}
              onPress={() => handleWorkoutPress(item)}
              onDelete={() => handleDelete(item)}
            />
          </Animated.View>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.readyText}>Ready to Train?</Text>
            {lastUsedWorkout && (
              <QuickStartCard
                workout={lastUsedWorkout}
                onPress={() => handleWorkoutPress(lastUsedWorkout)}
              />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Workouts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateWorkout}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.dark.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.dark.text,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  readyText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.dark.text,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark.primary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
