import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVaultStore } from '../stores/vaultStore'
import { useAuthStore } from '../stores/authStore'
import { getPasswords } from '../services/firebase'

export default function VaultScreen({ navigation }: any) {
  const {
    passwords,
    searchQuery,
    setSearchQuery,
    setPasswords,
    setIsLoading,
    isLoading,
    getFilteredPasswords,
  } = useVaultStore()
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPasswords()
  }, [user])

  const loadPasswords = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getPasswords(user.uid)
      setPasswords(data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load passwords')
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPasswords()
    setRefreshing(false)
  }

  const filteredPasswords = getFilteredPasswords()

  const renderPasswordItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.passwordItem}
      onPress={() => navigation.navigate('PasswordDetail', { id: item.id })}
    >
      <View style={styles.passwordItemLeft}>
        <View style={styles.tagBadge}>
          <Ionicons name="lock" size={16} color="#fff" />
        </View>
        <View style={styles.passwordInfo}>
          <Text style={styles.passwordName}>{item.siteName}</Text>
          <Text style={styles.passwordUser}>{item.username || item.email || '***'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  if (isLoading && passwords.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search passwords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#ccc"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {filteredPasswords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-open" size={48} color="#ddd" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No results found' : 'No passwords yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first password to get started'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPassword')}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Password</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPasswords}
          renderItem={renderPasswordItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8b5cf6']} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPassword')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  passwordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passwordInfo: {
    flex: 1,
  },
  passwordName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  passwordUser: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
})
