import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import { UserProfile } from '../types';

export default function ProfileScreen() {
  const { user, signOut, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    address: user?.profile?.address || '',
    age: user?.profile?.age?.toString() || '',
    birthday: user?.profile?.birthday || '',
  });

  useEffect(() => {
    setProfile(user);
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        address: user.profile?.address || '',
        age: user.profile?.age?.toString() || '',
        birthday: user.profile?.birthday || '',
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        address: form.address,
        age: form.age ? Number(form.age) : null,
        birthday: form.birthday,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.text}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Pressable style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{profile.username}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{`${profile.first_name} ${profile.last_name}`}</Text>
        {profile.profile?.picture ? (
          <Image source={{ uri: profile.profile.picture }} style={styles.avatar} />
        ) : null}
      </View>

      {editing ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#94a3b8"
            value={form.first_name}
            onChangeText={value => setForm(prev => ({ ...prev, first_name: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#94a3b8"
            value={form.last_name}
            onChangeText={value => setForm(prev => ({ ...prev, last_name: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={form.email}
            onChangeText={value => setForm(prev => ({ ...prev, email: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#94a3b8"
            value={form.address}
            onChangeText={value => setForm(prev => ({ ...prev, address: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#94a3b8"
            value={form.age}
            keyboardType="numeric"
            onChangeText={value => setForm(prev => ({ ...prev, age: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            placeholderTextColor="#94a3b8"
            value={form.birthday}
            onChangeText={value => setForm(prev => ({ ...prev, birthday: value }))}
          />
          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save changes'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setEditing(false)}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.primaryButton} onPress={() => setEditing(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#020617',
  } as const,
  content: {
    padding: 24,
    paddingBottom: 40,
  } as const,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  } as const,
  title: {
    color: '#34d399',
    fontSize: 28,
    fontWeight: '900',
  } as const,
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  } as const,
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  } as const,
  label: {
    color: '#94a3b8',
    marginTop: 12,
    marginBottom: 6,
  } as const,
  value: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 18,
    marginTop: 14,
  } as const,
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  } as const,
  input: {
    backgroundColor: '#020617',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    color: '#ffffff',
    padding: 14,
    marginBottom: 14,
  } as const,
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  } as const,
  secondaryButton: {
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  } as const,
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
  secondaryText: {
    color: '#cbd5e1',
    fontWeight: '700',
  } as const,
  disabledButton: {
    opacity: 0.7,
  } as const,
  centeredContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  text: {
    color: '#cbd5e1',
  } as const,
};
