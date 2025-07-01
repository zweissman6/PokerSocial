import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

const API_URL = 'http://10.91.71.232:4000/users';

const ProfileHeader = ({ user }: { user: any }) => (
  <View style={styles.headerRow}>
    <Image source={{ uri: user.avatar }} style={styles.avatar} />
    <View style={styles.headerText}>
      <Text style={styles.username}>{user.userName}</Text>
      <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
      <View style={styles.followRow}>
        <Text style={styles.followers}>Followers: {user.followers?.length || 0}</Text>
        <Text style={styles.following}>Following: {user.following?.length || 0}</Text>
      </View>
      <Text style={styles.cardroom}>
        Favorite Cardroom: {user.favoriteCardroom || 'Not set'}
      </Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const { user, setUser, logout } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);
  const [orderMenuVisible, setOrderMenuVisible] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('date');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');

  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Cardroom' },
    { key: 'stakes', label: 'Stakes' },
  ];

  const orderOptions = [
    { key: 'desc', label: 'Descending' },
    { key: 'asc', label: 'Ascending' },
  ];

  // Fetch user info on refresh/focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
      fetchSessions({ sortBy, order });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, sortBy, order])
  );

  // Separate refresh for user info
  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/${user._id}`);
      setUser(res.data);
    } catch (err) {
      setError('Could not refresh user info.');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch sessions for user
  const fetchSessions = async (filters: any = {}) => {
    if (!user) return;
    setSessionsLoading(true);
    setSessionsError(null);

    let query = Object.entries(filters)
      .map(([k, v]) => v ? `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}` : '')
      .filter(Boolean)
      .join('&');
    let url = `${API_URL}/${user._id}/sessions${query ? '?' + query : ''}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setSessionsError('Could not load sessions.');
    }
    setSessionsLoading(false);
  };

  useEffect(() => {
    fetchSessions({ sortBy, order });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, sortBy, order]);

  // UI: Session preview
  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.sessionTitle}>{item.location}</Text>
      <Text style={styles.sessionMeta}>{item.stakes} {item.gameType} • {item.date}</Text>
      <Text numberOfLines={1} style={styles.sessionDesc}>{item.description}</Text>
    </View>
  );

  if (!user) return null;

  return (
    <View style={styles.main}>
      <FlatList
        data={sessions}
        keyExtractor={item => item._id}
        renderItem={renderSession}
        ListHeaderComponent={
          <>
            {/* Profile Header */}
            <View style={styles.headerRow}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.headerText}>
                <Text style={styles.username}>{user.userName}</Text>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                <View style={styles.followRow}>
                  {/*TODO: IMPLEMENT FOLLOWERS AND FOLLOWING LIST*/}
                  <Text style={styles.followers}>Followers: {user.followers?.length || 0}</Text>
                  <Text style={styles.following}>Following: {user.following?.length || 0}</Text>
                </View>
                <Text style={styles.cardroom}>
                  Favorite Cardroom: {user.favoriteCardroom || 'Not set'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: Platform.OS === 'ios' ? 24 : 24,
                right: 18,
                backgroundColor: '#d9534f',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 6,
                zIndex: 1000,
              }}
              onPress={logout}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Log Out</Text>
            </TouchableOpacity>

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
                    labelStyle={{ color: '#fff', fontSize: 13, lineHeight: 17, paddingVertical: 0 }}
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

            <Text style={styles.sectionHeader}>My Sessions</Text>
            {sessionsLoading && (
              <ActivityIndicator size="large" color="#ffd700" style={{ marginVertical: 16 }} />
            )}
            {sessionsError && (
              <Text style={{ color: 'red', marginVertical: 8 }}>{sessionsError}</Text>
            )}
            {!sessionsLoading && sessions.length === 0 && (
              <Text style={{ color: '#aaa', marginVertical: 16 }}>No sessions found.</Text>
            )}
          </>
        }
        contentContainerStyle={{ padding: 16 }}
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
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  logoutRow: {
    alignItems: 'center',
    marginBottom: 16,
  },  sessionCard: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
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
  logoutTopButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 24,
    right: 18,
    zIndex: 1000,
    backgroundColor: '#d9534f', // Red
    borderRadius: 7,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 26,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
},

});
