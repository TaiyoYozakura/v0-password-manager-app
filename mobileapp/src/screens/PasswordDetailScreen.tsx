import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVaultStore } from '../stores/vaultStore'
import { useAuthStore } from '../stores/authStore'
import { deletePassword } from '../services/firebase'

export default function PasswordDetailScreen({ route, navigation }: any) {
  const { id } = route.params
  const { passwords, deletePassword: deleteLocal } = useVaultStore()
  const { user } = useAuthStore()
  const [password, setPassword] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const pwd = passwords.find((p) => p.id === id)
    setPassword(pwd)
  }, [id, passwords])

  const handleDelete = () => {
    Alert.alert('Delete Password', 'Are you sure you want to delete this password?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          if (!user || !password) return

          setLoading(true)
          try {
            await deletePassword(user.uid, password.id)
            deleteLocal(password.id)
            Alert.alert('Success', 'Password deleted')
            navigation.goBack()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete password')
          } finally {
            setLoading(false)
          }
        },
        style: 'destructive',
      },
    ])
  }

  const copyToClipboard = (text: string, label: string) => {
    // In real app: Clipboard.setString(text)
    Alert.alert('Copied', `${label} copied to clipboard`)
  }

  if (!password) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  const FieldRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValue}>{value || '—'}</Text>
        {value && (
          <TouchableOpacity onPress={() => copyToClipboard(value, label)}>
            <Ionicons name="copy" size={18} color="#8b5cf6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tagBadge}>
          <Ionicons name="lock" size={32} color="#fff" />
        </View>
        <Text style={styles.siteName}>{password.siteName}</Text>
        <Text style={styles.tag}>{password.tag}</Text>
      </View>

      <View style={styles.content}>
        {password.username && <FieldRow label="Username" value={password.username} />}

        {password.email && <FieldRow label="Email" value={password.email} />}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>
              {showPassword ? password.password : '••••••••••••'}
            </Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color="#8b5cf6"
              />
            </TouchableOpacity>
          </View>
        </View>

        {password.notes && <FieldRow label="Notes" value={password.notes} />}

        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Created: {new Date(password.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.metadataText}>
            Updated: {new Date(password.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Password</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tagBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  siteName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  tag: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  field: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  metadata: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})
