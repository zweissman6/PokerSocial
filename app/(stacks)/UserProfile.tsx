// app/(stacks)/UserProfile.tsx

import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Menu } from 'react-native-paper';
import { useUser } from '../context/UserContext';

type Session = {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatar: string;
    favoriteCardroom: string;
  };
  stakes: string;
  gameType: string;
  location: string;
  buyIn: number;
  cashOut: number;
  startTime: string;
  endTime: string;
  date: string;
  photo?: string;
  description?: string;
};

const API_URL = 'http://192.168.1.240:4000/users';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { username } = useLocalSearchParams();

  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [orderMenuVisible, setOrderMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Cardroom' },
    { key: 'stakes', label: 'Stakes' },
  ];

  const orderOptions = [
    { key: 'desc', label: 'Descending' },
    { key: 'asc', label: 'Ascending' },
  ];

  // REDIRECT IMMEDIATELY if viewing own profile
  useEffect(() => {
    if (
      currentUser &&
      username &&
      typeof username === 'string' &&
      currentUser.userName.toLowerCase() === username.toLowerCase()
    ) {
      // replace, not push
      router.replace('/(tabs)/profile');
    }
  }, [currentUser, username, router]);

  // If redirecting, render nothing (NO black flash)
  if (
    currentUser &&
    username &&
    typeof username === 'string' &&
    currentUser.userName.toLowerCase() === username.toLowerCase()
  ) {
    return null;
  }

  // Fetch user info by username
  const fetchUser = useCallback(async () => {
    if (!username) return;
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/username/${username}`);
      setUser(res.data);
    } catch (err) {
      setError('Could not find user.');
      setUser(null);
    }
  }, [username]);

  // Fetch sessions for user
  const fetchSessions = useCallback(
    async (filters: any = {}) => {
      if (!user?._id) return;
      setSessionsError(null);

      let query = Object.entries(filters)
        .map(([k, v]) => (v ? `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}` : ''))
        .filter(Boolean)
        .join('&');
      let url = `${API_URL}/${user._id}/sessions${query ? '?' + query : ''}`;

      try {
        const res = await axios.get(url);
        setSessions(res.data);
      } catch (err) {
        setSessionsError('Could not load sessions.');
        setSessions([]);
      }
    },
    [user?._id]
  );

  // Load user and their sessions
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      fetchSessions({ sortBy, order });
    }
  }, [user?._id, sortBy, order, fetchSessions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    if (user?._id) await fetchSessions({ sortBy, order });
    setRefreshing(false);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/(stacks)/PostInfo',
          params: { postId: item._id },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>{item.location}</Text>
        <Text style={styles.sessionMeta}>
          {item.stakes} {item.gameType} • {item.date}
        </Text>
        <Text numberOfLines={1} style={styles.sessionDesc}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 17 }}>{error}</Text>
      </View>
    );
  }
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#ffd700', fontSize: 17 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <FlatList
        data={sessions}
        keyExtractor={item => item._id}
        renderItem={renderSession}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* Profile Header */}
            <View style={styles.headerRow}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.headerText}>
                <Text style={styles.username}>{user.userName}</Text>
                <Text style={styles.name}>
                  {user.firstName} {user.lastName}
                </Text>
                <View style={styles.followRow}>
                  <Text style={styles.followers}>
                    Followers: {user.followers?.length || 0}
                  </Text>
                  <Text style={styles.following}>
                    Following: {user.following?.length || 0}
                  </Text>
                </View>
                <Text style={styles.cardroom}>
                  Favorite Cardroom: {user.favoriteCardroom || 'Not set'}
                </Text>
              </View>
            </View>
            {/* Sort/Order dropdowns */}
            <View style={styles.filterRow}>
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon="sort"
                    onPress={() => setSortMenuVisible(true)}
                    style={styles.filterButton}
                    labelStyle={{
                      color: '#fff',
                      fontSize: 13,
                      lineHeight: 17,
                      paddingVertical: 0,
                    }}
                  >
                    {sortOptions.find(o => o.key === sortBy)?.label || 'Sort By'}
                  </Button>
                }
                contentStyle={styles.menuContent}
              >
                {sortOptions.map(option => (
                  <Menu.Item
                    key={option.key}
                    onPress={() => {
                      setSortBy(option.key);
                      setSortMenuVisible(false);
                      fetchSessions({ sortBy: option.key, order });
                    }}
                    title={option.label}
                    titleStyle={{ color: '#fff' }}
                  />
                ))}
              </Menu>

              <Menu
                visible={orderMenuVisible}
                onDismiss={() => setOrderMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon={order === 'desc' ? 'arrow-down' : 'arrow-up'}
                    onPress={() => setOrderMenuVisible(true)}
                    style={styles.filterButton}
                    labelStyle={{ color: '#fff' }}
                  >
                    {orderOptions.find(o => o.key === order)?.label || 'Order'}
                  </Button>
                }
                contentStyle={styles.menuContent}
              >
                {orderOptions.map(option => (
                  <Menu.Item
                    key={option.key}
                    onPress={() => {
                      setOrder(option.key as 'asc' | 'desc');
                      setOrderMenuVisible(false);
                      fetchSessions({ sortBy, order: option.key });
                    }}
                    title={option.label}
                    titleStyle={{ color: '#fff' }}
                  />
                ))}
              </Menu>
            </View>
            <Text style={styles.sectionHeader}>Sessions</Text>
            {sessionsError && (
              <Text style={{ color: 'red', marginVertical: 8 }}>{sessionsError}</Text>
            )}
          </View>
        }
        contentContainerStyle={{ padding: 10 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'ios' ? 40 : 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 14,
    width: '100%',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    marginRight: 14,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  headerText: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  username: {
    color: '#ffd700',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  name: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 3,
  },
  cardroom: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  followRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  followers: {
    color: '#aaa',
    marginRight: 20,
    fontSize: 13,
  },
  following: {
    color: '#aaa',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    marginRight: 10,
    backgroundColor: '#232323',
    borderRadius: 8,
  },
  menuContent: {
    backgroundColor: '#232323',
  },
  sectionHeader: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sessionCard: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 3,
  },
  sessionTitle: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  sessionMeta: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  sessionDesc: {
    color: '#eaeaea',
    fontSize: 14,
  },
});
