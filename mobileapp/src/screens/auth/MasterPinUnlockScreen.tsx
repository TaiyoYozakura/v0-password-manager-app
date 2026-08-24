import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSettingsStore } from '../../stores/settingsStore'

export default function MasterPinUnlockScreen({ navigation }: any) {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { masterPin } = useSettingsStore()

  const handleUnlock = () => {
    if (pin === masterPin) {
      setPin('')
      Keyboard.dismiss()
      navigation.reset({
        index: 0,
        routes: [{ name: 'VaultStack' }],
      })
    } else {
      setAttempts(attempts + 1)
      setPin('')
      Alert.alert('Incorrect PIN', `You have ${3 - attempts} attempts left`)

      if (attempts >= 2) {
        // After 3 failed attempts, sign out
        Alert.alert('Locked', 'Too many failed attempts. Please sign in again.')
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={80} color="#8b5cf6" style={styles.icon} />
        <Text style={styles.title}>Unlock Vault</Text>
        <Text style={styles.subtitle}>Enter your Master PIN</Text>

        <View style={styles.pinInputContainer}>
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={!showPin}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)}>
              <Ionicons
                name={showPin ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUnlock}
          disabled={pin.length === 0}
        >
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>

        <Text style={styles.attemptsText}>
          Attempts remaining: {3 - attempts}
        </Text>

        <View style={styles.numpad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numpadButton}
              onPress={() => setPin(pin + num.toString())}
            >
              <Text style={styles.numpadText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.numpadButton}
            onPress={() => setPin(pin.slice(0, -1))}
          >
            <Ionicons name="backspace" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  pinInputContainer: {
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    paddingHorizontal: 24,
    minWidth: 240,
    height: 60,
  },
  pinInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  attemptsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  numpadButton: {
    width: '33.33%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  numpadText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
})
