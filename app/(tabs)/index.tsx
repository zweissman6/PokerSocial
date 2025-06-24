import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { dummySessions } from '../../data/sessions';

// Optionally, use a helper to format times for readability:
function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummySessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.username}>{item.user.name}</Text>
                <Text style={styles.meta}>{item.stakes} • {item.location}</Text>
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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#1a1a1a' },
  card: { backgroundColor: '#232323', borderRadius: 14, padding: 14, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  meta: { color: '#aaa', fontSize: 13 },
  sessionPhoto: { width: '100%', height: 170, borderRadius: 10, marginVertical: 7 },
  sessionInfo: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  description: { color: '#eaeaea', marginTop: 6, fontSize: 14 },
});
