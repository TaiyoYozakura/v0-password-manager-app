import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '../../stores/settingsStore'

export default function MasterPinSetupScreen({ navigation }: any) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const { setMasterPinEnabled, setMasterPin } = useSettingsStore()

  const handleSetup = () => {
    if (!pin || pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits')
      return
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match')
      return
    }

    setMasterPin(pin)
    setMasterPinEnabled(true)
    Alert.alert('Success', 'Master PIN set successfully')
    navigation.reset({
      index: 0,
      routes: [{ name: 'VaultStack' }],
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={64} color="#8b5cf6" style={styles.icon} />
        <Text style={styles.title}>Set Master PIN</Text>
        <Text style={styles.subtitle}>
          Create a secure PIN to protect your vault
        </Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enter PIN (4+ digits)</Text>
            <View style={styles.pinContainer}>
              <TextInput
                style={styles.pinInput}
                placeholder="••••"
                value={pin}
                onChangeText={setPin}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                <Ionicons
                  name={showPin ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm PIN</Text>
            <View style={styles.pinContainer}>
              <TextInput
                style={styles.pinInput}
                placeholder="••••"
                value={confirmPin}
                onChangeText={setConfirmPin}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>PIN Tips:</Text>
            <Text style={styles.tip}>• Use at least 4 digits</Text>
            <Text style={styles.tip}>• Avoid easily guessable numbers</Text>
            <Text style={styles.tip}>• You will use this PIN to unlock your vault</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSetup}>
            <Text style={styles.buttonText}>Set Master PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 320,
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
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  pinInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    color: '#333',
  },
  tips: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  tip: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
