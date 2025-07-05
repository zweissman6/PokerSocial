import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
//import { dummySessions } from '../../data/sessions'; //local dummy sessions
import axios from 'axios';
import { useRouter } from 'expo-router';


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


//localhost dev url
const API_URL = 'http://192.168.68.77:4000/sessions';

// Optionally, use a helper to format times for readability:
function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FeedScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();


  useFocusEffect(
    useCallback(() => {
      fetchSessions(); // Your data fetching function
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );


  const fetchSessions = async () => {
    setError('');
    try {
      const response = await axios.get(API_URL);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Could not load sessions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 4. onRefresh handler:
  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#ffd700" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.container}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={sessions.filter(item => item.userId)}
          keyExtractor={item => item._id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/(stacks)/PostInfo', params: {postId: item._id } })}>
              <View style={styles.card}>
                <View style={styles.header}>
                  {item.userId && (
                    <Image source={{ uri: item.userId.avatar }} style={styles.avatar} />
                  )}
                  <View>
                    <Text style={styles.username}>
                      {item.userId ? item.userId.userName : "Unknown User"}
                    </Text>
                    <Text style={styles.meta}>{item.stakes} {item.gameType} • {item.location}</Text>
                    <Text style={styles.meta}>{item.date}</Text>
                  </View>
                </View>
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.sessionPhoto} />
                ) : null}
                <Text style={styles.sessionInfo}>
                  Buy-in: ${item.buyIn} | Cash-out: ${item.cashOut}
                </Text>
                <Text style={styles.meta}>
                  Start: {formatTime(item.startTime)} • End: {formatTime(item.endTime)}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>  
          )}
        />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, paddingTop: Platform.OS === 'ios' ? 72 : 12, backgroundColor: '#1a1a1a' },
  card: { backgroundColor: '#232323', borderRadius: 14, padding: 14, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  meta: { color: '#aaa', fontSize: 13 },
  sessionPhoto: { width: '100%', height: 170, borderRadius: 10, marginVertical: 7 },
  sessionInfo: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  description: { color: '#eaeaea', marginTop: 6, fontSize: 14 },
});
