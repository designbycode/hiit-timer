import { QuickStartCard } from '@/components/QuickStartCard';
import { WorkoutCard } from '@/components/WorkoutCard';
import { PRESETS } from '@/constants/presets';
import { storageService } from '@/services/storage/StorageService';
import { useWorkoutStore } from '@/store/workoutStore';
import { Workout } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
    Image
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUsedWorkout, setLastUsedWorkout] = useState<Workout | null>(null);
  const { setWorkout } = useWorkoutStore();

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
      Alert.alert(
        'Delete Workout',
        `Are you sure you want to delete "${workout.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await storageService.deleteWorkout(workout.id);
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {myWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onPress={() => handleWorkoutPress(workout)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreateWorkout}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    // backgroundColor: '#FF9800',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  readyText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
