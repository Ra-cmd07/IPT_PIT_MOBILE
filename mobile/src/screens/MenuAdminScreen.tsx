import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createMenuItem, deleteMenuItem, getMenuItems, toggleMenuItemAvailability, updateMenuItem } from '../api';
import { MenuItem } from '../types';

const categories = ['starter', 'main', 'dessert', 'drink'];

export default function MenuAdminScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<MenuItem>>({
    name: '',
    category: 'starter',
    price: 0,
    estimated_prep_time: 10,
    is_available: true,
  });

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems(false);
      setMenuItems(response);
    } catch (error) {
      Alert.alert('Menu error', 'Unable to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      estimated_prep_time: item.estimated_prep_time,
      is_available: item.is_available,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateMenuItem(editingId, form);
      setEditingId(null);
      setForm({ name: '', category: 'starter', price: 0, estimated_prep_time: 10, is_available: true });
      await loadMenu();
    } catch (error: any) {
      Alert.alert('Update error', error?.message || 'Unable to update item.');
    }
  };

  const createItem = async () => {
    if (!form.name || !form.category) {
      Alert.alert('Validation', 'Name and category are required.');
      return;
    }
    try {
      await createMenuItem(form);
      setForm({ name: '', category: 'starter', price: 0, estimated_prep_time: 10, is_available: true });
      await loadMenu();
    } catch (error: any) {
      Alert.alert('Create error', error?.message || 'Unable to create menu item.');
    }
  };

  const removeItem = async (id: number) => {
    try {
      await deleteMenuItem(id);
      await loadMenu();
    } catch (error: any) {
      Alert.alert('Remove error', error?.message || 'Unable to delete item.');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await toggleMenuItemAvailability(item.id, !item.is_available);
      await loadMenu();
    } catch (error: any) {
      Alert.alert('Toggle error', error?.message || 'Unable to update availability.');
    }
  };

  const availableCount = useMemo(() => menuItems.filter(item => item.is_available).length, [menuItems]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🍽️ Menu Editor</Text>
      <Text style={styles.subtitle}>{availableCount} items available</Text>

      {menuItems.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.category} • ₱{Number(item.price).toFixed(2)} • {item.estimated_prep_time} min</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.smallButton} onPress={() => startEdit(item)}>
              <Text style={styles.smallButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={() => toggleAvailability(item)}>
              <Text style={styles.smallButtonText}>{item.is_available ? 'Hide' : 'Show'}</Text>
            </Pressable>
            <Pressable style={[styles.smallButton, styles.deleteButton]} onPress={() => removeItem(item.id)}>
              <Text style={styles.smallButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{editingId ? 'Edit Item' : 'Add New Item'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          value={form.name || ''}
          onChangeText={value => setForm(prev => ({ ...prev, name: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Category"
          placeholderTextColor="#94a3b8"
          value={form.category || 'starter'}
          onChangeText={value => setForm(prev => ({ ...prev, category: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="#94a3b8"
          value={String(form.price ?? 0)}
          keyboardType="numeric"
          onChangeText={value => setForm(prev => ({ ...prev, price: Number(value) }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Prep time (minutes)"
          placeholderTextColor="#94a3b8"
          value={String(form.estimated_prep_time ?? 10)}
          keyboardType="numeric"
          onChangeText={value => setForm(prev => ({ ...prev, estimated_prep_time: Number(value) }))}
        />
        <View style={styles.checkboxRow}>
          <Pressable style={styles.checkbox} onPress={() => setForm(prev => ({ ...prev, is_available: !prev.is_available }))}>
            <Text style={styles.checkboxText}>{form.is_available ? '✓' : ''}</Text>
          </Pressable>
          <Text style={styles.checkboxLabel}>Available</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={editingId ? saveEdit : createItem}>
          <Text style={styles.buttonText}>{editingId ? 'Save Item' : 'Create Item'}</Text>
        </Pressable>
        {editingId ? (
          <Pressable style={[styles.primaryButton, styles.secondaryButton]} onPress={() => {
            setEditingId(null);
            setForm({ name: '', category: 'starter', price: 0, estimated_prep_time: 10, is_available: true });
          }}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#020617',
  } as const,
  content: {
    padding: 20,
    paddingBottom: 40,
  } as const,
  header: {
    color: '#c084fc',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  } as const,
  subtitle: {
    color: '#94a3b8',
    marginBottom: 18,
  } as const,
  itemCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  } as const,
  itemName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  } as const,
  itemMeta: {
    color: '#94a3b8',
  } as const,
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 14,
  } as const,
  smallButton: {
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  } as const,
  smallButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
  deleteButton: {
    backgroundColor: '#ef4444',
  } as const,
  formCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
  } as const,
  formTitle: {
    color: '#ffffff',
    fontSize: 20,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  } as const,
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  checkboxText: {
    color: '#34d399',
    fontWeight: '800',
  } as const,
  checkboxLabel: {
    color: '#cbd5e1',
  } as const,
  primaryButton: {
    backgroundColor: '#a855f7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  } as const,
  secondaryButton: {
    backgroundColor: '#334155',
    marginTop: 12,
  } as const,
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
};
