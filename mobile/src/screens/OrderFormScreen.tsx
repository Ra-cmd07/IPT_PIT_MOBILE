import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createOrder, getMenuItems } from '../api';
import { MenuItem } from '../types';

interface OrderLineItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function OrderFormScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [tableNumber, setTableNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoadingMenu(true);
        const items = await getMenuItems(true);
        setMenuItems(items);
      } catch (error) {
        Alert.alert('Menu error', 'Unable to load menu items.');
      } finally {
        setLoadingMenu(false);
      }
    };
    loadMenu();
  }, []);

  const addItem = (item: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(entry => entry.menuItem.id === item.id);
      if (existing) {
        return prev.map(entry => entry.menuItem.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setOrderItems(prev => prev.filter(entry => entry.menuItem.id !== id));
  };

  const getTotalPrice = () => {
    return orderItems.reduce((sum, entry) => sum + Number(entry.menuItem.price) * entry.quantity, 0);
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Order validation', 'Please add at least one menu item.');
      return;
    }

    const payload = {
      table_number: Number(tableNumber) || 1,
      items: orderItems.map(entry => ({ id: entry.menuItem.id, quantity: entry.quantity })),
      notes,
    };

    setLoading(true);
    try {
      await createOrder(payload);
      Alert.alert('Order created', 'Your order has been submitted.');
      setOrderItems([]);
      setTableNumber('1');
      setNotes('');
    } catch (error: any) {
      Alert.alert('Order failed', error?.message || 'Unable to create order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📝 Create New Order</Text>
      <Text style={styles.subtitle}>Select available menu items and submit order to the kitchen queue.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Table Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={tableNumber}
          onChangeText={setTableNumber}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Menu</Text>
        {loadingMenu ? (
          <Text style={styles.text}>Loading menu…</Text>
        ) : (
          <FlatList
            data={menuItems}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.menuRow}>
                <View style={styles.menuText}>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <Text style={styles.menuMeta}>{item.category} • ₱{Number(item.price).toFixed(2)}</Text>
                </View>
                <Pressable style={styles.addButton} onPress={() => addItem(item)}>
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Special instructions or table details"
          placeholderTextColor="#94a3b8"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {orderItems.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {orderItems.map(entry => (
            <View key={entry.menuItem.id} style={styles.summaryRow}>
              <View>
                <Text style={styles.menuName}>{entry.menuItem.name}</Text>
                <Text style={styles.menuMeta}>Qty: {entry.quantity}</Text>
              </View>
              <Pressable style={styles.removeButton} onPress={() => removeItem(entry.menuItem.id)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotal}>₱{getTotalPrice().toFixed(2)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.text}>Add menu items to build your order.</Text>
      )}

      <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Create Order'}</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  } as const,
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#34d399',
    marginBottom: 6,
  } as const,
  subtitle: {
    color: '#94a3b8',
    marginBottom: 20,
  } as const,
  section: {
    marginBottom: 20,
  } as const,
  sectionTitle: {
    color: '#cbd5e1',
    fontWeight: '700',
    marginBottom: 10,
  } as const,
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    color: '#ffffff',
    padding: 14,
  } as const,
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  } as const,
  menuRow: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  menuText: {
    flex: 1,
    marginRight: 12,
  } as const,
  menuName: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  } as const,
  menuMeta: {
    color: '#94a3b8',
  } as const,
  addButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  } as const,
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  } as const,
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  } as const,
  removeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  } as const,
  summaryTotal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  } as const,
  text: {
    color: '#94a3b8',
    marginBottom: 20,
  } as const,
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  } as const,
  disabledButton: {
    opacity: 0.65,
  } as const,
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  } as const,
};
