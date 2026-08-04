import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { useAuthStore } from './stores/authStore'
import { initializeFirebase, onAuthChange } from './services/firebase'

// Screens - Auth
import LoginScreen from './screens/auth/LoginScreen'
import SignUpScreen from './screens/auth/SignUpScreen'
import MasterPinSetupScreen from './screens/auth/MasterPinSetupScreen'
import MasterPinUnlockScreen from './screens/auth/MasterPinUnlockScreen'

// Screens - Main
import VaultScreen from './screens/VaultScreen'
import PasswordDetailScreen from './screens/PasswordDetailScreen'
import AddPasswordScreen from './screens/AddPasswordScreen'
import GeneratorScreen from './screens/GeneratorScreen'
import SettingsScreen from './screens/SettingsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="MasterPinSetup"
        component={MasterPinSetupScreen}
        options={{
          animationEnabled: false,
        } as any}
      />
    </Stack.Navigator>
  )
}

function MasterPinStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MasterPinUnlock"
        component={MasterPinUnlockScreen}
        options={{
          animationEnabled: false,
        } as any}
      />
    </Stack.Navigator>
  )
}

function VaultStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'My Passwords',
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="VaultHome"
        component={VaultScreen}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="PasswordDetail"
        component={PasswordDetailScreen}
        options={{
          headerTitle: 'Password Details',
        }}
      />
      <Stack.Screen
        name="AddPassword"
        component={AddPasswordScreen}
        options={{
          headerTitle: 'New Password',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  )
}

function GeneratorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Password Generator',
      }}
    >
      <Stack.Screen name="GeneratorHome" component={GeneratorScreen} />
    </Stack.Navigator>
  )
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Settings',
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
    </Stack.Navigator>
  )
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home'

          if (route.name === 'Vault') {
            iconName = focused ? 'lock' : 'lock-open'
          } else if (route.name === 'Generator') {
            iconName = focused ? 'key' : 'key-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#f9fafb',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen
        name="Vault"
        component={VaultStack}
        options={{
          tabBarLabel: 'Vault',
        }}
      />
      <Tab.Screen
        name="Generator"
        component={GeneratorStack}
        options={{
          tabBarLabel: 'Generator',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  const { user, isAuthenticated, setUser, setIsLoading } = useAuthStore()
  const [appReady, setAppReady] = React.useState(false)
  const [needsMasterPin, setNeedsMasterPin] = React.useState(false)

  useEffect(() => {
    // Initialize Firebase
    try {
      initializeFirebase()
    } catch (error) {
      console.error('[v0] Firebase init error:', error)
    }

    // Listen to auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setAppReady(true)

      if (firebaseUser && user === null) {
        // Check if master PIN is required
        setNeedsMasterPin(true)
      }
    })

    return () => unsubscribe()
  }, [])

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {isAuthenticated && user ? (
        needsMasterPin ? (
          <MasterPinStack />
        ) : (
          <AppTabs />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  )
}
