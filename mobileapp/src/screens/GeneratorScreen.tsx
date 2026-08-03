import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const generatePassword = (options: any) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let chars = ''
  if (options.uppercase) chars += uppercase
  if (options.lowercase) chars += lowercase
  if (options.numbers) chars += numbers
  if (options.special) chars += special

  if (!chars) chars = lowercase

  let password = ''
  for (let i = 0; i < options.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function GeneratorScreen() {
  const [length, setLength] = useState('16')
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [special, setSpecial] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    regenerate()
  }, [])

  const regenerate = () => {
    const pwd = generatePassword({
      length: parseInt(length) || 16,
      uppercase,
      lowercase,
      numbers,
      special,
    })
    setPassword(pwd)
  }

  const copyToClipboard = () => {
    // In real app: Clipboard.setString(password)
    alert('Password copied to clipboard')
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.passwordDisplay}>
          <Text style={styles.passwordText}>{password}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Ionicons name="copy" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.regenerateButton} onPress={regenerate}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.regenerateButtonText}>Generate New</Text>
        </TouchableOpacity>

        <View style={styles.options}>
          <Text style={styles.optionsTitle}>Options</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Length: {length}</Text>
            <TextInput
              style={styles.input}
              value={length}
              onChangeText={setLength}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Uppercase (A-Z)</Text>
            <Switch value={uppercase} onValueChange={setUppercase} />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Lowercase (a-z)</Text>
            <Switch value={lowercase} onValueChange={setLowercase} />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Numbers (0-9)</Text>
            <Switch value={numbers} onValueChange={setNumbers} />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Special (!@#$...)</Text>
            <Switch value={special} onValueChange={setSpecial} />
          </View>
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
    padding: 16,
  },
  passwordDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  passwordText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#8b5cf6',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  regenerateButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  options: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
})
