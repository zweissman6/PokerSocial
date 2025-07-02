// /app/(stacks)/PostInfo.tsx

import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, Menu, TextInput } from 'react-native-paper';

const API_URL = 'http://172.20.10.2:4000/sessions';

type PostType = {
  _id: string;
  userId: {
    userName: string;
    avatar: string;
    favoriteCardroom: string;
  };
  stakes: string;
  gameType: string;
  location: string;
  buyIn: number;
  cashOut: number;
  date: string;
  photo?: string;
  description?: string;
  rungood?: number;
  comments?: any[];
};

export default function PostInfo() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();

  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [rungood, setRungood] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  // TODO: Detect if current user is owner
  const isOwner = true; // Replace with your logic

    useEffect(() => {
        if (!postId) return;

        console.log('postId:', postId);
        console.log('Fetching:', `${API_URL}/${postId}`);

        setLoading(true);
        setError(null);

        axios.get(`${API_URL}/${postId}`)
            .then(res => {
            setPost(res.data);
            setRungood(res.data.rungood || 0);
            setComments(res.data.comments || []);
            })
            .catch((e) => {
            setError('Could not load post');
            console.log('Error fetching post:', e);
            })
            .finally(() => setLoading(false));
    }, [postId]);


  function handleRungood() {
    setRungood(val => val + 1);
    // TODO: POST rungood to backend
  }

  function handleAddComment() {
    if (!comment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        _id: Math.random().toString(36),
        user: { userName: 'me', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
        text: comment,
        replies: []
      }
    ]);
    setComment('');
    // TODO: POST comment to backend
  }

  function handleDelete() {
    Alert.alert("Delete", "Delete post (coming soon)");
    setMenuVisible(false);
  }

  function handleEdit() {
    Alert.alert("Edit", "Edit post (coming soon)");
    setMenuVisible(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error || "Post not found."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.userRow}>
          <Image source={{ uri: post.userId.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{post.userId.userName}</Text>
            <Text style={styles.cardroom}>{post.userId.favoriteCardroom}</Text>
          </View>
        </View>
        {isOwner && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                style={styles.menuIcon}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item onPress={handleEdit} title="Edit (coming soon)" />
            <Menu.Item onPress={handleDelete} title="Delete (coming soon)" />
          </Menu>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 30 }}>
        {post.photo && (
          <Image source={{ uri: post.photo }} style={styles.photo} />
        )}
        <View style={styles.details}>
          <Text style={styles.sessionMeta}>{post.stakes} {post.gameType} • {post.location}</Text>
          <Text style={styles.sessionMeta}>{post.date}</Text>
          <Text style={styles.sessionInfo}>
            Buy-in: ${post.buyIn} | Cash-out: ${post.cashOut}
          </Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {/* RunGood (Like) Button */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.rungoodButton} onPress={handleRungood}>
            <Text style={styles.chipIcon}>🍀</Text>
            <Text style={styles.chipCount}>{rungood} RunGood</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Table Talk</Text>
          {comments.map(comment => (
            <View key={comment._id} style={styles.commentRow}>
              <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
              <View>
                <Text style={styles.commentUser}>{comment.user.userName}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                {/* Replies */}
                {comment.replies?.map((reply: any) => (
                  <View key={reply._id} style={styles.replyRow}>
                    <Image source={{ uri: reply.user.avatar }} style={styles.replyAvatar} />
                    <Text style={styles.replyUser}>{reply.user.userName}</Text>
                    <Text style={styles.replyText}>{reply.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          {/* Add Comment */}
          <View style={styles.addCommentRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              style={styles.commentInput}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
              <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181818' },
  scroll: { padding: 16 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 55 : 12, paddingHorizontal: 8,
    justifyContent: 'space-between', backgroundColor: '#1a1a1a'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818', // match your main background if you want
  },
  backButton: { padding: 6, marginRight: 8 },
  backButtonText: { color: '#ffd700', fontSize: 30, fontWeight: 'bold' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 9, borderWidth: 2, borderColor: '#ffd700' },
  username: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  cardroom: { color: '#bbb', fontSize: 13 },
  menuIcon: { marginLeft: 0 },
  menuContent: { backgroundColor: '#232323' },
  photo: { width: '100%', height: 200, borderRadius: 12, marginVertical: 12 },
  details: { marginBottom: 8 },
  sessionMeta: { color: '#aaa', fontSize: 14, marginTop: 4 },
  sessionInfo: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  description: { color: '#fff', marginTop: 8, fontSize: 15 },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  rungoodButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#232323', borderRadius: 8, padding: 7, marginRight: 10 },
  chipIcon: { fontSize: 18, marginRight: 6 },
  chipCount: { color: '#ffd700', fontWeight: 'bold', fontSize: 15 },
  commentsSection: { marginTop: 18 },
  commentsHeader: { color: '#ffd700', fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#ffd700' },
  commentUser: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  commentText: { color: '#fff', fontSize: 14, marginBottom: 3 },
  replyRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 26, marginBottom: 2 },
  replyAvatar: { width: 22, height: 22, borderRadius: 11, marginRight: 6, borderWidth: 1, borderColor: '#ffd700' },
  replyUser: { color: '#bbb', fontWeight: 'bold', fontSize: 13, marginRight: 6 },
  replyText: { color: '#ddd', fontSize: 13 },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  commentInput: { flex: 1, backgroundColor: '#232323', color: '#fff', borderRadius: 7, paddingHorizontal: 12, height: 36, fontSize: 14 },
  sendButton: { marginLeft: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#232323', borderRadius: 6 }
});
