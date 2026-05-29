import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { getOrders } from '../api';
import { Order, OrderStatus } from '../types';
import OrderCard from '../components/OrderCard';

const statusTabs: Array<{ label: string; value: 'all' | OrderStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Done', value: 'completed' },
];

export default function OrderQueueScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2500);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    return filter === 'all' ? orders : orders.filter(order => order.status === filter);
  }, [filter, orders]);

  const countFor = (value: 'all' | OrderStatus) => {
    return value === 'all' ? orders.length : orders.filter(order => order.status === value).length;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔥 Kitchen Queue</Text>
      <Text style={styles.subtitle}>Live order tracking and status management.</Text>

      <View style={styles.tabs}>
        {statusTabs.map(tab => {
          const active = filter === tab.value;
          return (
            <Pressable key={tab.value} style={[styles.tab, active && styles.activeTab]} onPress={() => setFilter(tab.value)}>
              <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label} ({countFor(tab.value)})</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <Text style={styles.text}>Loading orders…</Text>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.text}>Try resetting the filter or create a new order.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
        />
      )}
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
    color: '#f97316',
    marginBottom: 6,
  } as const,
  subtitle: {
    color: '#94a3b8',
    marginBottom: 16,
  } as const,
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  } as const,
  tab: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  } as const,
  activeTab: {
    backgroundColor: '#34d399',
  } as const,
  tabText: {
    color: '#cbd5e1',
    fontWeight: '700',
  } as const,
  activeTabText: {
    color: '#020617',
  } as const,
  text: {
    color: '#94a3b8',
    marginTop: 24,
  } as const,
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  } as const,
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  } as const,
  list: {
    paddingBottom: 40,
    gap: 16,
  } as const,
};
