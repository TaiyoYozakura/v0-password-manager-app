import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { useAuthStore } from '../../stores/authStore'
import { signInWithGoogle } from '../../services/firebase'

WebBrowser.maybeCompleteAuthSession()

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { setUser, setSessionToken } = useAuthStore()
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FIREBASE_CLIENT_ID,
    redirectUrl: 'com.vaultly.app://',
  })

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignUp(response.authentication?.idToken)
    }
  }, [response])

  const handleGoogleSignUp = async (idToken?: string) => {
    if (!idToken) {
      Alert.alert('Error', 'Failed to get authentication token')
      return
    }

    setLoading(true)
    try {
      const result = await signInWithGoogle(idToken)
      setUser(result.user)
      setSessionToken(idToken)
    } catch (error) {
      Alert.alert('Sign Up Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#8b5cf6" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Vaultly today</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => promptAsync()}
          disabled={loading || !request}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Up with Google</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or email</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#ccc"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#ccc"
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
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  backButton: {
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
  button: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
  },
  form: {
    marginBottom: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  submitButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '700',
  },
})
