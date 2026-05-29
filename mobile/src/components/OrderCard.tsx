import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { updateOrderStatus } from '../api';
import { Order, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; background: string }> = {
  pending: { label: 'Pending', color: '#f97316', background: '#fef3c7' },
  preparing: { label: 'Preparing', color: '#ef4444', background: '#fee2e2' },
  ready: { label: 'Ready', color: '#22c55e', background: '#dcfce7' },
  completed: { label: 'Done', color: '#8b5cf6', background: '#ede9fe' },
  cancelled: { label: 'Cancelled', color: '#64748b', background: '#e2e8f0' },
};

export default function OrderCard({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false);
  const config = statusConfig[order.status] || statusConfig.pending;

  const nextStatus = (current: OrderStatus): OrderStatus => {
    const steps: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];
    const index = steps.indexOf(current);
    return index < steps.length - 1 ? steps[index + 1] : current;
  };

  const handleUpdate = async () => {
    if (order.status === 'completed') return;
    setLoading(true);
    try {
      await updateOrderStatus(order.id, nextStatus(order.status));
    } catch (error: any) {
      Alert.alert('Update failed', error?.message || 'Could not update order status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: config.background }]}> 
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.meta}>Table {order.table_number}</Text>
      <View style={styles.itemsSection}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.menu_item_name || item.menu_item?.name || `Item ${item.id}`}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
          </View>
        ))}
      </View>
      <View style={styles.rowSpace}>
        <Text style={styles.meta}>Total items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
        {order.total_price != null ? <Text style={styles.meta}>₱{Number(order.total_price).toFixed(2)}</Text> : null}
      </View>
      <Pressable
        style={[styles.button, order.status === 'completed' && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={loading || order.status === 'completed'}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : order.status === 'completed' ? 'Order Complete' : `Mark as ${nextStatus(order.status).toUpperCase()}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  } as const,
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as const,
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as const,
  orderNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  } as const,
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  } as const,
  statusText: {
    fontWeight: '700',
  } as const,
  meta: {
    color: '#94a3b8',
    marginBottom: 10,
  } as const,
  itemsSection: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  } as const,
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as const,
  itemName: {
    color: '#ffffff',
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  } as const,
  itemQty: {
    color: '#94a3b8',
    fontWeight: '700',
  } as const,
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  } as const,
  disabledButton: {
    backgroundColor: '#475569',
  } as const,
  buttonText: {
    color: '#020617',
    fontWeight: '800',
  } as const,
};
