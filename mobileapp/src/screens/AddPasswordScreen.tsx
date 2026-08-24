import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVaultStore } from '../stores/vaultStore'
import { useAuthStore } from '../stores/authStore'
import { createPassword } from '../services/firebase'
import { v4 as uuidv4 } from 'uuid'

export default function AddPasswordScreen({ navigation }: any) {
  const [siteName, setSiteName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [tag, setTag] = useState('Other')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { addPassword } = useVaultStore()
  const { user } = useAuthStore()

  const handleSave = async () => {
    if (!siteName.trim() || !password.trim()) {
      Alert.alert('Error', 'Site name and password are required')
      return
    }

    if (!user) {
      Alert.alert('Error', 'Not authenticated')
      return
    }

    setLoading(true)
    try {
      const newPassword = {
        id: uuidv4(),
        siteName: siteName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        notes: notes.trim(),
        tag,
        tagIconUrl: null as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await createPassword(user.uid, newPassword as any)
      addPassword(newPassword as any)
      Alert.alert('Success', 'Password saved')
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', 'Failed to save password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Site / App Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Gmail"
            value={siteName}
            onChangeText={setSiteName}
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Your username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#ccc"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#ccc"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tag</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Work, Personal"
            value={tag}
            onChangeText={setTag}
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#ccc"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Password</Text>
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
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})
