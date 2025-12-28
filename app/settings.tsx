import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '@/libs/store/settingsStore';
import { useButtonSound } from '@/libs/hooks/useButtonSound';

export default function SettingsScreen() {
  const {
    soundEnabled,
    vibrationEnabled,
    voiceEnabled,
    soundVolume,
    setSoundVolume,
    toggleSound,
    toggleVibration,
    toggleVoice,
    loadSettings,
  } = useSettingsStore();
  const { handlePressIn } = useButtonSound();

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        await loadSettings();
        // Settings loaded successfully
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    loadUserSettings();
  }, [loadSettings]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Alerts</Text>

        <View style={styles.setting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={styles.settingDescription}>
              Play sound alerts at phase changes
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>
              Vibrate at phase changes
            </Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={toggleVibration}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Voice Cues</Text>
            <Text style={styles.settingDescription}>
              Announce phase changes and countdown
            </Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={toggleVoice}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.setting, { alignItems: 'flex-start' }]}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Sound Volume</Text>
            <Text style={styles.settingDescription}>
              Adjust alert volume
            </Text>
            <View style={styles.volumeRow}>
              {[
                { label: 'Low', value: 0.3 },
                { label: 'Med', value: 0.6 },
                { label: 'High', value: 1.0 },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.volumeOption,
                    Math.abs(soundVolume - opt.value) < 0.05 && styles.volumeOptionActive,
                  ]}
                  onPress={() => setSoundVolume(opt.value)}
                  onPressIn={handlePressIn}
                >
                  <Text style={styles.volumeOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.volumePercent}>{Math.round(soundVolume * 100)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  volumeOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F8F8F8',
  },
  volumeOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  volumeOptionText: {
    color: '#000',
    fontWeight: '600',
  },
  volumePercent: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '600',
  }
});

