import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { useAuthStore } from '../../stores/authStore'
import { signInWithGoogle } from '../../services/firebase'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false)
  const { setUser, setSessionToken } = useAuthStore()
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FIREBASE_CLIENT_ID,
    redirectUri: 'com.vaultly.app://',
  })

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication?.idToken)
    }
  }, [response])

  const handleGoogleSignIn = async (idToken?: string) => {
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
      Alert.alert('Sign In Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vaultly</Text>
        <Text style={styles.subtitle}>Secure Password Manager</Text>
        <Text style={styles.description}>
          Keep your passwords safe and accessible anywhere
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => promptAsync()}
          disabled={loading || !request}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In with Google</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Create one</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure end-to-end encrypted storage</Text>
          <Text style={styles.footerText}>Your data, your control</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#8b5cf6',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 24,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  linkBold: {
    color: '#8b5cf6',
    fontWeight: '700',
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
})
