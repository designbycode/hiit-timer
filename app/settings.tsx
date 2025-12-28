import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const {
    soundEnabled,
    vibrationEnabled,
    voiceEnabled,
    toggleSound,
    toggleVibration,
    toggleVoice,
    loadSettings,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
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
});

