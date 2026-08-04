import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { signOut } from '../services/firebase'

export default function SettingsScreen({ navigation }: any) {
  const { logout } = useAuthStore()
  const {
    autoLockTimeout,
    biometricEnabled,
    darkModeEnabled,
    notificationsEnabled,
    setAutoLockTimeout,
    setBiometricEnabled,
    setDarkModeEnabled,
    setNotificationsEnabled,
  } = useSettingsStore()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut()
            logout()
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out')
          }
        },
      },
    ])
  }

  const handleExport = () => {
    Alert.alert('Export', 'Export your vault to a secure backup file')
  }

  const handleImport = () => {
    Alert.alert('Import', 'Import passwords from a backup file')
  }

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#8b5cf6" />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.settingRow}>
          <Ionicons name="lock-closed" size={24} color="#8b5cf6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Auto-lock Timeout</Text>
            <Text style={styles.settingSubtitle}>{autoLockTimeout} minutes</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Ionicons name="finger-print" size={24} color="#8b5cf6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Biometric Authentication</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <Ionicons name="moon" size={24} color="#8b5cf6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
          </View>
          <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} />
        </View>

        <View style={styles.settingRow}>
          <Ionicons name="notifications" size={24} color="#8b5cf6" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Notifications</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup</Text>

        <SettingRow
          icon="download"
          title="Export Vault"
          subtitle="Save encrypted backup"
          onPress={handleExport}
        />

        <SettingRow
          icon="upload"
          title="Import Vault"
          subtitle="Restore from backup"
          onPress={handleImport}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <SettingRow
          icon="information-circle"
          title="Version 2.0.0"
          subtitle="Vaultly - Secure Password Manager"
        />

        <SettingRow icon="globe" title="Website" subtitle="vaultly.app" />

        <SettingRow
          icon="mail"
          title="Support"
          subtitle="support@vaultly.app"
        />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>© 2024 Vaultly. All rights reserved.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    paddingBottom: 20,
  },
})
